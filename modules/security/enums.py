from django.db import models


class OtpPurpose(models.TextChoices):
    ASSET_REQUEST = "ASSET_REQUEST", "Asset Request"
    GUARANTOR_APPROVAL = "GUARANTOR_APPROVAL", "Guarantor Approval"
    OTHER = "OTHER", "Other"
