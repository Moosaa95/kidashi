from django.db.models import Q
from modules.asset.enums import AssetActivityType
from modules.asset.tasks import create_loan_in_payrep
from modules.security.enums import OtpPurpose
from modules.security.mixins import IsPayrepAuthenticatedMixin
from modules.security.models import OTP
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer

# from modules.security.mixins import IsPayrepAuthenticatedMixin
from modules.asset.models import Asset, AssetActivity
from modules.asset.serializers import (
    AssetCreateRequestSerializer,
    AssetSerializer,
    FetchAssetsFilterSerializer,
    GetAssetRequestSerializer,
)
from modules.service.enums import ServiceCode
from modules.service.models import Service


class CreateAsset(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Kidashi Assets"],
        description="Create a new asset request for a woman",
        request=AssetCreateRequestSerializer,
        responses={
            201: inline_serializer(
                name="CreateAssetResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    asset_id=serializers.UUIDField(),
                    loan_id=serializers.UUIDField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = AssetCreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        product_code = validated_data.get("product_code")
        vendor_id = validated_data.get("vendor_id")
        otp = validated_data.pop("otp")
        try:

            otp_result = OTP.validate(purpose=OtpPurpose.ASSET_REQUEST, input_otp=otp, subject_id=str(vendor_id))
            if not otp_result.get("status"):
                return Response(data=dict(status=False, message=otp_result.get("message")), status=status.HTTP_400_BAD_REQUEST)
            asset = Asset.create_asset(**validated_data)
            if not asset:
                return Response(
                    data=dict(status=False, message="Failed to create asset"),
                    status=status.HTTP_400_BAD_REQUEST,
                )

            log = AssetActivity.create_activity(asset_id=asset.id, activity_type=AssetActivityType.ASSET_REQUEST, description="Asset requested on kidashi", performed_by_id=vendor_id)
            create_loan_in_payrep(asset_id=str(asset.id), token=request.payrep_token, product_code=product_code, log_id=log.id)

            return Response(
                data=dict(status=True, message="Asset created in Kidashi, syncing with PayRep", asset_id=str(asset.id)),
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print("========season", e)
            return Response(data=dict(status=False, message="An unexpected error has occured, please contact support"), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FetchAssets(APIView):
    @extend_schema(
        tags=["Kidashi Assets"],
        description="Fetch assets with optional filters",
        request=FetchAssetsFilterSerializer,
        responses={
            200: inline_serializer(
                name="FetchAssetsResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=serializers.ListField(child=AssetSerializer()),
                ),
            )
        },
    )
    def post(self, request):
        serializer = FetchAssetsFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        filters = validated.get("filters", {}) or {}
        # wants_summaries = validated.get("wants_summaries", False)

        condition = Q()
        for key, value in filters.items():
            if key in ("date", "start_date", "end_date"):
                continue
            condition.add(Q(**{key: value}), Q.AND)

        assets = Asset.fetch_assets(conditions=condition)
        return Response(data=dict(status=True, message="Assets fetched successfully", data=assets), status=status.HTTP_200_OK)


class GetAsset(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Kidashi Assets"],
        summary="Fetch a single asset and portfolio summary",
        description="""
        This endpoint retrieves details of a single asset in the Kidashi system.

        You can fetch an asset using either:
        - **asset_id** (UUID of the asset in Kidashi)
        - **loan_id** (UUID of the loan from PayRep bank system)

        In addition to the asset details, the response also includes a **summary** of the
        member's portfolio (ongoing, active, closed, unsuccessful assets and their values).
        """,
        request=GetAssetRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetAssetResponse",
                fields=dict(
                    status=serializers.BooleanField(help_text="Indicates if the request was successful"),
                    message=serializers.CharField(help_text="Human-readable message"),
                    data=AssetSerializer(help_text="Detailed information about the asset"),
                    summary=serializers.DictField(
                        help_text="Portfolio statistics for the woman who owns this asset. " "Includes total pipeline, active, closed, and unsuccessful assets, " "with values and markups."
                    ),
                ),
            ),
            404: inline_serializer(
                name="GetAssetNotFound",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
            400: inline_serializer(
                name="GetAssetBadRequest",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = GetAssetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asset_id = serializer.validated_data.get("asset_id")
        loan_id = serializer.validated_data.get("loan_id")

        filters = {"id": asset_id} if asset_id else {"loan_id": loan_id}
        asset = Asset.get_asset(**filters)
        if not asset:
            return Response(dict(status=False, message="Asset not found"), status=status.HTTP_404_NOT_FOUND)

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        if not integration:
            return Response(dict(status=False, message="No active PayRep integration found"), status=status.HTTP_400_BAD_REQUEST)

        provider = integration.get_client()
        cba_response = provider.fetch_cba_customer_asset_metric(asset.get("loan_id"), token=request.payrep_token)

        metrics = dict(
            disbursement_date=cba_response.get("disbursement_date"),
            maturity_date=cba_response.get("maturity_date"),
            amount_unpaid=cba_response.get("amount_unpaid", 0),
            amount_repaid=cba_response.get("amount_repaid", 0),
            repayment_progress=cba_response.get("repayment_progress", 0),
            principal_balance_left=cba_response.get("principal_balance_left", 0),
        )

        member_id = asset["woman_id"] if isinstance(asset, dict) else getattr(asset.woman, "id", None)
        summary = Asset.fetch_asset_summaries(member_id=member_id)

        return Response(
            {
                "status": True,
                "message": "Asset fetched successfully",
                "data": asset,
                "summary": summary,
                "metrics": metrics,
            },
            status=status.HTTP_200_OK,
        )
