from django.db import models
from typing import TYPE_CHECKING
from common.mixins import ModelMixin
from modules.trust_circle.enums import TrustCircleStatus
from modules.vendor.enums import BusinessTypes, VendorStatus

if TYPE_CHECKING:
    from django.db.models import QuerySet


class Vendor(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    business_type = models.CharField(max_length=20, choices=BusinessTypes.choices)
    business_description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, db_index=True)
    community = models.CharField(max_length=255, blank=True, null=True, db_index=True)

    status = models.CharField(max_length=20, choices=VendorStatus.choices, default=VendorStatus.PENDING, db_index=True)
    cba_customer_id = models.UUIDField(max_length=50, unique=True, help_text="Customer ID from the bank system", db_index=True)

    if TYPE_CHECKING:
        trust_circles: "QuerySet"
        women: "QuerySet"

    class Meta:
        db_table = "vendors"
        ordering = ["-created_at"]
        indexes = []

    def __str__(self):
        return f"{self.first_name} {self.middle_name} {self.last_name} ({self.cba_customer_id})"

    @property
    def active_trust_circles_count(self):
        return self.trust_circles.filter(status=TrustCircleStatus.ACTIVE).count()

    @property
    def total_women_onboarded(self):
        return self.women.count()


class Guarantor(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, db_index=True)
    relationship = models.CharField(max_length=100)
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="guarantors", db_index=True)

    class Meta:
        db_table = "guarantors"
        ordering = ["-created_at"]
        indexes = []
        unique_together = ["vendor", "phone"]

    def __str__(self):
        full_name = f"{self.first_name} {self.other_name} {self.surname}"
        return f"{full_name} - {self.relationship} of {self.vendor.first_name} {self.vendor.last_name}"
