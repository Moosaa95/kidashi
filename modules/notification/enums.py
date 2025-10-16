from django.db import models


class NotificationChannel(models.TextChoices):
    EMAIL = "email", "Email"
    SMS = "sms", "SMS"


class NotificationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SENT = "sent", "Sent"
    FAILED = "failed", "Failed"


class NotificationType(models.TextChoices):
    GENERAL = "general", "General"
    WOMAN_ONBOARDING = "woman_onboarding", "Woman Onboarding"
    WOMAN_STATUS_UPDATE = "woman_status_update", "Woman Status Update"
    VENDOR_ALERT = "vendor_alert", "Vendor Alert"
    ASSET_REQUEST = "asset_request", "Asset Request"


class InAppEventType(models.TextChoices):
    VENDOR_STATUS_CHANGED = "VENDOR_STATUS_CHANGED", "Vendor status updated"
    TRUST_CIRCLE_CREATED = "TRUST_CIRCLE_CREATED", "Trust circle created"
    MEMBER_JOINED = "MEMBER_JOINED", "New member joined"
    ASSET_APPROVED = "ASSET_APPROVED", "Asset approved"
    ASSET_DENIED = "ASSET_DENIED", "Asset denied"
    FUNDING_CREDITED = "FUNDING_CREDITED", "Funding credited"
    WOMAN_ONBOARDED = "WOMAN_ONBOARDED", "Woman onboarded"
    VENDOR_ONBOARDED = "VENDOR_ONBOARDED", "Vendor onboarded"
    ASSET_WARNING = "ASSET_WARNING", "Asset Warning"
