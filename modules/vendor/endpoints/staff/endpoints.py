from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.notification.enums import InAppEventType
from modules.notification.models import InAppNotification
from modules.vendor.enums import GurantorVerificationStatus, VendorStatus
from modules.vendor.models import Guarantor, Vendor
from modules.vendor.serializers import (
    FetchVendorFilterSerializer,
    GuarantorDetailSerializer,
    GuarantorVerificationUpdateSerializer,
    VendorDetailSerializer,
    VendorSerializer,
)
from modules.vendor.tasks import notify_vendor_status_change


class FetchVendorsFilter(APIView):
    @extend_schema(
        tags=["Vendor"],
        summary="Fetch Vendors with Filters",
        request=FetchVendorFilterSerializer,
    )
    def post(self, request):
        print("VENDORS")
        serializer = FetchVendorFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        and_condition = Q()
        print("INTERNAL=======REQUEST", request)
        filters = serializer.validated_data.get("filters", {})
        if not filters:
            print("not filter")
            filtered = Vendor.fetch_vendors(count=50)
            return Response({"status": True, "data": filtered}, status=status.HTTP_200_OK)

        date = filters.pop("date", None)
        start_date = filters.pop("start_date", None)
        end_date = filters.pop("end_date", None)
        # Apply date filters
        if date:
            filters["created_at__startswith"] = date
        if start_date and end_date:
            filters["created_at__range"] = [start_date, end_date]

        # Apply remaining filters
        for key, value in filters.items():
            and_condition.add(Q(**{key: value}), Q.AND)

        filtered = Vendor.fetch_vendors(conditions=and_condition)
        return Response({"status": True, "data": filtered}, status=status.HTTP_200_OK)


class GetVendorDetail(APIView):
    @extend_schema(
        tags=["Vendor"],
        summary="Get Vendor Detail",
        request=VendorSerializer,
    )
    def post(self, request):
        response_dict = dict(status=False)
        serializer = VendorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor_id = serializer.validated_data.get("vendor_id")
        if not vendor_id:
            response_dict.update(message="vendor id is required")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)
        vendor = Vendor.get_vendor(id=vendor_id)
        response_serializer = VendorDetailSerializer(vendor).data
        response_dict.update(status=True, data=response_serializer)
        return Response(response_dict, status=status.HTTP_200_OK)


class UpdateVendorApplicationStatus(APIView):
    @extend_schema(
        tags=["Vendor"],
        summary="Update Vendor Application Status",
        request=VendorSerializer,
    )
    def post(self, request):
        response_dict = dict(status=False)
        serializer = VendorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor_id = serializer.validated_data.get("vendor_id")
        status_value = serializer.validated_data.get("status")
        if not vendor_id or not status_value:
            response_dict.update(message="vendor id and status are required")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)
        vendor = Vendor.get_vendor(id=vendor_id)
        if not vendor:
            response_dict.update(message="vendor not found")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

        if status_value == VendorStatus.ACTIVE and not Vendor.can_be_activated(vendor_id):
            response_dict.update(message="Vendor cannot be activated — requires two verified guarantors.")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Vendor.update_vendor(filters={"id": vendor_id}, params={"status": status_value})
        if not updated_count:
            response_dict.update(message="Vendor status update failed")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)
        InAppNotification.create_notification(
            cba_customer_id=vendor.cba_customer_id,
            event_type=InAppEventType.VENDOR_STATUS_CHANGED,
            title="Vendor Status Updated",
            message=f"Your vendor status has been updated to {status_value}.",
            metadata=dict(
                vendor_id=str(vendor.id),
                new_status=status_value,
            ),
        )
        notify_vendor_status_change(vendor_id, status_value)
        response_dict.update(status=True, message="Vendor status updated successfully")
        return Response(response_dict, status=status.HTTP_200_OK)


class UpdateGuarantorVerificationStatus(APIView):
    @extend_schema(
        tags=["Vendor"],
        summary="Update Guarantor Verification Status",
        request=GuarantorVerificationUpdateSerializer,
    )
    def post(self, request):
        response_dict = dict(status=False)
        serializer = GuarantorVerificationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        guarantor_id = serializer.validated_data.get("guarantor_id")
        verification_status = serializer.validated_data.get("verification_status") or GurantorVerificationStatus.VERIFIED

        guarantor = Guarantor.get_guarantor(id=guarantor_id)
        if not guarantor:
            response_dict.update(message="Guarantor not found")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

        if guarantor.verification_status == verification_status:
            response_dict.update(
                status=True,
                message="Guarantor verification status is already up to date",
                data=GuarantorDetailSerializer(guarantor).data,
            )
            return Response(response_dict, status=status.HTTP_200_OK)

        updated_guarantor = Guarantor.update_guarantor(guarantor.id, verification_status=verification_status)
        if not updated_guarantor:
            response_dict.update(message="failed to update verification status")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

        response_dict.update(
            status=True,
            message=f"Guarantor verification status updated to {verification_status}",
            data=GuarantorDetailSerializer(updated_guarantor).data,
        )
        return Response(response_dict, status=status.HTTP_200_OK)
