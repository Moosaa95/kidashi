from django.db.models import Q
from modules.security.mixins import IsPayrepAuthenticatedMixin
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes

from modules.service.enums import ServiceCode
from modules.service.models import Service
from modules.vendor.models import Vendor
from modules.woman.models import Woman
from modules.woman.serializers import (
    FetchWomenFilterSerializer,
    GetWomanBasicDetailsRequestSerializer,
    WomanAttestationSerializer,
    WomanDetailSerializer,
    WomanEmailVerifySerializer,
    WomanEmailRegisterSerializer,
    WomanFacialCaptureSerializer,
    WomanIdentificationCheckSerializer,
    WomanLocationSetupSerializer,
    WomanManualCustomerDetailsSerializer,
    WomanMobileRegisterSerializer,
    WomanMobileVerifySerializer,
    WomanNationalitySerializer,
    WomanNextOfKinSerializer,
    WomanNinLookupSerializer,
    WomanBvnLookupSerializer,
    WomanPepSerializer,
    WomanSerializer,
    WomanSourceOfIncomeSerializer,
    WomanOnboardingRequestSerializer,
    WomanVerificationCheckSerializer,
)


class VerifyWomanMobileNumber(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Verify woman's mobile number with Payrep",
        request=WomanMobileVerifySerializer,
        responses={
            200: inline_serializer(
                name="VerifyWomanMobileNumberResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
            400: OpenApiTypes.OBJECT,
        },
    )
    def post(self, request):
        serializer = WomanMobileVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = dict(
            mobile_number=serializer.validated_data["mobile_number"],
            type=serializer.validated_data.get("type", "INDIVIDUAL"),
        )

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("verify_mobile", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class RegisterWomanMobileNumber(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Register woman's mobile number with Payrep",
        request=WomanMobileRegisterSerializer,
    )
    def post(self, request):
        serializer = WomanMobileRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = dict(
            mobile_number=serializer.validated_data["mobile_number"],
            otp=serializer.validated_data["otp"],
            type=serializer.validated_data.get("type", "INDIVIDUAL"),
        )

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("register_mobile", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class VerifyWomanEmailAddress(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Verify woman's email address with Payrep",
        request=WomanEmailVerifySerializer,
    )
    def post(self, request):
        serializer = WomanEmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(email=serializer.validated_data["email"])

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("verify_email", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class RegisterWomanEmailAddress(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Register woman's email address with Payrep",
        request=WomanEmailRegisterSerializer,
    )
    def post(self, request):
        serializer = WomanEmailRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            email=serializer.validated_data["email"],
            mobile_number=serializer.validated_data["mobile_number"],
            otp=serializer.validated_data["otp"],
        )

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("register_email", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class UpdateWomanNationality(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Update woman's nationality with Payrep",
        request=WomanNationalitySerializer,
    )
    def post(self, request):
        serializer = WomanNationalitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(nationality=serializer.validated_data["nationality"])

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("nationality", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanNinLookup(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Run NIN lookup for a woman in Payrep",
        request=WomanNinLookupSerializer,
    )
    def post(self, request):
        serializer = WomanNinLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            cba_customer_id=serializer.validated_data["cba_customer_id"],
            nin=serializer.validated_data["nin"],
        )

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("nin_lookup", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanBvnLookup(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Run BVN lookup for a woman in Payrep",
        request=WomanBvnLookupSerializer,
    )
    def post(self, request):
        serializer = WomanBvnLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            cba_customer_id=serializer.validated_data["cba_customer_id"],
            bvn=serializer.validated_data["bvn"],
        )

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("bvn_lookup", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanVerificationCheck(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Submit verification check payload",
        request=WomanVerificationCheckSerializer,
    )
    def post(self, request):
        serializer = WomanVerificationCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(verification=serializer.validated_data["verification"])

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("verification_check", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanLocationSetup(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Set personal and location details",
        request=WomanLocationSetupSerializer,
    )
    def post(self, request):
        serializer = WomanLocationSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            residential_address=serializer.validated_data["residential_address"],
            state=serializer.validated_data["state"],
            lga=serializer.validated_data["lga"],
            country=serializer.validated_data["country"],
            community=serializer.validated_data["community"],
        )
        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "personal_and_location_setup",
            payload=payload,
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanNextOfKin(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Submit next of kin details",
        request=WomanNextOfKinSerializer,
    )
    def post(self, request):
        serializer = WomanNextOfKinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("next_of_kin", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanIdentificationCheck(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Upload identification document",
        request=WomanIdentificationCheckSerializer,
    )
    def post(self, request):
        serializer = WomanIdentificationCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            document_type=serializer.validated_data["document_type"],
            document_class=serializer.validated_data["document_class"],
            file=serializer.validated_data["file"],
        )
        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "identification_check",
            payload=payload,
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanPep(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="PEP declaration",
        request=WomanPepSerializer,
    )
    def post(self, request):
        serializer = WomanPepSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(is_pep=serializer.validated_data["is_pep"])
        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "pep",
            payload=payload,
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanSourceOfIncome(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Source of income submission",
        request=WomanSourceOfIncomeSerializer,
    )
    def post(self, request):
        serializer = WomanSourceOfIncomeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(
            employment_type=serializer.validated_data["employment_type"],
            occupation=serializer.validated_data["occupation"],
            annual_income=serializer.validated_data["annual_income"],
        )
        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "source_of_income",
            payload=payload,
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanManualCustomerDetails(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Create customer manually in Payrep",
        request=WomanManualCustomerDetailsSerializer,
    )
    def post(self, request):
        serializer = WomanManualCustomerDetailsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action("manual_customer_details", payload=payload, token=request.payrep_token)
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanFacialCapture(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Submit facial capture image",
        request=WomanFacialCaptureSerializer,
    )
    def post(self, request):
        serializer = WomanFacialCaptureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(file=serializer.validated_data["file"])
        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "facial_capture",
            payload=payload,
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )
        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class WomanAttestation(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Submit woman attestation affirmation",
        request=WomanAttestationSerializer,
        responses={
            200: inline_serializer(
                name="AttestationResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            )
        },
    )
    def post(self, request):
        serializer = WomanAttestationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cba_customer_id = serializer.validated_data["cba_customer_id"]

        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        result = provider.customer_action(
            "attestation",
            payload={},
            token=request.payrep_token,
            path_params={"cba_customer_id": str(cba_customer_id)},
        )

        http_status = status.HTTP_200_OK if result.get("req_status") else status.HTTP_400_BAD_REQUEST
        return Response(data=result, status=http_status)


class CreateWomanOnboarding(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Onboard woman to Kidashi (must already exist in Payrep MFB)",
        request=WomanOnboardingRequestSerializer,
        responses={
            201: inline_serializer(
                name="WomanOnboardingResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    woman_id=serializers.UUIDField(),
                    cba_customer_id=serializers.UUIDField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = WomanOnboardingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor_cba_customer_id = serializer.validated_data["vendor_cba_customer_id"]
        woman_cba_customer_id = serializer.validated_data["woman_cba_customer_id"]
        try:
            vendor = Vendor.get_vendor(cba_customer_id=vendor_cba_customer_id)
            if not vendor:
                return Response(dict(status=False, message="Vendor not found"), status=status.HTTP_404_NOT_FOUND)

            service = Service.get_service(code=ServiceCode.CBA_CODE)
            integration = service.active_integrations(channel="API").first()
            provider = integration.get_client()
            cba_customer_data = provider.get_cba_customer_details(woman_cba_customer_id, token=request.payrep_token)
            if not cba_customer_data.get("req_status") or not cba_customer_data.get("status"):
                return Response(dict(status=False, message="Unable to fetch customer from Payrep"), status=status.HTTP_400_BAD_REQUEST)

            customer = cba_customer_data.get("data", {})

            data = dict(
                cba_customer_id=woman_cba_customer_id,
                first_name=customer.get("first_name"),
                surname=customer.get("surname"),
                other_name=customer.get("other_names", ""),
                dob=customer.get("dob", ""),
                nationality=customer.get("nationality", ""),
                occupation=customer.get("occupation", ""),
                annual_income=customer.get("annual_income", ""),
                employment_type=customer.get("employment_type", ""),
                account_number=(customer.get("primary_account", {}).get("account_number", "") if customer.get("primary_account") else ""),
                nin=(customer.get("kyc", {}).get("nin", "") if customer.get("kyc") else ""),
                bvn=(customer.get("kyc", {}).get("bvn", "") if customer.get("kyc") else ""),
                image=customer.get("image", ""),
                state=customer.get("state__name", ""),
                lga=customer.get("lga__name", ""),
                residential_address=customer.get("residential_address", ""),
                email=customer.get("email"),
                mobile_number=customer.get("mobile_number"),
                vendor=vendor,
                tier=(customer.get("tier", {}).get("name") if customer.get("tier") else ""),
                maximum_balance=(customer.get("tier", {}).get("maximum_balance") if customer.get("tier") else ""),
            )
            woman = Woman.create_woman(**data)
            if not woman:
                return Response(data=dict(status=False, message="failed to create woman"), status=status.HTTP_400_BAD_REQUEST)

            return Response(
                data=dict(
                    status=True,
                    woman_id=str(woman.id),
                    woman_cba_customer_id=str(woman.cba_customer_id),
                    account_number=str(woman.account_number),
                    tier_type=woman.tier,
                    message="woman created successfully",
                ),
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print("==========WomenOboarding", e)
            return Response(data=dict(status=False, message="An unexpected error has occured, please contact support"), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FetchWomen(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Fetch details of a woman",
        request=FetchWomenFilterSerializer,
        responses={
            200: inline_serializer(
                name="FetchWomanDetailsResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=WomanSerializer(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = FetchWomenFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        filtered_data = serializer.validated_data or {}

        condition = Q()
        search_value = filtered_data.get("search")
        if search_value:
            condition |= Q(mobile_number__icontains=search_value)
            condition |= Q(nin__iexact=search_value)
            condition |= Q(bvn__iexact=search_value)
            condition |= Q(account_number__iexact=search_value)

        woman = Woman.fetch_women(conditions=condition)
        return Response(data=dict(status=True, message="Woman details fetched successfully", data=woman), status=status.HTTP_200_OK)


class GetWomanBasicDetails(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Woman"],
        description="Fetch basic details of a woman",
        request=GetWomanBasicDetailsRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetWomanBasicDetailsResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=WomanSerializer(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = GetWomanBasicDetailsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cba_customer_id = serializer.validated_data.get("cba_customer_id")

        woman = Woman.get_woman(cba_customer_id=cba_customer_id)
        if not woman:
            return Response(dict(status=False, message="Woman not found"), status=status.HTTP_404_NOT_FOUND)
        return Response(data=dict(status=True, message="Woman details fetched successfully", data=WomanDetailSerializer(woman).data), status=status.HTTP_200_OK)
