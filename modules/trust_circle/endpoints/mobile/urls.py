from django.urls import path
from modules.trust_circle.endpoints.mobile.endpoints import CreateTrustCircle

urlpatterns = (path("create_trust_circle", CreateTrustCircle.as_view()),)
