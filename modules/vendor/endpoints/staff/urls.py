from django.urls import path
from modules.vendor.endpoints.staff.endpoints import FetchOnboardedVendorsFilter, FetchPendingVendorsFilter, GetVendorDetail, UpdateVendorApplicationStatus

urlpatterns = [
    path("fetch_onboarded_vendors", FetchOnboardedVendorsFilter.as_view(), name="fetch_onboarded_vendors"),
    path("fetch_pending_vendors", FetchPendingVendorsFilter.as_view(), name="fetch_pending_vendors"),
    path("get_vendor_details", GetVendorDetail.as_view(), name="get_vendor_details"),
    path("update_vendor_application_status", UpdateVendorApplicationStatus.as_view(), name="update_vendor_application_status"),
]
