from django.db import models


class AssetStatus(models.TextChoices):
    REQUESTED = "REQUESTED"


class AssetActivityType(models.TextChoices):
    ASSET_REQUEST = "ASSET_REQUEST"
