from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers, status
from drf_spectacular.utils import extend_schema, inline_serializer

from modules.security.models import OTP
from modules.security.serializers import OtpGenerateSerializer, OtpResendSerializer, OtpVerifySerializer


class GenerateOtp(APIView):
    @extend_schema(
        tags=["OTP"],
        description="Generate a new OTP for a specific purpose",
        request=OtpGenerateSerializer,
        responses={
            200: inline_serializer(
                name="OtpGenerateResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    expires_at=serializers.DateTimeField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = OtpGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data.get("purpose")
        recipient = serializer.validated_data.get("recipient")
        subject_id = serializer.validated_data.get("subject_id")
        channel = serializer.validated_data.get("channel", "SMS")

        # Rate-limit resend
        rate_key = f"otp:gen:rate:{purpose}:{subject_id}"
        if cache.get(rate_key):
            return Response(
                {"status": False, "message": "OTP recently sent. Please wait before requesting again."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp_record = OTP.create_otp(
            purpose=purpose,
            subject_id=subject_id,
            channel=channel,
            log_to_db=True,
            recipient=recipient,
        )
        cache.set(rate_key, True, timeout=60)

        return Response(
            {"status": True, "message": "OTP generated", "expires_at": otp_record.expires_at},
            status=status.HTTP_200_OK,
        )


class VerifyOtp(APIView):
    @extend_schema(
        tags=["OTP"],
        description="Verify an OTP for a given purpose and subject",
        request=OtpVerifySerializer,
        responses={
            200: inline_serializer(
                name="OtpVerifyResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data.get("purpose")
        subject_id = serializer.validated_data.get("subject_id")
        otp = serializer.validated_data.get("otp")

        result = OTP.validate(
            purpose=purpose,
            input_otp=otp,
            subject_id=subject_id,
        )

        return Response(result, status=status.HTTP_200_OK if result["status"] else status.HTTP_400_BAD_REQUEST)


class ResendOtp(APIView):
    @extend_schema(
        tags=["OTP"],
        description="Resend OTP for a given purpose and subject (with throttling)",
        request=OtpResendSerializer,
        responses={
            200: inline_serializer(
                name="OtpResendResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    expires_at=serializers.DateTimeField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = OtpResendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data.get("purpose")
        subject_id = serializer.validated_data.get("subject_id")
        recipient = serializer.validated_data.get("recipient")
        channel = serializer.validated_data.get("channel", "SMS")

        # Throttle resend to max 3 per hour
        throttle_key = f"otp:resend:count:{purpose}"
        count = cache.get(throttle_key, 0)
        if count >= 3:
            return Response(
                {"status": False, "message": "Resend limit reached. Try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp_record = OTP.create_otp(
            purpose=purpose,
            subject_id=subject_id,
            recipient=recipient,
            channel=channel,
            log_to_db=True,
        )
        cache.set(throttle_key, count + 1, timeout=3600)

        return Response(
            {"status": True, "message": "OTP resent", "expires_at": otp_record.expires_at},
            status=status.HTTP_200_OK,
        )
