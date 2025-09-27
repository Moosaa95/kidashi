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
