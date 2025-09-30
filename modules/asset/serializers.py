from rest_framework import serializers
from modules.asset.enums import AssetStatus
from django.core.validators import MinValueValidator


class AssetItemSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])


class AssetCreateRequestSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField(required=True, help_text="Vendor's customer ID")
    woman_id = serializers.UUIDField(required=True, help_text="Woman's customer ID")
    loan_product_id = serializers.UUIDField(required=True, help_text="Loan product id from payrep")
    name = serializers.CharField(max_length=255, required=False)
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    markup = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    loan_id = serializers.UUIDField(required=False, help_text="Loan ID from bank system")
    items_requested = serializers.ListField(child=AssetItemSerializer(), min_length=1)
    status = serializers.ChoiceField(choices=AssetStatus.choices, required=False, default=AssetStatus.REQUESTED)
    otp = serializers.CharField(max_length=10, required=False)


class AssetSerializer(serializers.Serializer):
    asset_id = serializers.UUIDField(required=False)
    name = serializers.CharField(required=False)
    value = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    markup = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    status = serializers.ChoiceField(choices=AssetStatus.choices, required=False)
    vendor_id = serializers.UUIDField(required=False)
    woman_id = serializers.UUIDField(required=False)
    loan_id = serializers.UUIDField(required=False)
    items_requested = serializers.ListField(child=serializers.DictField(), required=False)
    date = serializers.CharField(required=False, help_text="Filter by a specific date (YYYY-MM-DD)")
    start_date = serializers.CharField(required=False, help_text="Filter by a start date (YYYY-MM-DD)")
    end_date = serializers.CharField(required=False, help_text="Filter by an end date (YYYY-MM-DD)")


class FetchAssetsFilterSerializer(serializers.Serializer):
    filters = AssetSerializer(required=False)
    count = serializers.IntegerField(required=False, help_text="Optional number of recent records to fetch")


class GetAssetRequestSerializer(serializers.Serializer):
    asset_id = serializers.UUIDField(required=False)
    loan_id = serializers.UUIDField(required=False)

    def validate(self, attrs):
        if not attrs.get("asset_id") and not attrs.get("loan_id"):
            raise serializers.ValidationError("Provide either asset_id or loan_id")
        return attrs
