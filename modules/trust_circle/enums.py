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
    APPROVE = "APPROVE"
    REJECT = "REJECT"


class VoteStatus(models.TextChoices):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class TrustCircleActivityType(models.TextChoices):
    # Circle management activities
    CIRCLE_CREATED = "CIRCLE_CREATED"
    CIRCLE_UPDATED = "CIRCLE_UPDATED"
    CIRCLE_ACTIVATED = "CIRCLE_ACTIVATED"
    CIRCLE_SUSPENDED = "CIRCLE_SUSPENDED"
    CIRCLE_CLOSED = "CIRCLE_CLOSED"

    # Member management activities
    MEMBER_ADDED = "MEMBER_ADDED"
    MEMBER_REMOVED = "MEMBER_REMOVED"
    MEMBER_SUSPENDED = "MEMBER_SUSPENDED"
    MEMBER_REACTIVATED = "MEMBER_REACTIVATED"

    # Voting activities
    VOTE_INITIATED = "VOTE_INITIATED"
    VOTE_SUBMITTED = "VOTE_SUBMITTED"
    VOTE_COMPLETED = "VOTE_COMPLETED"
    VOTE_EXPIRED = "VOTE_EXPIRED"
    VOTE_CANCELLED = "VOTE_CANCELLED"

    # Communication activities
    OTP_SENT = "OTP_SENT"
    OTP_RESENT = "OTP_RESENT"
    OTP_VERIFIED = "OTP_VERIFIED"

    # Loan and financial activities
    LOAN_APPLIED = "LOAN_APPLIED"
    LOAN_APPROVED = "LOAN_APPROVED"
    LOAN_REJECTED = "LOAN_REJECTED"
    LOAN_DISBURSED = "LOAN_DISBURSED"
    LOAN_REPAID = "LOAN_REPAID"

    # Administrative activities
    ADMIN_ACTION = "ADMIN_ACTION"
    VENDOR_ACTION = "VENDOR_ACTION"
    SYSTEM_ACTION = "SYSTEM_ACTION"
