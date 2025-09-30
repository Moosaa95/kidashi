from django.core.exceptions import ValidationError
from django.db import models
from django.db.utils import IntegrityError
from common.functions import gen_random_key
from common.mixins import ModelMixin
from modules.asset.enums import AssetStatus
from modules.general.enums import CustomerStage
from modules.general.models import GeoRegion, State, LocalGovernment, Country
from modules.woman.enums import RepaymentStatus, WomanStatus
from django.core.validators import RegexValidator
from datetime import date


class Woman(ModelMixin):
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    mobile_number = models.CharField(max_length=20, unique=True, validators=[RegexValidator(regex=r"^\+?1?\d{9,15}$", message="Phone number must be valid")])
    account_number = models.CharField(max_length=11, unique=True, validators=[RegexValidator(regex=r"^\+?1?\d{9,15}$", message="Account number must be valid")])
    maximum_balance = models.DecimalField(default=0, max_digits=19, decimal_places=2)
    tier = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    dob = models.DateTimeField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    annual_income = models.CharField(max_length=100, blank=True, null=True)
    employment_type = models.CharField(max_length=100, blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    residential_address = models.CharField(max_length=255, null=True, blank=True)
    stage = models.CharField(max_length=100, choices=CustomerStage.choices, default=CustomerStage.VENDOR_ONBOARDING)
    private_key = models.CharField(max_length=255, default=gen_random_key)

    nin = models.CharField(
        max_length=11,  # NIN is 11 digits
        blank=True,
        null=True,
        help_text="National Identification Number",
        unique=True,
        validators=[RegexValidator(regex=r"^\d{11}$", message="NIN must be exactly 11 digits")],
        db_index=True,
    )
    bvn = models.CharField(
        max_length=11,  # BVN is 11 digits
        blank=True,
        null=True,
        help_text="Bank Verification Number",
        unique=True,
        validators=[RegexValidator(regex=r"^\d{11}$", message="BVN must be exactly 11 digits")],
        db_index=True,
    )
    next_of_kin = models.OneToOneField(
        "NextOfKin",
        related_name="next_of_kin",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    cba_customer_id = models.UUIDField(blank=True, null=True, help_text="Customer ID from the bank system", unique=True, db_index=True)
    repayment_status = models.CharField(max_length=20, choices=RepaymentStatus.choices, default=RepaymentStatus.NOT_APPLICABLE, db_index=True)
    status = models.CharField(max_length=20, choices=WomanStatus.choices, default=WomanStatus.ACTIVE)

    # Foreign key relationships
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="women", help_text="Vendor who onboarded this woman", null=True, blank=True)
    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE, related_name="women", help_text="Trust circle this woman belongs to", null=True, blank=True)
    geo_region = models.ForeignKey(GeoRegion, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    lga = models.ForeignKey(LocalGovernment, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "women"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "status"]),
            models.Index(fields=["trust_circle", "status"]),
        ]

    def __str__(self):
        full_name = f"{self.first_name} {self.other_name} {self.surname}"
        return f"{full_name}"

    @classmethod
    def get_fields(cls):
        return [
            "id",
            "first_name",
            "surname",
            "other_name",
            "phone",
            "email",
            "dob",
            "mobile_number",
            "nationality",
            "occupation",
        ]

    @property
    def has_active_loan(self):
        active_statuses = [AssetStatus.REQUESTED, AssetStatus.APPROVED, AssetStatus.QUERIED]
        return self.assets_requested.filter(status__in=active_statuses).exists()

    @property
    def age(self):
        if not self.dob:
            return None

        today = date.today()
        return today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))

    def clean(self):
        super().clean()

        # Check woman belongs only to trust circle created by the same vendor
        # if self.vendor_id and self.trust_circle_id:
        #     if self.vendor != self.trust_circle.vendor:
        #         raise ValidationError("Woman must be assigned to a trust circle created by the same vendor")

        # Check if trust circle is full
        if not self.pk and self.trust_circle_id:  # Only check for new instances
            if self.trust_circle.is_full:
                raise ValidationError(f"Trust circle '{self.trust_circle.circle_name}' is full")

        if self.repayment_status != RepaymentStatus.NOT_APPLICABLE and self.loan_amount == 0:
            raise ValidationError("Loan amount must be greater than 0 when repayment status is not 'Not Applicable'")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @classmethod
    def create_woman(cls, **kwargs):
        try:
            woman = cls.objects.create(**kwargs)
            return dict(status=True, message="Woman created successfully", woman=woman)
        except IntegrityError as e:
            return dict(status=False, message=e.args[0])

    @classmethod
    def fetch_women(cls, conditions):
        query = cls.objects.filter(conditions).order_by("-pk").values(*cls.get_fields())
        return query

    @classmethod
    def get_woman(cls, **filters):
        try:
            return cls.objects.get(**filters)
        except cls.DoesNotExist:
            return False


class NextOfKin(ModelMixin):
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, null=True, blank=True)
    mobile_number = models.CharField(max_length=255, null=True, blank=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


# class KidashiTransaction(ModelMixin):
#     """
#     Mirrors transactions from PayRep into Kidashi DB
#     """

#     payrep_transaction_id = models.UUIDField(unique=True, db_index=True)
#     loan_link = models.ForeignKey("loan.LoanLink", on_delete=models.CASCADE, related_name="transactions")
#     woman = models.ForeignKey("woman.Woman", on_delete=models.CASCADE, related_name="transactions")
#     transaction_type = models.CharField(max_length=20, choices=[("DISBURSEMENT", "Disbursement"), ("REPAYMENT", "Repayment")])
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     transaction_date = models.DateTimeField()
#     metadata = models.JSONField(null=True, blank=True)
#     status = models.CharField(max_length=20, choices=[("SUCCESS", "Success"), ("FAILED", "Failed"), ("PENDING", "Pending")], default="PENDING")
