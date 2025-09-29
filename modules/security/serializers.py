from rest_framework import serializers

from modules.notification.enums import NotificationChannel
from modules.security.enums import OtpPurpose


class OtpGenerateSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)
    recipient = serializers.CharField(required=True)
    subject_id = serializers.CharField(required=True)
    channel = serializers.CharField(required=False, default=NotificationChannel.SMS)


class OtpVerifySerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)
    subject_id = serializers.CharField(required=True)
    otp = serializers.CharField(max_length=10)


class OtpResendSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)
    subject_id = serializers.CharField(required=True)
    recipient = serializers.CharField(required=True)
    channel = serializers.CharField(required=False, default=NotificationChannel.SMS)
