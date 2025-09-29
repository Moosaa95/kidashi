from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from drf_spectacular.utils import extend_schema, inline_serializer
from modules.security.mixins import IsPayrepAuthenticatedMixin
from modules.service.models import Service
from modules.vendor.models import Guarantor, OnboardingActivityLogs, Vendor
from modules.vendor.serializers import GetVendorDetailRequestSerializer, VendorBusinessOnboardingSerializer, VendorDetailSerializer


class CreateVendorBusinessOnboarding(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Vendor"],
        description="Onboard vendor to Kidashi (must already exist in Payrep MFB)",
        request=VendorBusinessOnboardingSerializer,
        responses={
            201: inline_serializer(
                name="VendorBusinessOnboardingResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    vendor_id=serializers.UUIDField(),
                    cba_customer_id=serializers.UUIDField(),
                    mobile_number=serializers.CharField(),
                    guarantors=serializers.ListField(child=serializers.DictField()),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = VendorBusinessOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cba_customer_id = serializer.validated_data.get("cba_customer_id")
            guarantors_data = serializer.validated_data["guarantors"]
            token = request.headers.get("Authorization", "").replace("Bearer ", "")
            log = OnboardingActivityLogs.create_log(action="Vendor Onboarding", description="Onboarding vendor to Kidashi")
            if not token:
                return Response({"status": False, "message": "Authorization token required"}, status=status.HTTP_401_UNAUTHORIZED)
            provider = None
            service = Service.get_service(code="cba01")
            integration = service.active_integrations(channel="API").first()
            provider = integration.get_client()
            cba_customer_data = provider.get_cba_customer_details(cba_customer_id, token)
            if not cba_customer_data.get("req_status") or not cba_customer_data.get("status"):
                OnboardingActivityLogs.update_log(log_id=log.id, data={"error": "Unable to fetch customer from Payrep"})
                return Response(dict(status=False, message="Unable to fetch customer from Payrep"), status=status.HTTP_400_BAD_REQUEST)

            customer = cba_customer_data.get("data", {})

            data = dict(
                cba_customer_id=str(cba_customer_id),
                first_name=customer.get("first_name"),
                surname=customer.get("surname"),
                email=customer.get("email"),
                phone=customer.get("mobile_number"),
                business_type=serializer.validated_data.get("business_type"),
                business_description=serializer.validated_data.get("business_description"),
                community=serializer.validated_data.get("community"),
            )

            with transaction.atomic():
                # try:
                result = Vendor.create_vendor(**data)
                if not result["status"]:
                    transaction.set_rollback(True)
                    return Response(data=result, status=status.HTTP_400_BAD_REQUEST)

                gurantor_result = Guarantor.create_guarantors(vendor_id=result.get("vendor_id"), guarantors_data=guarantors_data)
                if not gurantor_result["status"]:
                    transaction.set_rollback(True)
                    return Response(data=gurantor_result, status=status.HTTP_400_BAD_REQUEST)

                # OnboardingActivityLogs.update_log(
                #     log_id=log.id,
                #     status=True,
                #     data={"vendor": data, "guarantors": guarantors_data},
                # )
                return Response(status=status.HTTP_201_CREATED, data=result)

                # except Exception:
            #     return Response(data=dict(status=False, message="An unexpected error has occured, please contact support", data=None), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print("EXCEPTION", e)
            return Response(data=dict(status=False, message="An unexpected error has occured, please contact support", data=None), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetVendorDetail(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Vendor"],
        description="Get detailed information for a vendor",
        request=GetVendorDetailRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetVendorDetailResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="VendorDetail",
                        fields=dict(
                            id=serializers.UUIDField(),
                            first_name=serializers.CharField(),
                            surname=serializers.CharField(),
                            other_name=serializers.CharField(allow_blank=True, allow_null=True),
                            phone=serializers.CharField(),
                            email=serializers.CharField(allow_blank=True, allow_null=True),
                            business_type=serializers.CharField(),
                            business_description=serializers.CharField(allow_blank=True, allow_null=True),
                            address=serializers.CharField(),
                            community=serializers.CharField(allow_blank=True, allow_null=True),
                            status=serializers.CharField(),
                            cba_customer_id=serializers.UUIDField(),
                            geo_region=serializers.CharField(allow_blank=True, allow_null=True),
                            state=serializers.CharField(allow_blank=True, allow_null=True),
                            lga=serializers.CharField(allow_blank=True, allow_null=True),
                            country=serializers.CharField(allow_blank=True, allow_null=True),
                            active_trust_circles_count=serializers.IntegerField(),
                            total_women_onboarded=serializers.IntegerField(),
                            created_at=serializers.DateTimeField(),
                            updated_at=serializers.DateTimeField(allow_null=True),
                            guarantors=serializers.ListField(
                                child=inline_serializer(
                                    name="VendorGuarantorDetail",
                                    fields=dict(
                                        id=serializers.UUIDField(),
                                        first_name=serializers.CharField(),
                                        surname=serializers.CharField(),
                                        other_name=serializers.CharField(allow_blank=True, allow_null=True),
                                        phone=serializers.CharField(allow_blank=True, allow_null=True),
                                        relationship=serializers.CharField(allow_blank=True, allow_null=True),
                                        email=serializers.EmailField(allow_blank=True, allow_null=True),
                                        verification_status=serializers.CharField(),
                                    ),
                                ),
                                allow_empty=True,
                            ),
                        ),
                    ),
                ),
            ),
            404: inline_serializer(
                name="VendorDetailNotFoundResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = GetVendorDetailRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        filters = {}
        vendor_id = serializer.validated_data.get("vendor_id")
        cba_customer_id = serializer.validated_data.get("cba_customer_id")
        if vendor_id:
            filters["id"] = vendor_id
        if cba_customer_id:
            filters["cba_customer_id"] = cba_customer_id
        vendor = Vendor.get_vendor(**filters)
        if not vendor:
            return Response(dict(status=False, message="Vendor not found"), status=status.HTTP_404_NOT_FOUND)

        data = VendorDetailSerializer(vendor).data
        return Response(
            dict(status=True, message="Vendor fetched successfully", data=data),
            status=status.HTTP_200_OK,
        )
