from common.functions import parse_and_format_date
from common.validators import validate_mobile_number
from modules.vendor.enums import BusinessTypes
from rest_framework import serializers


class GuarantorDetailSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    surname = serializers.CharField(max_length=255)
    other_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    relationship = serializers.CharField(required=False, max_length=100)
    nin = serializers.CharField(required=False, max_length=11)
    email = serializers.EmailField(required=False, max_length=50)
    state_id = serializers.UUIDField(required=False)
    lga_id = serializers.UUIDField(required=False)
    gender = serializers.CharField(required=False, max_length=100)
    dob = serializers.CharField(required=False, max_length=20)
    nationality = serializers.CharField(required=False, max_length=100)


class VendorBusinessOnboardingSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=True, help_text="Unique customer ID from Payrep MFB system")
    business_type = serializers.ChoiceField(choices=BusinessTypes.choices, help_text="Type of business", required=False)
    community = serializers.CharField(max_length=255, required=False, help_text="Community where the vendor operates")
    guarantors = GuarantorDetailSerializer(many=True, min_length=2, max_length=2, help_text="List of 2 guarantors")
    # items_sold = serializers.ListField(child=serializers.CharField(max_length=100), required=False, allow_empty=True, help_text="List of items the vendor sells")
    business_description = serializers.CharField(max_length=255, required=False, help_text="Filter by customer's other name.")


class VendorSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField(required=False, help_text="Unique Vendor ID")
    first_name = serializers.CharField(max_length=255, required=False, help_text="Filter by customer's first name.")
    other_name = serializers.CharField(max_length=255, required=False, help_text="Filter by customer's other name.")
    surname = serializers.CharField(max_length=255, required=False, help_text="Filter by customer's surname.")
    email = serializers.CharField(max_length=50, required=False, help_text="Filter by customer's type.")
    business_name = serializers.CharField(max_length=255, required=False, help_text="Filter by business name.")
    phone = serializers.CharField(max_length=255, required=False, validators=[validate_mobile_number], help_text="Filter by customer's mobile number.")
    status = serializers.CharField(max_length=255, required=False, help_text="Filter by registration stage.")
    date = serializers.CharField(required=False, help_text="Filter by a specific registration date (YYYY-MM-DD).")
    start_date = serializers.CharField(required=False, help_text="Filter by a start date range (YYYY-MM-DD).")
    end_date = serializers.CharField(required=False, help_text="Filter by an end date range (YYYY-MM-DD).")

    def validate(self, data):
        """Parse and validate dates if provided."""
        for field in ["date", "start_date", "end_date"]:
            if data.get(field):
                data[field] = parse_and_format_date(data[field])
        return data


class FetchVendorFilterSerializer(serializers.Serializer):
    filters = VendorSerializer(required=False)
    count = serializers.IntegerField(required=False)
