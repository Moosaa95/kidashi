from django.core.exceptions import ValidationError
from django.db import models

from common.mixins import ModelMixin
from modules.woman.enums import RepaymentStatus, WomanStatus
from django.core.validators import MinValueValidator, RegexValidator


class Woman(ModelMixin):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True, validators=[RegexValidator(regex=r"^\+?1?\d{9,15}$", message="Phone number must be valid")])
    email = models.EmailField(blank=True, null=True)

    nin = models.CharField(
        max_length=11,  # NIN is 11 digits
        blank=True,
        null=True,
        help_text="National Identification Number",
        unique=True,
        validators=[RegexValidator(regex=r"^\d{11}$", message="NIN must be exactly 11 digits")],
    )
    bvn = models.CharField(
        max_length=11,  # BVN is 11 digits
        blank=True,
        null=True,
        help_text="Bank Verification Number",
        unique=True,
        validators=[RegexValidator(regex=r"^\d{11}$", message="BVN must be exactly 11 digits")],
    )

    cba_customer_id = models.CharField(max_length=50, blank=True, null=True, help_text="Customer ID from the bank system", unique=True)

    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])

    repayment_status = models.CharField(max_length=20, choices=RepaymentStatus.choices, default=RepaymentStatus.NOT_APPLICABLE)

    status = models.CharField(max_length=20, choices=WomanStatus.choices, default=WomanStatus.ACTIVE)

    # Foreign key relationships
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="women", help_text="Vendor who onboarded this woman")

    trust_circle = models.ForeignKey("trust_circle.TrustCircle", on_delete=models.CASCADE, related_name="women", help_text="Trust circle this woman belongs to")

    address = models.TextField(blank=True, null=True)

    date_of_birth = models.DateField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    occupation = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = "women"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "status"]),
            models.Index(fields=["trust_circle", "status"]),
            models.Index(fields=["repayment_status"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["nin"]),
            models.Index(fields=["bvn"]),
            models.Index(fields=["cba_customer_id"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.trust_circle.circle_name}"

    @property
    def has_active_loan(self):
        return self.loan_amount > 0 and self.repayment_status in [RepaymentStatus.ONGOING, RepaymentStatus.ON_TIME, RepaymentStatus.LATE]

    @property
    def circle_seniority_rank(self):
        """Returns the rank of this woman based on join date within the circle"""
        return Woman.objects.filter(trust_circle=self.trust_circle, created_at__lt=self.created_at).count() + 1

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        from datetime import date

        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    def clean(self):
        super().clean()

        # Check woman belongs only to trust circle created by the same vendor
        if self.vendor_id and self.trust_circle_id:
            if self.vendor != self.trust_circle.vendor:
                raise ValidationError("Woman must be assigned to a trust circle created by the same vendor")

        # Check if trust circle is full
        if not self.pk and self.trust_circle_id:  # Only check for new instances
            if self.trust_circle.is_full:
                raise ValidationError(f"Trust circle '{self.trust_circle.circle_name}' is full")

        if self.repayment_status != RepaymentStatus.NOT_APPLICABLE and self.loan_amount == 0:
            raise ValidationError("Loan amount must be greater than 0 when repayment status is not 'Not Applicable'")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
