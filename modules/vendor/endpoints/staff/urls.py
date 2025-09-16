from django.urls import path
from modules.vendor.endpoints.staff.endpoints import FetchOnboardedVendorsFilter, FetchPendingVendorsFilter, GetVendorDetail

urlpatterns = [
    path("fetch_onboarded_vendors", FetchOnboardedVendorsFilter.as_view(), name="fetch_onboarded_vendors"),
    path("fetch_pending_vendors", FetchPendingVendorsFilter.as_view(), name="fetch_pending_vendors"),
    path("get_vendor_details", GetVendorDetail.as_view(), name="get_vendor_details"),
]
