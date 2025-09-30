from django.db.models import Q
from modules.asset.enums import AssetActivityType
from modules.asset.tasks import create_loan_in_payrep
from modules.security.enums import OtpPurpose
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


class CreateAsset(APIView):
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
        product_id = validated_data.get("product_id")
        vendor_id = validated_data.get("vendor_id")
        otp = validated_data.get("otp")

        otp_result = OTP.validate(purpose=OtpPurpose.ASSET_REQUEST, input_otp=otp)
        if not otp_result.get("status"):
            return Response(data=dict(status=False, message=otp_result.get("message")), status=status.HTTP_400_BAD_REQUEST)

        asset = Asset.create_asset(**validated_data)
        if not asset:
            return Response(
                data=dict(status=False, message="Failed to create asset"),
                status=status.HTTP_400_BAD_REQUEST,
            )

        log = AssetActivity.create_activity(asset_id=asset.id, activity_type=AssetActivityType.ASSET_REQUEST, description="Asset requested on kidashi", performed_by_id=vendor_id)
        create_loan_in_payrep.delay(asset_id=str(asset.id), token=request.payrep_token, product_id=product_id, log_id=log.id)

        return Response(
            data=dict(status=True, message="Asset created in Kidashi, syncing with PayRep", asset_id=asset.id),
            status=status.HTTP_201_CREATED,
        )


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


class GetAsset(APIView):
    @extend_schema(
        tags=["Kidashi Assets"],
        description="Get a single asset by ID or loan_id",
        request=GetAssetRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetAssetResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=AssetSerializer(),
                ),
            )
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

        return Response(data=dict(status=True, message="Asset fetched successfully", data=asset), status=status.HTTP_200_OK)
