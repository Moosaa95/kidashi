from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from drf_spectacular.utils import extend_schema, inline_serializer
from modules.service.providers import PayrepCba
from modules.vendor.models import Guarantor, Vendor, VendorActivityLogs
from modules.vendor.serializers import VendorBusinessOnboardingSerializer


class CreateVendorBusinessOnboarding(APIView):
    @extend_schema(
        tags=["Kidashi Vendor Onboarding"],
        description="Onboard vendor to Kidashi (must already exist in Payrep MFB)",
        request=VendorBusinessOnboardingSerializer,
        responses={
            200: inline_serializer(
                name="VendorBusinessOnboardingResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    vendor_id=serializers.UUIDField(),
                    cba_customer_id=serializers.UUIDField(),
                    items_sold=serializers.ListField(child=serializers.CharField()),
                    guarantors=serializers.ListField(child=serializers.DictField()),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = VendorBusinessOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = VendorActivityLogs.create_log(step_name="Vendor Onboarding")

        cba_customer_id = serializer.validated_data.get("cba_customer_id")
        guarantors_data = serializer.validated_data["guarantors"]
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not token:
            return Response({"status": False, "message": "Authorization token required"}, status=status.HTTP_401_UNAUTHORIZED)
        payrep = PayrepCba()
        cba_customer_data = payrep.get_cba_customer_details(cba_customer_id, token)
        if not cba_customer_data.get("req_status") or not cba_customer_data.get("status"):
            VendorActivityLogs.update_log(log_id=log.id, data={"error": "Unable to fetch customer from Payrep"})
            return Response({"message": "Unable to fetch customer from Payrep"}, status=status.HTTP_400_BAD_REQUEST)

        customer = cba_customer_data.get("data", {})

        data = dict(
            cba_customer_id=cba_customer_id,
            first_name=customer.get("first_name"),
            surname=customer.get("surname"),
            email=customer.get("email"),
            phone=customer.get("mobile_number"),
            business_type=serializer.validated_data.get("business_type"),
            community=serializer.validated_data.get("community"),
            items=serializer.validated_data.get("items_sold", []),
        )

        with transaction.atomic():
            try:
                gurantor_result = Guarantor.create_guarantors(cba_customer_id, guarantors_data)
                if not gurantor_result["status"]:
                    transaction.set_rollback(True)
                    return Response(data=gurantor_result, status=status.HTTP_400_BAD_REQUEST)
                result = Vendor.create_vendor(**data)

                if not result["status"]:
                    transaction.set_rollback(True)
                    return Response(data=result, status=status.HTTP_400_BAD_REQUEST)

                VendorActivityLogs.update_log(
                    log_id=log.id,
                    status=True,
                    data={"vendor": data, "guarantors": guarantors_data},
                )
                return Response(status=status.HTTP_200_OK, data=result)

            except Exception:
                transaction.set_rollback(True)
                return Response(data=dict(status=False, message="An unexpected error has occured, please contact support", data=None), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# TODO: DELETE LATER
# class CreateVendorItemOnboarding(APIView):
#     @extend_schema(
#         tags=["Kidashi Vendor Onboarding"],
#         description="Add/update items sold by the vendor",
#         request=VendorItemOnboardingSerializer,
#         responses={
#             200: inline_serializer(
#                 name="VendorItemOnboardingResponse",
#                 fields=dict(
#                     status=serializers.BooleanField(),
#                     message=serializers.CharField(),
#                     cba_customer_id=serializers.UUIDField(),
#                     items_sold=serializers.ListField(child=serializers.CharField())
#                 ),
#             ),
#         },
#     )
#     def post(self, request):
#         serializer = VendorItemOnboardingSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         cba_customer_id = serializer.validated_data["cba_customer_id"]
#         items_sold = serializer.validated_data.get("items_sold", [])
#         log = VendorOnboardingActivityLogs.create_log(step_name=VendorStage.ITEMS)

#         updated = Vendor.update_vendor(
#             filters=dict(cba_customer_id=cba_customer_id),
#             params=dict(items_sold=items_sold, stage=VendorStage.GUARANTORS)
#         )

#         if not updated:
#             return Response(
#                 {"status": False, "message": "failed to update vendor"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         VendorOnboardingActivityLogs.update_log(
#             log_id=log.id,
#             status=True,
#             data=dict(items_sold=items_sold)
#         )

#         return Response(
#             {"status": True, "message": "vendor item updated successfully", "cba_customer_id": cba_customer_id},
#             status=status.HTTP_200_OK
#         )


# class CreateVendorGuarantorOnboarding(APIView):
#     @extend_schema(
#         tags=["Kidashi Vendor Onboarding"],
#         description="Onboard vendor guarantors (exactly 2 required)",
#         request=VendorGuarantorOnboardingSerializer,
#         responses={
#             200: inline_serializer(
#                 name="VendorGuarantorOnboardingResponse",
#                 fields=dict(
#                     status=serializers.BooleanField(),
#                     message=serializers.CharField(),
#                     cba_customer_id=serializers.UUIDField(),
#                     guarantors=serializers.ListField(child=serializers.DictField())
#                 ),
#             ),
#         },
#     )
#     def post(self, request):
#         serializer = VendorGuarantorOnboardingSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         cba_customer_id = serializer.validated_data["cba_customer_id"]
#         guarantors_data = serializer.validated_data["guarantors"]
#         log = VendorOnboardingActivityLogs.create_log(step_name=VendorStage.GUARANTORS)


#         with transaction.atomic():
#             result = Guarantor.create_guarantors(cba_customer_id, guarantors_data)
#             if not result["status"]:
#                 VendorOnboardingActivityLogs.update_log(
#                     log_id=log.id,
#                     data=dict(error=result["message"])
#                 )
#                 return Response(result, status=status.HTTP_400_BAD_REQUEST)

#             Vendor.update_vendor(
#                 filters=dict(cba_customer_id=cba_customer_id),
#                 params=dict(stage=VendorStage.UNDER_REVIEW)
#             )

#             VendorOnboardingActivityLogs.update_log(
#                 log_id=log.id,
#                 status=True
#             )

#         return Response(data=result, status=status.HTTP_200_OK)
