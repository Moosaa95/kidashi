from django.urls import path
from django.urls.conf import include


urlpatterns = (path("mobile/", include("modules.trust_circle.endpoints.mobile.urls")),)
