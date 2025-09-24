from django.core.validators import MinValueValidator
from django.db import models

from common.mixins import ModelMixin
from modules.asset.enums import AssetStatus, AssetActivityType


class Asset(ModelMixin):
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    markup = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=AssetStatus.choices, default=AssetStatus.REQUESTED, db_index=True)
    # Foreign key to vendor who owns the asset
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="requested_assets", null=True, blank=True)
    # Foreign key to woman who requested the asset
    woman = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="assets_requested", null=True, blank=True)
    loan_id = models.UUIDField(unique=True, help_text="Loan ID from the bank system for the asset financing", db_index=True)


class AssetActivity(ModelMixin):
    asset = models.ForeignKey("asset.Asset", on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=AssetActivityType.choices)
    description = models.TextField()
    metadata = models.JSONField(blank=True, null=True, help_text="Additional context data for the activity")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
