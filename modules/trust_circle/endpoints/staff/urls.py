from django.urls import path
from modules.trust_circle.endpoints.staff.endpoints import (
    FetchTrustCirclesWithFilter,
)

urlpatterns = (path("fetch_trust_circles_with_filter", FetchTrustCirclesWithFilter.as_view(), name="fetch_trust_circles_with_filter"),)
