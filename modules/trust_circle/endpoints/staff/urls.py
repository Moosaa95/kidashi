from django.urls import path
from modules.trust_circle.endpoints.staff.endpoints import (
    FetchTrustCirclesWithFilter,
    GetTrustCircleDetail,
)

urlpatterns = (
    path("fetch_trust_circles", FetchTrustCirclesWithFilter.as_view(), name="fetch_trust_circles_with_filter"),
    path("get_trust_circle_detail", GetTrustCircleDetail.as_view(), name="get_trust_circle_detail"),
)
