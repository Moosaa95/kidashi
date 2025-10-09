from django.urls import path
from modules.vendor.endpoints.mobile.endpoints import (
    CreateVendorBusinessOnboarding,
    GetVendorDetail,
)

urlpatterns = (
    path("onboarding/business", CreateVendorBusinessOnboarding.as_view()),
    path("get_vendor_detail", GetVendorDetail.as_view()),
)
