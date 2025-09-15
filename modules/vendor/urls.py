from django.urls import path
from django.urls.conf import include

urlpatterns = (path("staff/", include("modules.vendor.endpoints.staff.urls")),)
