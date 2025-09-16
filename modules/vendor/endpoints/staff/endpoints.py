from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.vendor.models import Vendor
from modules.vendor.serializers import FetchVendorFilterSerializer, VendorSerializer


class BaseVendorFilter(APIView):
    @staticmethod
    def process_filters(validated_data):
        """Helper function to process filters and date ranges."""
        date = validated_data.pop("date", None)
        start_date = validated_data.pop("start_date", None)
        end_date = validated_data.pop("end_date", None)

        and_condition = Q()

        # Apply date filters
        if date:
            validated_data["created_at__startswith"] = date
        if start_date and end_date:
            validated_data["created_at__range"] = [start_date, end_date]  # Matches range

        # Apply remaining filters

        for key, value in validated_data.items():
            if value is not None:
                if key in ["first_name", "last_name", "email"]:
                    key = f"{key}__icontains"
                and_condition.add(Q(**{key: value}), Q.AND)

        return and_condition

    def handle_vendor_fetch(self, request, fetch_function):
        """Common logic for fetching customers."""
        # filters = request.data.get("filters", {})
        serializer = FetchVendorFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        count = validated_data.pop("count", None)

        and_condition = self.process_filters(validated_data)

        if count:
            customers = fetch_function(count=count)
            return Response({"status": True, "data": customers}, status=status.HTTP_200_OK)

        customers = fetch_function(filters=and_condition)
        return Response({"status": True, "data": customers}, status=status.HTTP_200_OK)


class FetchOnboardedVendorsFilter(BaseVendorFilter):
    @extend_schema(
        tags=["Vendors"],
        summary="Fetch Onboarded Vendors with Filters",
        request=FetchVendorFilterSerializer,
    )
    def post(self, request):
        return self.handle_vendor_fetch(request, Vendor.fetch_onboarded_vendors)


class FetchPendingVendorsFilter(BaseVendorFilter):
    @extend_schema(
        tags=["Vendors"],
        summary="Fetch Registered Vendors with Filters",
        request=FetchVendorFilterSerializer,
    )
    def post(self, request):
        return self.handle_vendor_fetch(request, Vendor.fetch_pending_vendors)  # or define fetch_registered_vendors


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
