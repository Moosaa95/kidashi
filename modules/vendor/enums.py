from django.db import models


class BusinessTypes(models.TextChoices):
    RETAIL = "RETAIL"
    WHOLESALE = "WHOLESALE"
    MANUFACTURING = "MANUFACTURING"
    SERVICES = "SERVICES"
    AGRICULTURE = "AGRICULTURE"
    OTHER = "OTHER"


class VendorStatus(models.TextChoices):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"


class VendorStage(models.TextChoices):
    BUSINESS_CATEGORY = "BUSINESS_CATEGORY"
    ITEMS = "ITEMS"
    GUARANTORS = "GUARANTORS"
    UNDER_REVIEW = "UNDER_REVIEW"


class GurantorVerificationStatus(models.TextChoices):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class Gender(models.TextChoices):
    MALE = "MALE"
    FEMALE = "FEMALE"
