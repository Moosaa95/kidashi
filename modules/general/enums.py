from django.db import models


class CustomerStage(models.TextChoices):
    NEW_USER = "NEW_USER"
    VENDOR_ONBOARDING = "VENDOR_ONBOARDING"
    MOBILE_NUMBER_REGISTRATION = "MOBILE_NUMBER_REGISTRATION"
    EMAIL_REGISTRATION = "EMAIL_REGISTRATION"
    PASSWORD_REGISTRATION = "PASSWORD_REGISTRATION"
    BVN_VERIFICATION = "BVN_VERIFICATION"
    LOCATION = "LOCATION"
    IDENTIFICATION = "IDENTIFICATION"
    PEP = "PEP"
    SOURCE_OF_INCOME = "SOURCE_OF_INCOME"
    BUSINESS_INFORMATION = "BUSINESS_INFORMATION"
    PIN = "PIN"
    ATTESTATION = "ATTESTATION"


class CustomerTypes(models.TextChoices):
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"


class MobileNUmberTypes(models.TextChoices):
    PRIMARY = "primary"
    secondary = "secondary"
