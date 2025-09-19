from django.urls import path
from modules.trust_circle.endpoints.staff.endpoints import (
    FetchTrustCirclesFilter,
    GetTrustCircleDetail,
)

urlpatterns = (
    path("fetch_trust_circles", FetchTrustCirclesFilter.as_view()),
    path("get_trust_circle_detail", GetTrustCircleDetail.as_view()),
)
