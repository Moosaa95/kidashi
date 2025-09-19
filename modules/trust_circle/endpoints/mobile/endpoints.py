from django.db import transaction
from django.db.models import Q
from django.db.utils import IntegrityError
from modules.security.mixins import IsPayrepAuthenticatedMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from drf_spectacular.utils import extend_schema, inline_serializer
from modules.trust_circle.enums import TrustCircleActivityType
from modules.trust_circle.models import TrustCircle, CircleActivity
from modules.trust_circle.serializers import CreateTrustCircleRequestSerializer, FetchTrustCircleFilterSerializer, TrustCircleSerializer
from modules.vendor.enums import VendorStatus
from modules.vendor.models import Vendor


class CreateTrustCircle(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Create a new Trust Circle",
        request=CreateTrustCircleRequestSerializer,
        responses={
            201: inline_serializer(
                name="CreateTrustCircleResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    circle_id=serializers.UUIDField(),
                    circle_name=serializers.CharField(),
                    max_members=serializers.IntegerField(),
                    description=serializers.CharField(allow_blank=True),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = CreateTrustCircleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor_cba_customer_id = serializer.validated_data["cba_customer_id"]
        # TODO: Ensure the authenticated user is the same as the cba_customer_id provided after LoginMixin Implemented
        # if request.user.customer.id != vendor_cba_customer_id:
        #     return Response({"status": False, "message": "You are not authorized to create a circle for this vendor"}, status=status.HTTP_403_FORBIDDEN)

        vendor = Vendor.get_vendor(cba_customer_id=vendor_cba_customer_id)

        if not vendor:
            return Response({"status": False, "message": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        if vendor.status != VendorStatus.ACTIVE:
            return Response({"status": False, "message": "Vendor is not active"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                trust_circle = TrustCircle.create_trust_circle(
                    vendor=vendor,
                    circle_name=serializer.validated_data["circle_name"],
                    description=serializer.validated_data.get("description", ""),
                )
        except IntegrityError:
            return Response(
                {"status": False, "message": "A circle with this name already exists for this vendor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR")

        CircleActivity.create_activity(
            trust_circle=trust_circle,
            activity_type=TrustCircleActivityType.CIRCLE_CREATED,
            description=f"Trust Circle '{trust_circle.circle_name}' created by Vendor '{vendor.cba_customer_id}'",
            performed_by=vendor,
            metadata={"circle_name": trust_circle.circle_name, "vendor_id": str(vendor.id)},
            ip_address=ip_address,
        )

        return Response(
            {
                "status": True,
                "message": "Trust Circle created successfully",
                "circle_id": trust_circle.id,
                "circle_name": trust_circle.circle_name,
                "max_members": trust_circle.max_members,
                "description": trust_circle.description,
                "trust_circle_status": trust_circle.status,
                "loan_eligibility": trust_circle.loan_eligibility,
                "created_at": trust_circle.created_at,
            },
            status=status.HTTP_201_CREATED,
        )


class FetchTrustCircles(IsPayrepAuthenticatedMixin, APIView):
    @extend_schema(
        tags=["Kidashi Trust Circle"],
        description="Fetch Trust Circles with optional filters",
        request=FetchTrustCircleFilterSerializer,
        responses={
            200: inline_serializer(
                name="FetchTrustCirclesResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=TrustCircleSerializer(many=True),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = FetchTrustCircleFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        and_condition = Q()
        filters = validated_data.get("filters", {})
        if not filters:
            vendor_cba_customer_id = filters.get("vendor_cba_customer_id")
            and_condition.add(Q(vendor__cba_customer_id=vendor_cba_customer_id), Q.AND)
            filtered = TrustCircle.fetch_trust_circles(conditions=and_condition, count=10)
            return Response({"status": True, "data": filtered}, status=status.HTTP_200_OK)

        for key, value in validated_data.items():
            and_condition.add(Q(**{key: value}), Q.AND)

        trust_circles = TrustCircle.fetch_trust_circles(conditions=and_condition)

        return Response(data=dict(status=True, message="Trust Circles fetched successfully", data=trust_circles), status=status.HTTP_200_OK)
