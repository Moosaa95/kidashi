from django.db import models


class WomanStatus(models.TextChoices):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    LEFT_CIRCLE = "LEFT_CIRCLE"


class RepaymentStatus(models.TextChoices):
    ON_TIME = "ON_TIME"
    LATE = "LATE"
    DEFAULTED = "DEFAULTED"
    PAID_OFF = "PAID_OFF"
    UNDER_REVIEW = "UNDER_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    ONGOING = "ONGOING"
