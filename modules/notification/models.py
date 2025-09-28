from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.db.utils import IntegrityError

from common.mixins import ModelMixin
from modules.notification.enums import NotificationChannel, NotificationStatus, NotificationType


class Notification(ModelMixin):
    recipient = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)
    template_name = models.CharField(max_length=255, blank=True)
    context = models.JSONField(blank=True, null=True)
    channel = models.CharField(max_length=20, choices=NotificationChannel.choices, default=NotificationChannel.EMAIL)
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices, default=NotificationType.GENERAL)
    status = models.CharField(max_length=20, choices=NotificationStatus.choices, default=NotificationStatus.PENDING)
    error = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient}"

    def clean(self):
        super().clean()
        if not self.message and not self.template_name:
            raise ValidationError("Provide either a plain message or a template for the notification body.")

        if self.channel == NotificationChannel.EMAIL and not self.subject:
            raise ValidationError("Email notifications require a subject.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def mark_sent(self):
        self.status = NotificationStatus.SENT
        self.error = None
        self.sent_at = timezone.now()
        self.save(update_fields=["status", "error", "sent_at", "updated_at"])

    def mark_failed(self, error_message: str):
        self.status = NotificationStatus.FAILED
        self.error = error_message
        self.save(update_fields=["status", "error", "updated_at"])

    @classmethod
    def create_notification(cls, **kwargs):
        try:
            return cls.objects.create(**kwargs)
        except IntegrityError:
            return None

    @classmethod
    def get_notification(cls, **kwargs):
        try:
            return cls.objects.get(**kwargs)
        except cls.DoesNotExist:
            return None

    @classmethod
    def update_notification(cls, log_id, **kwargs):
        return cls.objects.filter(id=log_id).update(**kwargs)


class EmailTracker(ModelMixin):
    address = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.BooleanField(default=True)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="email_logs", null=True, blank=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.address

    @classmethod
    def create_record(cls, **kwargs):
        return cls.objects.create(**kwargs)
