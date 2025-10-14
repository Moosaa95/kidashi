from django.db import models


class AssetStatus(models.TextChoices):
    REQUESTED = "REQUESTED"
    QUERIED = "QUERIED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"
    CLOSED = "CLOSED"
    RUNNING = "RUNNING"


class AssetActivityType(models.TextChoices):
    ASSET_REQUEST = "ASSET_REQUEST"
    SYNC_START = "SYNC_START", "Sync started with PayRep"
    SYNC_SUCCESS = "SYNC_SUCCESS", "Sync success with PayRep"
    SYNC_FAILED = "SYNC_FAILED", "Sync failed with PayRep"
    SYNC_WARNING = "SYNC_WARNING", "Sync warning (partial success)"

    # --- Loan Lifecycle ---
    LOAN_DISBURSED = "LOAN_DISBURSED", "Loan disbursed to woman"
    LOAN_REPAYMENT = "LOAN_REPAYMENT", "Loan repayment recorded"
    LOAN_DEFAULT = "LOAN_DEFAULT", "Loan defaulted"
    LOAN_CLOSED = "LOAN_CLOSED", "Loan fully repaid / closed"
