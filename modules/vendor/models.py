from django.core.exceptions import ValidationError
from django.db import models
from typing import TYPE_CHECKING
from common.mixins import ModelMixin
from modules.trust_circle.enums import TrustCircleStatus
from modules.vendor.enums import BusinessTypes, VendorStatus

if TYPE_CHECKING:
    from django.db.models import QuerySet


class Vendor(ModelMixin):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    business_type = models.CharField(max_length=20, choices=BusinessTypes.choices)
    business_description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255)
    community = models.CharField(max_length=255, blank=True, null=True)

    guarantors = models.JSONField(blank=True, null=True, help_text="Details of the guarantor - should contain name, phone, relationship fields")
    status = models.CharField(max_length=20, choices=VendorStatus.choices, default=VendorStatus.PENDING)
    cba_customer_id = models.CharField(max_length=50, unique=True, help_text="Customer ID from the bank system")

    if TYPE_CHECKING:
        trust_circles: "QuerySet"
        women: "QuerySet"

    class Meta:
        db_table = "vendors"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["cba_customer_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["location"]),
            models.Index(fields=["community"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.cba_customer_id})"

    @property
    def active_trust_circles_count(self):
        return self.trust_circles.filter(status=TrustCircleStatus.ACTIVE).count()

    @property
    def total_women_onboarded(self):
        return self.women.count()

    def clean(self):
        super().clean()
        if self.guarantors:
            if not isinstance(self.guarantors, list):
                raise ValidationError("Guarantors must be a list")

            required_fields = ["name", "phone", "relationship"]
            for guarantor in self.guarantors:
                if not all(field in guarantor for field in required_fields):
                    raise ValidationError(f"Each guarantor must have: {', '.join(required_fields)}")
