from rest_framework import serializers


class CreateTrustCircleRequestSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=True)
    circle_name = serializers.CharField(required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True)
