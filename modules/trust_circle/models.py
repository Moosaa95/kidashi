import os
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models
from django.utils import timezone
from typing import TYPE_CHECKING

from django.db.models import QuerySet

from common.mixins import ModelMixin
from modules.trust_circle.enums import TrustCircleStatus, LoanEligibility, NewMembershipVoteOption, TrustCircleActivityType, VoteStatus
from modules.woman.enums import WomanStatus


class TrustCircle(ModelMixin):
    circle_name = models.CharField(max_length=255)
    loan_eligibility = models.CharField(max_length=20, choices=LoanEligibility.choices, default=LoanEligibility.UNDER_REVIEW, db_index=True)
    status = models.CharField(max_length=20, choices=TrustCircleStatus.choices, default=TrustCircleStatus.FORMING)

    # Foreign key to vendor who created this trust circle
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="trust_circles", null=True, blank=True)

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

    # @property
    # def current_member_count(self):
    #     return self.women.filter(status=WomanStatus.ACTIVE).count()
    #
    # @property
    # def can_add_more_members(self):
    #     return self.current_member_count < self.max_members
    #
    # @property
    # def is_full(self):
    #     return self.current_member_count >= self.max_members
    #
    # @property
    # def can_accept_new_members_by_voting(self):
    #     """
    #     Returns True if circle has 3+ members and voting is required for new additions
    #     """
    #     return self.current_member_count >= 3

    def get_active_members(self):
        """Get all active members of the trust circle"""
        return self.women.filter(status=WomanStatus.ACTIVE)

    @classmethod
    def create_trust_circle(cls, **kwargs):
        return cls.objects.create(**kwargs)

    @classmethod
    def get_fields(cls):
        return [
            "id",
            "vendor_id",
            "vendor__first_name",
            "vendor__surname",
            "vendor__cba_customer_id",
            "circle_name",
            "loan_eligibility",
            "status",
            "max_members",
            # "current_member_count",
            # "can_add_more_members",
            # "is_full",
            # "can_accept_new_members_by_voting",
            "activation_date",
            "description",
            "created_at",
            "updated_at",
        ]

    @classmethod
    def fetch_trust_circles_with_filter(cls, conditions=None, count=None, use_today=False):
        queryset = cls.objects.all()

        if use_today:
            queryset = queryset.filter(created_at__date=timezone.now().date())

        if conditions:
            queryset = queryset.filter(conditions)

        queryset = queryset.order_by("-created_at")

        if count:
            queryset = queryset[: int(count)]

        return list(queryset.values(*cls.get_fields()))

    @classmethod
    def get_trust_circle(cls, **kwargs):
        trust_circle_id = kwargs.pop("trust_circle_id", None)
        values = kwargs.pop("values", None)

        if trust_circle_id:
            kwargs["id"] = trust_circle_id
        try:
            if values:
                trust_circle = cls.objects.filter(**kwargs).values(*cls.get_fields())
                if trust_circle.count():
                    trust_circle = trust_circle.first()
            else:
                trust_circle = cls.objects.select_related("vendor").prefetch_related("women").get(**kwargs)
            return trust_circle
        except cls.DoesNotExist:
            return None

    def clean(self):
        super().clean()
        # if self.pk and self.current_member_count > self.max_members:
        #     raise ValidationError(f"Trust circle cannot have more than {self.max_members} members")


