import os

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models
from typing import TYPE_CHECKING

from django.db.models import QuerySet

from common.mixins import ModelMixin
from modules.trust_circle.enums import TrustCircleStatus, LoanEligibility, NewMembershipVoteOption, TrustCircleActivityType
from modules.woman.enums import WomanStatus


class TrustCircle(ModelMixin):
    circle_name = models.CharField(max_length=255)
    loan_eligibility = models.CharField(max_length=20, choices=LoanEligibility.choices, default=LoanEligibility.UNDER_REVIEW, db_index=True)
    status = models.CharField(max_length=20, choices=TrustCircleStatus.choices, default=TrustCircleStatus.FORMING)

    # Foreign key to vendor who created this trust circle
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="trust_circles")

    max_members = models.PositiveIntegerField(
        default=10,
        validators=[MaxValueValidator(int(os.getenv("TRUST_CIRCLE_MAX_MEMBERS", 10)))],
        help_text="Maximum number of women allowed in this circle",
    )
    activation_date = models.DateTimeField(blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    if TYPE_CHECKING:
        women: "QuerySet"

    class Meta:
        db_table = "trust_circles"
        ordering = ["-created_at"]
        unique_together = ["vendor", "circle_name"]
        indexes = [
            models.Index(fields=["vendor", "status"]),
        ]

    def __str__(self):
        return f"{self.circle_name} - {self.vendor}"

    @property
    def current_member_count(self):
        return self.women.filter(status=WomanStatus.ACTIVE).count()

    @property
    def can_add_more_members(self):
        return self.current_member_count < self.max_members

    @property
    def is_full(self):
        return self.current_member_count >= self.max_members

    @property
    def can_accept_new_members_by_voting(self):
        """
        Returns True if circle has 3+ members and voting is required for new additions
        """
        return self.current_member_count >= 3

    def clean(self):
        super().clean()
        if self.pk and self.current_member_count > self.max_members:
            raise ValidationError(f"Trust circle cannot have more than {self.max_members} members")


class CircleMembershipVote(ModelMixin):
    """
    Model to track voting for new trust circle members when circle has 3+ members
    """

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE)
    voter = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="votes_cast")
    candidate_name = models.CharField(max_length=255)
    candidate_phone = models.CharField(max_length=20)
    vote = models.CharField(max_length=10, choices=NewMembershipVoteOption.choices)

    voting_deadline = models.DateTimeField(blank=True, null=True, db_index=True)
    reason = models.TextField(blank=True, null=True, help_text="Optional reason for the vote")

    class Meta:
        db_table = "circle_membership_votes"
        unique_together = ["trust_circle", "voter", "candidate_phone"]
        indexes = [
            models.Index(fields=["trust_circle", "candidate_phone"]),
        ]

    def __str__(self):
        return f"{self.voter.name} voted {self.vote} for {self.candidate_name}"

    def clean(self):
        super().clean()
        # Ensure voter belongs to the trust circle
        if self.voter.trust_circle != self.trust_circle:
            raise ValidationError("Voter must be a member of the trust circle they are voting for")


class CircleActivity(ModelMixin):
    """
    Model to track activities within trust circles for audit purposes
    """

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=20, choices=TrustCircleActivityType.choices)
    description = models.TextField()
    performed_by = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, db_index=True)
    affected_woman = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, blank=True, null=True)

    metadata = models.JSONField(blank=True, null=True, help_text="Additional context data for the activity")
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        db_table = "circle_activities"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["trust_circle", "activity_type"]),
        ]

    def __str__(self):
        return f"{self.activity_type} - {self.trust_circle.circle_name}"
