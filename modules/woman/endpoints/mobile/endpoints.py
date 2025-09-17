# from django.db import transaction
# from rest_framework import status
# from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from drf_spectacular.utils import extend_schema, inline_serializer


class CreateWomanOnboarding(APIView):
    @extend_schema(
        tags=["Kidashi Woman Onboarding"],
        description="Onboard woman to Kidashi (must already exist in Payrep MFB)",
        request="",
        responses={
            200: inline_serializer(
                name="womanOnboardingResponse",
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
        pass
