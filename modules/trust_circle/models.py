import os

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models
from django.db.utils import IntegrityError
from django.utils import timezone
from django.db.models import QuerySet, Q, When, Case, Value, BooleanField, F, Count
from typing import TYPE_CHECKING

from common.mixins import ModelMixin
from modules.trust_circle.enums import TrustCircleStatus, LoanEligibility, NewMembershipVoteOption, TrustCircleActivityType, VoteStatus
from modules.woman.enums import WomanStatus


class TrustCircle(ModelMixin):
    circle_name = models.CharField(max_length=255)
    loan_eligibility = models.CharField(max_length=20, choices=LoanEligibility.choices, default=LoanEligibility.UNDER_REVIEW, db_index=True)
    status = models.CharField(max_length=20, choices=TrustCircleStatus.choices, default=TrustCircleStatus.FORMING)

    # Foreign key to vendor who created this trust circle
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.DO_NOTHING, related_name="trust_circles", null=True, blank=True)

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
        return self.trust_circle_women.count()

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
            "activation_date",
            "description",
            "created_at",
            "updated_at",
        ]
        
    @classmethod
    def fetch_trust_circles(cls, **filters):
        return cls.objects.filter(**filters).values(*cls.get_fields())

    @classmethod
    def fetch_trust_circles_with_filter(cls, conditions=None, count=None, use_today=False):
        queryset = cls.objects.all()

        if use_today:
            queryset = queryset.filter(created_at__date=timezone.now().date())

        if conditions:
            queryset = queryset.filter(conditions)

        queryset = queryset.annotate(
            current_member_count=Count("trust_circle_women"),
            get_active_members=Count(
                "trust_circle_women",
                filter=Q(trust_circle_women__status=TrustCircleStatus.ACTIVE),
            ),
            can_add_more_members=Case(
                When(current_member_count__lt=F("max_members"), then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            ),
            is_full=Case(
                When(current_member_count__gte=F("max_members"), then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            ),
            can_accept_new_members_by_voting=Case(
                When(
                    Q(status=TrustCircleStatus.ACTIVE) & Q(loan_eligibility=LoanEligibility.ELIGIBLE),
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            ),
        )
        queryset = queryset.order_by("-created_at")

        if count:
            queryset = queryset[: int(count)]

        return queryset.values(
            "id",
            "circle_name",
            "description",
            "max_members",
            "current_member_count",
            "get_active_members",
            "can_add_more_members",
            "is_full",
            "can_accept_new_members_by_voting",
            "status",
            "loan_eligibility",
            "activation_date",
            "created_at",
            "updated_at",
            "vendor_id",
        )

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
                trust_circle = cls.objects.select_related("vendor").prefetch_related("trust_circle_women").get(**kwargs)
            return trust_circle
        except cls.DoesNotExist:
            return None

    def clean(self):
        super().clean()
        if self.pk and self.current_member_count > self.max_members:
            raise ValidationError(f"Trust circle cannot have more than {self.max_members} members")



class CircleMembershipVote(ModelMixin):
    """
    Model to track voting for new trust circle members when circle has 3+ members
    """

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE, related_name="membership_votes", null=True, blank=True)
    candidate_member = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="membership_votes", null=True, blank=True)
    initiating_vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, db_index=True, null=True, blank=True)
    voter = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="votes_cast", null=True, blank=True)

    # Vote metadata
    status = models.CharField(max_length=20, choices=VoteStatus.choices, default=VoteStatus.PENDING)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "circle_membership_votes"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["trust_circle", "candidate_member"]),
        ]
        unique_together = [["trust_circle", "candidate_member", "status"]]  # Prevent duplicate pending votes

    def __str__(self):
        return f"Vote for {self.candidate_member} in {self.trust_circle.circle_name} - {self.status}"
    
    @classmethod
    def get_fields(cls):
        return [
            "id",
            "trust_circle_id",
            "trust_circle__circle_name",
            "candidate_member_id",
            "candidate_member__first_name",
            "candidate_member__surname",
            "initiating_vendor_id",
            "initiating_vendor__first_name",
            "initiating_vendor__surname",
            "voter_id",
            "voter__first_name",
            "voter__surname",
            "voter__mobile_number",
            "status",
            "completed_at",
            "created_at",
            "updated_at",
        ]
    
    @classmethod
    def create_vote(cls, **kwargs):
        try:
            vote = cls.objects.create(**kwargs)
            return vote
        except IntegrityError:
            return None
        
    @classmethod
    def get_vote(cls, **kwargs):
        try:
            vote = cls.objects.get(**kwargs)
            return vote
        except cls.DoesNotExist:
            return None

    @classmethod
    def fetch_votes(cls, **kwargs):
        return cls.objects.filter(**kwargs).values(*cls.get_fields())

    @classmethod
    def update_vote_status(cls, vote_id, status):
        return cls.objects.filter(id=vote_id).update(status=status)

    @classmethod
    def delete_vote(cls, vote_id):
        vote = cls.objects.filter(id=vote_id).first()

        if not vote:
            return dict(status=False, message="No vote found for the given voter_id")
        
        if vote.status != VoteStatus.PENDING:
            return dict(status=False, message="Only pending votes can be deleted")
        
        deleted_vote = cls.objects.filter(voter_id=voter_id).delete()
        if not deleted_vote:
            return dict(status=False, message="Failed to delete the vote")
        
        return dict(status=True, message="Vote deleted successfully")
     
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
