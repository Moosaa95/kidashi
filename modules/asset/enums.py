from django.db import models


class AssetStatus(models.TextChoices):
    REQUESTED = "REQUESTED"
    QUERIED = "QUERIED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AssetActivityType(models.TextChoices):
    ASSET_REQUEST = "ASSET_REQUEST"
