from rest_framework import serializers

from modules.security.enums import OtpPurpose


class OtpGenerateSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)


class OtpVerifySerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)
    otp = serializers.CharField(max_length=10)


class OtpResendSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=OtpPurpose.choices)
