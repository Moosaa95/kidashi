from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.vendor.models import Vendor
from modules.vendor.serializers import FetchVendorFilterSerializer, VendorSerializer


class FetchVendorsFilter(APIView):
    @extend_schema(
        tags=["Vendors"],
        summary="Fetch Vendors with Filters",
        request=FetchVendorFilterSerializer,
    )
    def post(self, request):
        serializer = FetchVendorFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        and_condition = Q()

        filters = serializer.validated_data.get("filters", {})
        if not filters:
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

        filtered = Vendor.fetch_vendors(filters=and_condition)
        return Response({"status": True, "data": filtered}, status=status.HTTP_200_OK)


class GetVendorDetail(APIView):
    @extend_schema(
        tags=["Vendors"],
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
        response_dict.update(status=True, data=vendor)
        return Response(response_dict, status=status.HTTP_200_OK)


class UpdateVendorApplicationStatus(APIView):
    @extend_schema(
        tags=["Vendors"],
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
        updated_count = Vendor.update_vendor(filters={"id": vendor_id}, params={"status": status_value})
        if not updated_count:
            response_dict.update(message="No vendor found or update failed")
            return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)
        response_dict.update(status=True, message="Vendor status updated successfully")
        return Response(response_dict, status=status.HTTP_200_OK)
