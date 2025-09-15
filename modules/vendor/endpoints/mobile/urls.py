from django.urls import path
from modules.vendor.endpoints.mobile.endpoints import CreateVendorBusinessOnboarding

urlpatterns = [path("onboarding/business", CreateVendorBusinessOnboarding.as_view(), name="vendor-business-onboarding")]
