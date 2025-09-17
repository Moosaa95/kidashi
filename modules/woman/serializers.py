from rest_framework import serializers


class WomanSerializer(serializers.Serializer):
    woman_id = serializers.UUIDField(required=False, help_text="ID of the woman")
    first_name = serializers.CharField(max_length=255, required=False, help_text="Filter by first name")
    other_name = serializers.CharField(max_length=255, required=False, help_text="Filter by other name")
    surname = serializers.CharField(max_length=255, required=False, help_text="Filter by surname")
    phone = serializers.CharField(max_length=20, required=False, help_text="Filter by phone number")
    email = serializers.EmailField(max_length=50, required=False, help_text="Filter by email address")
    status = serializers.CharField(max_length=20, required=False, help_text="Filter by status")
    date = serializers.CharField(required=False, help_text="Filter by a specific registration date (YYYY-MM-DD)")
    start_date = serializers.CharField(required=False, help_text="Filter by a start date range (YYYY-MM-DD)")
    end_date = serializers.CharField(required=False, help_text="Filter by an end date range (YYYY-MM-DD)")
    trust_circle_id = serializers.UUIDField(required=False, help_text="Filter by trust circle ID")
    vendor_id = serializers.UUIDField(required=False, help_text="Filter by vendor ID")
    state_id = serializers.UUIDField(required=False, help_text="Filter by state ID")
    lga_id = serializers.UUIDField(required=False, help_text="Filter by local government area ID")
    country_id = serializers.UUIDField(required=False, help_text="Filter by country ID")
    repayment_status = serializers.CharField(max_length=20, required=False, help_text="Filter by repayment status")
    status = serializers.CharField(max_length=20, required=False, help_text="Filter by status")


class FetchWomenFilterSerializer(serializers.Serializer):
    filters = WomanSerializer(required=False)
    count = serializers.IntegerField(required=False, help_text="Number of records to fetch")
