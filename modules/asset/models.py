from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import Count, Sum, Q
from django.db.utils import IntegrityError
from django.utils import timezone
from common.mixins import ModelMixin
from modules.asset.enums import AssetStatus, AssetActivityType


class Asset(ModelMixin):
    name = models.CharField(max_length=255, blank=True, null=True)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    markup = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=AssetStatus.choices, default=AssetStatus.REQUESTED, db_index=True)
    # Foreign key to vendor who owns the asset
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="requested_assets", null=True, blank=True)
    # Foreign key to woman who requested the asset
    woman = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="assets_requested", null=True, blank=True)
    loan_id = models.UUIDField(blank=True, null=True, unique=True, help_text="Loan ID from the bank system for the asset financing", db_index=True)
    loan_product_id = models.UUIDField(blank=True, null=True, help_text="Loan Product ID from the bank system for the asset financing", db_index=True)
    items_requested = models.JSONField(
        help_text="List of items the woman wants to purchase",
        default=list,
        blank=True,
    )

    @classmethod
    def get_fields(cls):
        return [
            "id",
            "name",
            "value",
            "markup",
            "status",
            "loan_id",
            "created_at",
            "items_requested",
            "woman__id",
            "woman__first_name",
            "woman__surname",
            "vendor__id",
            "vendor__first_name",
            "vendor__surname",
        ]

    @classmethod
    def create_asset(cls, **kwargs):
        try:
            return cls.objects.create(**kwargs)
        except IntegrityError:
            return None

    @classmethod
    def fetch_assets(cls, conditions=None, count=None):
        queryset = None
        if conditions:
            queryset = cls.objects.filter(conditions).order_by("-created_at").values(*cls.get_fields())
        if count:
            queryset = cls.objects.filter(created_at__date=timezone.now().date()).order_by("-created_at")[: int(count)].values(*cls.get_fields())
        return list(queryset)

    @classmethod
    def get_asset(cls, **filters):
        obj = filters.pop("obj", False)
        query_set = cls.objects.select_related("vendor", "woman")
        try:
            if obj:
                asset = query_set.get(**filters)
            else:
                asset = query_set.filter(**filters).values(*cls.get_fields()).first()
        except cls.DoesNotExist:
            asset = None
        return asset

    @classmethod
    def assign_loan_id(cls, asset_id=None, loan_id=None):
        try:
            with transaction.atomic():
                asset = cls.objects.select_for_update().get(id=asset_id)
                if asset.loan_id:
                    return dict(status=False, message="Loan ID already assigned", loan_id=asset.loan_id)

                asset.loan_id = loan_id
                asset.status = AssetStatus.REQUESTED
                asset.save(update_fields=["loan_id", "status"])
                return dict(status=True, message="Loan ID set", loan_id=asset.loan_id)

        except cls.DoesNotExist:
            return dict(status=False, message="Asset not found")

    @classmethod
    def update_assets(cls, asset_id, **kwargs):
        try:
            return cls.objects.filter(id=asset_id).update(**kwargs)
        except cls.DoesNotExist:
            return None

    @classmethod
    def fetch_asset_summaries(cls, member_id=None, conditions=None):
        queryset = cls.objects

        if conditions:
            queryset = queryset.filter(conditions)

        ongoing_statuses = [AssetStatus.REQUESTED, AssetStatus.APPROVED]
        completed_statuses = [AssetStatus.REJECTED, AssetStatus.FAILED]

        count_filters = {
            "total_ongoing_assets": Count("id", filter=Q(status__in=ongoing_statuses)),
            "total_completed_assets": Count("id", filter=Q(status__in=completed_statuses)),
            "total_ongoing_value": Sum("value", filter=Q(status__in=ongoing_statuses)),
            "total_completed_value": Sum("value", filter=Q(status__in=completed_statuses)),
            "total_ongoing_markup": Sum("markup", filter=Q(status__in=ongoing_statuses)),
            "total_completed_markup": Sum("markup", filter=Q(status__in=completed_statuses)),
        }

        if member_id:
            today = timezone.now().date()
            count_filters.update({
                "member_ongoing_assets": Count("id", filter=Q(status__in=ongoing_statuses, woman_id=member_id)),
                "member_completed_assets": Count(
                    "id",
                    filter=Q(status__in=completed_statuses, woman_id=member_id, created_at__date=today)
                ),
                "member_ongoing_value": Sum("value", filter=Q(status__in=ongoing_statuses, woman_id=member_id)),
                "member_completed_value": Sum(
                    "value",
                    filter=Q(status__in=completed_statuses, woman_id=member_id, created_at__date=today)
                ),
            })

        return queryset.aggregate(**count_filters)


class AssetActivity(ModelMixin):
    asset = models.ForeignKey("asset.Asset", on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=AssetActivityType.choices)
    description = models.TextField()
    metadata = models.JSONField(blank=True, null=True, help_text="Additional context data for the activity")
    performed_by = models.ForeignKey("vendor.Vendor", on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    @classmethod
    def create_activity(cls, **kwargs):
        return cls.objects.create(**kwargs)

    @classmethod
    def update_activity(cls, activity_id, **kwargs):
        return cls.objects.filter(id=activity_id).update(**kwargs)
