from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from drf_spectacular.utils import extend_schema, inline_serializer

from modules.asset.models import Asset
from modules.asset.serializers import (
    FetchAssetsFilterSerializer,
    GetAssetRequestSerializer,
)
from modules.service.enums import ServiceCode
from modules.service.models import Service


class FetchAssetsWithFilter(APIView):
    @extend_schema(
        tags=["Kidashi Assets - Staff"],
        summary="Fetch Assets with Filters (Staff)",
        description="Fetch all assets with optional filters and summary metrics for staff dashboard",
        request=FetchAssetsFilterSerializer,
        responses={
            200: inline_serializer(
                name="FetchAssetsStaffResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(required=False),
                    data=serializers.ListField(child=serializers.DictField()),
                    summary=serializers.DictField(required=False, help_text="Asset metrics summary"),
                ),
            )
        },
    )
    def post(self, request):
        serializer = FetchAssetsFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        filters = validated.get("filters", {}) or {}
        count = validated.get("count")
        include_summary = validated.get("include_summary", False)

        and_condition = Q()

        # Extract date-related filters
        date = filters.pop("date", None)
        start_date = filters.pop("start_date", None)
        end_date = filters.pop("end_date", None)

        if date:
            and_condition &= Q(created_at__date=date)
        if start_date and end_date:
            and_condition &= Q(created_at__date__range=[start_date, end_date])
        elif start_date:
            and_condition &= Q(created_at__date__gte=start_date)
        elif end_date:
            and_condition &= Q(created_at__date__lte=end_date)

        # Apply remaining filters
        for key, value in filters.items():
            if key not in ("date", "start_date", "end_date"):
                and_condition &= Q(**{key: value})

        # Fetch assets
        if and_condition == Q() and not count:
            assets = Asset.fetch_assets()
        else:
            assets = Asset.fetch_assets(conditions=and_condition if and_condition != Q() else None, count=count)

        response_data = {
            "status": True,
            "message": "Assets fetched successfully",
            "data": list(assets),
        }

        # Include summary if requested
        if include_summary:
            summary = Asset.fetch_asset_summaries(conditions=and_condition if and_condition != Q() else None)
            response_data["summary"] = summary

        return Response(response_data, status=status.HTTP_200_OK)


class GetAssetDetail(APIView):
    @extend_schema(
        tags=["Kidashi Assets - Staff"],
        summary="Get Asset Details (Staff)",
        description="""
        Fetch detailed information about a specific asset by asset_id or loan_id.

        For active loans (RUNNING or APPROVED status), this endpoint also fetches
        real-time repayment metrics from the PayRep banking system including:
        - Disbursement and maturity dates
        - Amount repaid and unpaid
        - Repayment progress percentage
        - Principal balance remaining
        """,
        request=GetAssetRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetAssetDetailStaffResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=serializers.DictField(help_text="Contains 'asset' object and optional 'metrics' object for active loans"),
                ),
            ),
            404: inline_serializer(
                name="GetAssetNotFoundStaffResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
            400: inline_serializer(
                name="GetAssetBadRequestStaffResponse",
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

        response_data = {"status": True, "message": "Asset fetched successfully", "data": {"asset": asset}}

        if asset.get("loan_id") and asset.get("status") in ["RUNNING", "APPROVED", "CLOSED"]:
            try:
                service = Service.get_service(code=ServiceCode.CBA_CODE)
                if not service:
                    return Response(response_data, status=status.HTTP_200_OK)

                integration = service.active_integrations(channel="API").first()
                if not integration:
                    print("No active API integration found for CBA service")
                    return Response(response_data, status=status.HTTP_200_OK)

                provider = integration.get_client()
                cba_response = provider.fetch_cba_customer_asset_metric_staff(str(asset.get("loan_id")))

                if cba_response.get("req_status") and cba_response.get("status"):
                    metrics_data = cba_response.get("data", {})
                    metrics = dict(
                        disbursement_date=metrics_data.get("disbursement_date"),
                        maturity_date=metrics_data.get("maturity_date"),
                        amount_unpaid=metrics_data.get("amount_unpaid", 0),
                        amount_repaid=metrics_data.get("amount_repaid", 0),
                        repayment_progress=metrics_data.get("repayment_progress", 0),
                        principal_balance_left=metrics_data.get("principal_balance_left", 0),
                    )
                    response_data["data"]["metrics"] = metrics
                else:
                    print(f"Failed to fetch metrics from Shinobi: {cba_response.get('message', 'Unknown error')}")

            except Exception as e:
                print(f"Error fetching asset metrics: {e}")

        return Response(response_data, status=status.HTTP_200_OK)
