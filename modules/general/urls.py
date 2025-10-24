from django.urls import path
from django.urls.conf import include


urlpatterns = (path("staff/", include("modules.general.endpoints.staff.urls")),)
