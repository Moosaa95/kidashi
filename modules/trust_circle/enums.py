from django.db import models


class TrustCircleStatus(models.TextChoices):
    FORMING = "FORMING"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    CLOSED = "CLOSED"


class LoanEligibility(models.TextChoices):
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    UNDER_REVIEW = "UNDER_REVIEW"


class NewMembershipVoteOption(models.TextChoices):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class TrustCircleActivityType(models.TextChoices):
    CIRCLE_CREATED = "CIRCLE_CREATED"
    MEMBER_ADDED = "MEMBER_ADDED"
    MEMBER_REMOVED = "MEMBER_REMOVED"
    LOAN_DISBURSED = "LOAN_DISBURSED"
    PAYMENT_MADE = "PAYMENT_MADE"
    STATUS_CHANGED = "STATUS_CHANGED"
    VOTING_INITIATED = "VOTING_INITIATED"
