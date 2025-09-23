from django.utils import timezone
from django.db import models
from django.db.utils import IntegrityError
from typing import TYPE_CHECKING
from common.functions import json_list_default
from common.mixins import ModelMixin
from modules.general.models import Country, GeoRegion, LocalGovernment, State
from modules.trust_circle.enums import TrustCircleStatus
from modules.vendor.enums import BusinessTypes, GurantorVerificationStatus, VendorStatus

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
    items_sold = models.JSONField(default=json_list_default)
    status = models.CharField(max_length=20, choices=VendorStatus.choices, default=VendorStatus.PENDING, db_index=True)
    cba_customer_id = models.UUIDField(unique=True, help_text="Customer ID from the bank system", db_index=True)
    geo_region = models.ForeignKey(GeoRegion, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    lga = models.ForeignKey(LocalGovernment, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    if TYPE_CHECKING:
        trust_circles: "QuerySet"
        women: "QuerySet"

    class Meta:
        db_table = "vendors"
        ordering = ["-created_at"]
        indexes = []

    def __str__(self):
        return f"{self.first_name} {self.other_name} {self.surname} ({self.cba_customer_id})"

    @classmethod
    def get_fields(cls):
        return [
            "id",
            "first_name",
            "surname",
            "other_name",
            "phone",
            "email",
            "business_type",
            "business_description",
            "address",
            "community",
            "items_sold",
            "status",
            "cba_customer_id",
            "geo_region__name",
            "state__name",
            "lga__name",
            "country__name",
        ]

    @property
    def active_trust_circles_count(self):
        return self.trust_circles.filter(status=TrustCircleStatus.ACTIVE).count()

    @property
    def total_women_onboarded(self):
        return self.women.count()

    @classmethod
    def create_vendor(cls, **kwargs):
        try:
            new_vendor = cls.objects.create(**kwargs)
            return dict(status=True, message="Vendor registered successfully", vendor_id=new_vendor.id, cba_customer_id=new_vendor.cba_customer_id)
        except IntegrityError as e:
            return dict(status=False, message=e.args[0])

    @classmethod
    def fetch_vendors(cls, conditions=None, count=None):
        queryset = None
        if conditions:
            queryset = cls.objects.filter(conditions).order_by("-created_at").values(*cls.get_fields())

        if count:
            queryset = cls.objects.filter(created_at__date=timezone.now().date()).order_by("-created_at")[: int(count)].values(*cls.get_fields())

        return list(queryset)

    @classmethod
    def get_vendor(cls, **filters):
        try:
            return cls.objects.get(**filters)
        except cls.DoesNotExist:
            return False

    @classmethod
    def update_vendor(cls, filters=None, params=None):
        if not filters or not params:
            return False
        return cls.objects.filter(**filters).update(**params)


class Guarantor(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    relationship = models.CharField(max_length=100)
    verification_status = models.CharField(max_length=20, choices=GurantorVerificationStatus.choices, default=GurantorVerificationStatus.PENDING)
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="guarantors", db_index=True)

    class Meta:
        db_table = "guarantors"
        ordering = ["-created_at"]
        indexes = []
        unique_together = ["vendor", "phone"]

    def __str__(self):
        full_name = f"{self.first_name} {self.other_name} {self.surname}"
        return f"{full_name} - {self.relationship} of {self.vendor.first_name} {self.vendor.surname}"

    @classmethod
    def create_guarantors(cls, vendor_id, guarantors_data):
        if not vendor_id:
            return dict(status=False, message="Vendor id not found")

        guarantor_objs = [
            cls(
                vendor_id=vendor_id,
                first_name=g.get("first_name"),
                surname=g.get("surname"),
                other_name=g.get("other_name"),
                phone=g.get("phone"),
                relationship=g.get("relationship"),
            )
            for g in guarantors_data
        ]

        try:
            cls.objects.bulk_create(guarantor_objs)
            return dict(status=True, message="Guarantors created successfully")
        except IntegrityError as e:
            return dict(status=False, message=f"Failed to create guarantors: {str(e)}")

    @classmethod
    def get_guarantor(cls, **filters):
        try:
            return cls.objects.get(**filters)
        except cls.DoesNotExist:
            return False


class OnboardingActivityLogs(ModelMixin):
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="onboarding_activities")
    action = models.CharField(max_length=255)
    description = models.TextField()
    status = models.BooleanField(default=False)
    data = models.JSONField(default=dict)

    @classmethod
    def create_log(cls, **kwargs):
        return cls.objects.create(**kwargs)

    @classmethod
    def get_log(cls, **filters):
        try:
            return cls.objects.get(**filters)
        except cls.DoesNotExist:
            return False

    @classmethod
    def update_log(cls, log_id, **kwargs):
        return cls.objects.filter(id=log_id).update(**kwargs)
