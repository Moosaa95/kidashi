from common.validators import validate_mobile_number
from modules.vendor.enums import BusinessTypes
from rest_framework import serializers


class GuarantorDetailSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    surname = serializers.CharField(max_length=255)
    other_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    relationship = serializers.CharField(max_length=100)


class VendorBusinessOnboardingSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=True, help_text="Unique customer ID from Payrep MFB system")
    business_type = serializers.ChoiceField(choices=BusinessTypes.choices, help_text="Type of business", required=False)
    community = serializers.CharField(max_length=255, required=False, help_text="Community where the vendor operates")
    guarantors = GuarantorDetailSerializer(many=True, min_length=2, max_length=2, help_text="List of 2 guarantors")
    items_sold = serializers.ListField(child=serializers.CharField(max_length=100), required=False, allow_empty=True, help_text="List of items the vendor sells")


# class VendorItemOnboardingSerializer(serializers.Serializer):
#     cba_customer_id = serializers.UUIDField(
#         required=True,
#         help_text="Unique customer ID from Payrep MFB system"
#     )
#     items_sold = serializers.ListField(
#         child=serializers.CharField(max_length=100),
#         required=False,
#         allow_empty=True,
#         help_text="List of items the vendor sells"
#     )


# class VendorGuarantorOnboardingSerializer(serializers.Serializer):
#     cba_customer_id = serializers.UUIDField(
#         required=True,
#         help_text="Unique customer ID from Payrep MFB system"
#     )
#     guarantors = GuarantorDetailSerializer(
#         many=True,
#         min_length=2,
#         max_length=2,
#         help_text="List of 2 guarantors"
#     )
