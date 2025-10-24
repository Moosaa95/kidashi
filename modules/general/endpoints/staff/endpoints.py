from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.vendor.models import Vendor
from modules.trust_circle.models import TrustCircle
from modules.woman.models import Woman
from modules.asset.models import Asset


class GetDashboardMetrics(APIView):
    @extend_schema(
        tags=["Dashboard"],
        summary="Get Dashboard Metrics",
        description="Fetch comprehensive dashboard metrics including vendors, circles, women, and assets/loans data",
    )
    def post(self, request):
        response_dict = dict(status=False)

        try:
            vendor_stats = Vendor.get_vendor_metrics()
            circle_stats = TrustCircle.get_trust_circle_metrics()
            woman_stats = Woman.get_women_metrics()
            asset_stats = Asset.fetch_asset_summaries()
            print(
                "Vendor Stats:",
                vendor_stats,
                "Circle Stats:",
                circle_stats,
                "woman Stats:",
                woman_stats,
                "Asset Stats:",
                asset_stats,
            )

            metrics_data = {
                "vendors": {
                    "total_vendors": vendor_stats["total_vendors"],
                    "active_vendors": vendor_stats["active_vendors"],
                    "pending_vendors": vendor_stats["pending_vendors"],
                    "rejected_vendors": vendor_stats["rejected_vendors"],
                    "suspended_vendors": vendor_stats["suspended_vendors"],
                },
                "trust_circles": {
                    "total_circles": circle_stats["total_circles"],
                    "active_circles": circle_stats["active_circles"],
                    "forming_circles": circle_stats["forming_circles"],
                    "eligible_circles": circle_stats["eligible_circles"],
                },
                "women": {
                    "total_women": woman_stats["total_women"],
                    "active_women": woman_stats["active_women"],
                    "inactive_women": woman_stats["inactive_women"],
                    "suspended_women": woman_stats["suspended_women"],
                },
                "assets": {
                    "total_assets": asset_stats["total_assets"],
                    "total_value_disbursed": asset_stats["total_asset_value"],
                    "requested_assets": asset_stats["total_pending_assets"],
                    "running_assets": asset_stats["total_ongoing_assets"],
                    "completed_assets": asset_stats["total_completed_assets"],
                    "rejected_assets": asset_stats["total_failed_assets"],
                    "failed_assets": asset_stats["total_failed_assets"],
                    "total_ongoing_value": asset_stats["total_ongoing_value"],
                    "completed_assets_value": asset_stats["total_completed_value"],
                },
            }

            response_dict.update(status=True, message="Dashboard metrics retrieved successfully", data=metrics_data)
            return Response(response_dict, status=status.HTTP_200_OK)

        except Exception as e:
            response_dict.update(message=f"Error retrieving dashboard metrics: {str(e)}")
            return Response(response_dict, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
