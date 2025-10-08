from django.urls import path
from modules.vendor.endpoints.staff.endpoints import (
    FetchVendorsFilter,
    GetVendorDetail,
    UpdateGuarantorVerificationStatus,
    UpdateVendorApplicationStatus,
)

urlpatterns = [
    path("fetch_vendors", FetchVendorsFilter.as_view(), name="fetch_vendors"),
    # path("fetch_pending_vendors", FetchPendingVendorsFilter.as_view(), name="fetch_pending_vendors"),
    path("get_vendor_details", GetVendorDetail.as_view(), name="get_vendor_details"),
    path("update_vendor_application_status", UpdateVendorApplicationStatus.as_view(), name="update_vendor_application_status"),
    path(
        "update_guarantor_verification_status",
        UpdateGuarantorVerificationStatus.as_view(),
        name="update_guarantor_verification_status",
    ),
]
