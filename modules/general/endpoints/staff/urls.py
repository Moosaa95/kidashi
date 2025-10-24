from django.urls import path
from modules.general.endpoints.staff.endpoints import GetDashboardMetrics

urlpatterns = [
    path("get_dashboard_metrics", GetDashboardMetrics.as_view(), name="get_dashboard_metrics"),
]
