from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

from common.functions import generate_otp

# from modules.notification.enums import NotificationChannel, NotificationType
# from modules.notification.functions import queue_notification
from modules.notification.tasks import send_sms
from modules.security.enums import OtpPurpose


class OTP(models.Model):
    purpose = models.CharField(max_length=50, choices=OtpPurpose.choices)
    otp = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    DEFAULT_VALIDITY = {
        OtpPurpose.ASSET_REQUEST: timedelta(days=1),
        OtpPurpose.GUARANTOR_APPROVAL: timedelta(days=1),
        OtpPurpose.OTHER: timedelta(minutes=30),
    }

    class Meta:
        db_table = "otp_codes"
        indexes = [
            models.Index(fields=["purpose", "expires_at"]),
        ]

    def __str__(self):
        return f"OTP({self.purpose}, {self.otp})"

    @classmethod
    def create_otp(cls, purpose=OtpPurpose.OTHER, length=4, validity=None, log_to_db=False, recipient=None):
        otp = generate_otp(length)
        validity_period = validity or cls.DEFAULT_VALIDITY.get(purpose, timedelta(minutes=30))
        expires_at = timezone.now() + validity_period

        cache_key = f"otp:{purpose}"
        cache.set(cache_key, otp, timeout=int(validity_period.total_seconds()))

        record = None
        if log_to_db:
            record = cls.objects.create(
                purpose=purpose,
                otp=otp,
                expires_at=expires_at,
            )
        print("===========CREATE OTP", recipient, otp, purpose)
        if recipient:
            print("REEE", recipient)
            message = f"Your Kidashi OTP for {purpose.replace('_', ' ').title()} is {otp}. It expires in {validity_period}."
            send_sms(message=message, recipient=recipient)
            # queue_notification(
            #     recipient=recipient,
            #     message=message,
            #     subject="Kidashi OTP Verification" if channel == NotificationChannel.EMAIL else None,
            #     channel=channel or NotificationChannel.SMS,
            #     notification_type=NotificationType.OTP,
            #     metadata={"purpose": purpose, "otp_id": str(record.id) if record else None},
            # )

        return record or otp

    @classmethod
    def validate(cls, purpose, input_otp, max_attempts=3, lock_minutes=30):
        cache_key = f"otp:{purpose}"
        attempt_key = f"otp_attempts:{purpose}"

        attempts = cache.get(attempt_key, 0)
        if attempts >= max_attempts:
            return {
                "status": False,
                "message": f"Too many invalid attempts. Try again in {lock_minutes} minutes.",
                "locked": True,
            }

        cached_otp = cache.get(cache_key)
        if cached_otp:
            if cached_otp == input_otp:
                cache.delete_many([cache_key, attempt_key])
                cls.objects.filter(purpose=purpose, used=False).update(used=True)
                return {"status": True, "message": "OTP verified"}

            cache.set(attempt_key, attempts + 1, timeout=lock_minutes * 60)
            return {"status": False, "message": "Invalid OTP"}

        record = cls.objects.filter(purpose=purpose, used=False, expires_at__gte=timezone.now()).last()

        if not record:
            return {"status": False, "message": "No active OTP found or expired."}

        if record.otp != input_otp:
            cache.set(attempt_key, attempts + 1, timeout=lock_minutes * 60)
            return {"status": False, "message": "Invalid OTP"}

        cache.delete(attempt_key)
        record.used = True
        record.save(update_fields=["used"])
        return {"status": True, "message": "OTP verified"}
