from django.db import models
from django.db.models import Q
from django.db.utils import IntegrityError
from django.core.validators import RegexValidator
from typing import TYPE_CHECKING
from common.functions import json_list_default
from common.mixins import ModelMixin
from modules.general.models import Country, GeoRegion, LocalGovernment, State
from modules.trust_circle.enums import TrustCircleStatus
from modules.vendor.enums import BusinessTypes, Gender, GurantorVerificationStatus, VendorStatus

if TYPE_CHECKING:
    from django.db.models import QuerySet


class Vendor(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    account_number = models.CharField(max_length=11, unique=True, validators=[RegexValidator(regex=r"^\+?1?\d{9,15}$", message="Account number must be valid")], null=True, blank=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    business_type = models.CharField(max_length=20, choices=BusinessTypes.choices)
    business_description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, db_index=True)
    community = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    items_sold = models.JSONField(default=json_list_default, null=True, blank=True)
    status = models.CharField(max_length=20, choices=VendorStatus.choices, default=VendorStatus.PENDING, db_index=True)
    cba_customer_id = models.UUIDField(unique=True, help_text="Customer ID from the bank system", db_index=True)
    geo_region = models.ForeignKey(GeoRegion, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    lga = models.ForeignKey(LocalGovernment, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True, help_text="Reason vendor application was rejected")

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
            return dict(status=True, message="Vendor registered successfully", vendor_id=str(new_vendor.id), cba_customer_id=str(new_vendor.cba_customer_id))
        except IntegrityError as e:
            return dict(status=False, message=e.args[0])

    @classmethod
    def fetch_vendors(cls, conditions=None, count=None):
        queryset = cls.objects.all()

        if conditions:
            if isinstance(conditions, Q):
                queryset = queryset.filter(conditions)
            elif isinstance(conditions, dict):
                queryset = queryset.filter(**conditions)

        queryset = queryset.order_by("-created_at").values(*cls.get_fields())

        if count:
            queryset = queryset[: int(count)]

        return list(queryset)

    @classmethod
    def get_vendor(cls, **filters):
        try:
            return cls.objects.select_related("geo_region", "state", "lga", "country").prefetch_related("guarantors").get(**filters)
        except cls.DoesNotExist:
            return None

    @classmethod
    def update_vendor(cls, filters=None, params=None):
        if not filters or not params:
            return False
        return cls.objects.filter(**filters).update(**params)

    @classmethod
    def can_be_activated(cls, vendor_id: str) -> bool:
        return Guarantor.has_two_verified(vendor_id)


class Guarantor(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    relationship = models.CharField(max_length=100, blank=True, null=True)
    geo_region = models.ForeignKey(GeoRegion, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    lga = models.ForeignKey(LocalGovernment, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    verification_status = models.CharField(max_length=20, choices=GurantorVerificationStatus.choices, default=GurantorVerificationStatus.PENDING)
    gender = models.CharField(max_length=20, choices=Gender.choices, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="guarantors", db_index=True, null=True, blank=True)
    nin = models.CharField(
        max_length=11,  # NIN is 11 digits
        blank=True,
        null=True,
        help_text="National Identification Number",
        unique=True,
        validators=[RegexValidator(regex=r"^\d{11}$", message="NIN must be exactly 11 digits")],
        db_index=True,
    )

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

    @classmethod
    def has_two_verified(cls, vendor_id: str) -> bool:
        gurantors = cls.objects.filter(vendor_id=vendor_id)
        if gurantors.count() < 2:
            return False

        return gurantors.filter(verification_status=GurantorVerificationStatus.VERIFIED).count() >= 2

    @classmethod
    def update_guarantor(cls, guarantor_id, **kwargs):
        try:
            updated_count = cls.objects.filter(id=guarantor_id).update(**kwargs)
            if not updated_count:
                return None
            return cls.objects.only(*kwargs.keys()).get(id=guarantor_id)
        except cls.DoesNotExist:
            return None


class OnboardingActivityLogs(ModelMixin):  # TODO: add staff so for every rejection of vendor it comes with a message
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="onboarding_activities", null=True, blank=True)
    action = models.CharField(max_length=255)
    description = models.TextField()
    status = models.BooleanField(default=False)
    data = models.JSONField(default=dict)

    @classmethod
    def create_log(cls, **kwargs):
        if "vendor_cba_customer_id" in kwargs:
            kwargs["vendor__cba_customer_id"] = kwargs.pop("vendor_cba_customer_id")
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
