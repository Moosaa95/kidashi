from django.urls import path
from django.urls.conf import include


urlpatterns = (
    path("mobile/", include("modules.asset.endpoints.mobile.urls")),
    # path("staff/", include("modules.trust_circle.endpoints.staff.urls")),
)
