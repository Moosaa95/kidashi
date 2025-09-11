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
