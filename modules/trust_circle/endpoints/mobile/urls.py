from django.urls import path
from modules.trust_circle.endpoints.mobile.endpoints import (
    CreateTrustCircle,
    FetchTrustCircles,
)

urlpatterns = (
    path("create_trust_circle", CreateTrustCircle.as_view()),
    path("fetch_trust_circles", FetchTrustCircles.as_view()),
)
