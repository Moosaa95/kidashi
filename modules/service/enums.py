from django.db import models


class ServiceChannel(models.TextChoices):
    MOBILE = "MOBILE", "Mobile App"
    USSD = "USSD", "USSD"
    IVR = "IVR", "IVR"
    WEB = "WEB", "Web"
    API = "API", "API"


class ServiceCategoryType(models.TextChoices):
    CORE_BANKING = "CORE_BANKING", "Core Banking"
    VALUE_ADDED = "VALUE_ADDED", "Value Added"
    SUPPORT = "SUPPORT", "Support"

class ServiceCode(models.TextChoices):
    CBA_CODE = "cba01", "cba01"
    SMS_CODE = "sms01", "sms01"