class CircleMembershipVote(ModelMixin):
    """
    Model to track voting for new trust circle members when circle has 3+ members
    """

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE, related_name="membership_votes", null=True, blank=True)
    candidate_member = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="membership_votes", null=True, blank=True)
    initiating_vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, db_index=True, null=True, blank=True)

    # Voting participants
    voter_one = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="votes_as_voter_one", null=True, blank=True)
    voter_two = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="votes_as_voter_two", null=True, blank=True)
    voter_three = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="votes_as_voter_three", null=True, blank=True)

    # OTP codes for verification
    voter_one_otp = models.CharField(max_length=10, blank=True, null=True)
    voter_two_otp = models.CharField(max_length=10, blank=True, null=True)
    voter_three_otp = models.CharField(max_length=10, blank=True, null=True)

    # Generated OTPs to verify against
    voter_one_generated_otp = models.CharField(max_length=10, blank=True, null=True)
    voter_two_generated_otp = models.CharField(max_length=10, blank=True, null=True)
    voter_three_generated_otp = models.CharField(max_length=10, blank=True, null=True)

    # Vote tracking
    voter_one_vote = models.CharField(max_length=10, choices=NewMembershipVoteOption.choices, blank=True, null=True)
    voter_two_vote = models.CharField(max_length=10, choices=NewMembershipVoteOption.choices, blank=True, null=True)
    voter_three_vote = models.CharField(max_length=10, choices=NewMembershipVoteOption.choices, blank=True, null=True)

    # Vote metadata
    status = models.CharField(max_length=20, choices=VoteStatus.choices, default=VoteStatus.PENDING)
    voting_deadline = models.DateTimeField(help_text="Deadline for completing the vote")
    completed_at = models.DateTimeField(blank=True, null=True)

    # Results
    approved_votes = models.PositiveIntegerField(default=0)
    rejected_votes = models.PositiveIntegerField(default=0)
    result_message = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "circle_membership_votes"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["trust_circle", "candidate_member"]),
            models.Index(fields=["status", "voting_deadline"]),
        ]
        unique_together = [["trust_circle", "candidate_member", "status"]]  # Prevent duplicate pending votes

    def __str__(self):
        return f"Vote for {self.candidate_member} in {self.trust_circle.circle_name} - {self.status}"

    def save(self, *args, **kwargs):
        # Set voting deadline if not provided (e.g., 1 Week from creation)
        if not self.voting_deadline:
            self.voting_deadline = timezone.now() + timezone.timedelta(weeks=1)
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()

        # Ensure all voters belong to the trust circle
        # active_members = self.trust_circle.get_active_members()

        # if self.voter_one not in active_members:
        #     raise ValidationError("Voter one must be an active member of the trust circle")
        # if self.voter_two not in active_members:
        #     raise ValidationError("Voter two must be an active member of the trust circle")
        # if self.voter_three not in active_members:
        #     raise ValidationError("Voter three must be an active member of the trust circle")

        # Ensure all voters are unique
        # voters = [self.voter_one, self.voter_two, self.voter_three]
        # if len(set(voters)) != 3:
        #     raise ValidationError("All three voters must be different members")
        #
        # # Ensure candidate is not already a member
        # if self.candidate_member in active_members:
        #     raise ValidationError("Candidate member is already an active member of the trust circle")
        #
        # # Ensure trust circle has exactly 3 or more members
        # if active_members.count() < 3:
        #     raise ValidationError("Trust circle must have at least 3 members to initiate voting")

    @property
    def is_expired(self):
        """Check if voting deadline has passed"""
        return timezone.now() > self.voting_deadline

    @property
    def votes_received(self):
        """Count how many votes have been submitted"""
        count = 0
        if self.voter_one_vote:
            count += 1
        if self.voter_two_vote:
            count += 1
        if self.voter_three_vote:
            count += 1
        return count

    @property
    def is_complete(self):
        """Check if all three votes have been received"""
        return self.votes_received == 3

    def verify_otp(self, voter_position, submitted_otp):
        """
        Verify OTP for a specific voter position
        Returns True if OTP is correct, False otherwise
        """
        if voter_position == 1:
            return self.voter_one_generated_otp and self.voter_one_generated_otp == submitted_otp
        elif voter_position == 2:
            return self.voter_two_generated_otp and self.voter_two_generated_otp == submitted_otp
        elif voter_position == 3:
            return self.voter_three_generated_otp and self.voter_three_generated_otp == submitted_otp
        return False

    def submit_vote(self, voter_position, otp, vote_choice):
        """
        Submit a vote for a specific voter position after OTP verification
        """
        if not self.verify_otp(voter_position, otp):
            raise ValidationError("Invalid OTP provided")

        if vote_choice not in [choice[0] for choice in NewMembershipVoteOption.choices]:
            raise ValidationError("Invalid vote choice")

        # Record the vote
        if voter_position == 1:
            self.voter_one_otp = otp
            self.voter_one_vote = vote_choice
        elif voter_position == 2:
            self.voter_two_otp = otp
            self.voter_two_vote = vote_choice
        elif voter_position == 3:
            self.voter_three_otp = otp
            self.voter_three_vote = vote_choice

        # Update vote counts
        self.calculate_vote_results()

        # Check if voting is complete
        if self.is_complete:
            self.finalize_vote()

        self.save()

    def calculate_vote_results(self):
        """Calculate and update vote counts"""
        votes = [self.voter_one_vote, self.voter_two_vote, self.voter_three_vote]
        self.approved_votes = votes.count(NewMembershipVoteOption.APPROVE)
        self.rejected_votes = votes.count(NewMembershipVoteOption.REJECT)

    def finalize_vote(self):
        """Finalize the voting process and determine outcome"""
        if self.approved_votes == 3:  # Total approval
            self.status = VoteStatus.APPROVED
            self.result_message = f"Candidate approved with {self.approved_votes} out of 3 votes"
        else:
            self.status = VoteStatus.REJECTED
            self.result_message = f"Candidate rejected with {self.rejected_votes} out of 3 votes"

        self.completed_at = timezone.now()

    def expire_vote(self):
        """Mark vote as expired if deadline has passed"""
        if self.is_expired and self.status == VoteStatus.PENDING:
            self.status = VoteStatus.EXPIRED
            self.result_message = "Voting deadline expired"
            self.save()

    @classmethod
    def create_vote(cls, trust_circle, candidate_member, initiating_vendor, voters=None):
        """
        Create a new membership vote
        If voters not provided, automatically select 3 random active members
        """
        active_members = trust_circle.get_active_members()

        if active_members.count() < 3:
            raise ValidationError("Trust circle must have at least 3 members to create a vote")

        if voters is None:
            # Auto-select all members if exactly 3, otherwise raise error for manual selection
            if active_members.count() == 3:
                voters = list(active_members)
            else:
                raise ValidationError("Must specify 3 voters when circle has more than 3 members")

        if len(voters) != 3:
            raise ValidationError("Exactly 3 voters must be specified")

        vote = cls.objects.create(trust_circle=trust_circle, candidate_member=candidate_member, initiating_vendor=initiating_vendor, voter_one=voters[0], voter_two=voters[1], voter_three=voters[2])

        return vote


class CircleActivity(ModelMixin):
    """
    Model to track activities within trust circles for audit purposes
    """

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=TrustCircleActivityType.choices)
    description = models.TextField()
    performed_by = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, db_index=True, null=True, blank=True)
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

    @classmethod
    def create_activity(cls, **kwargs):
        return cls.objects.create(**kwargs)
