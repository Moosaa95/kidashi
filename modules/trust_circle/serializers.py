from rest_framework import serializers


class CreateTrustCircleRequestSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=True)
    circle_name = serializers.CharField(required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True)


class TrustCircleSerializer(serializers.Serializer):
    trust_circle_id = serializers.UUIDField(required=False, help_text="ID of the trust circle")
    circle_name = serializers.CharField(required=False, help_text="Filter by circle name")
    status = serializers.CharField(required=False, help_text="Filter by status")
    loan_eligibility = serializers.CharField(required=False, help_text="Filter by loan eligibility")
    vendor_id = serializers.UUIDField(required=False, help_text="Filter by vendor ID")
    date = serializers.CharField(required=False, help_text="Filter by a specific creation date (YYYY-MM-DD)")
    start_date = serializers.CharField(required=False, help_text="Filter by a start date range (YYYY-MM-DD)")
    end_date = serializers.CharField(required=False, help_text="Filter by an end date range (YYYY-MM-DD)")


class FetchTrustCircleFilterSerializer(serializers.Serializer):
    filters = TrustCircleSerializer(required=False)
    count = serializers.IntegerField(required=False, help_text="Number of records to fetch")
