from typing import Iterable, List, Optional

from modules.notification.enums import NotificationChannel, NotificationType
from modules.notification.models import Notification


def queue_notification(
    *,
    recipient=None,
    subject=None,
    message=None,
    template_name="",
    context=None,
    channel=NotificationChannel.EMAIL,
    notification_type=NotificationType.GENERAL,
    metadata=None,
):
    if channel == NotificationChannel.EMAIL and not subject:
        raise ValueError("Email notifications require a subject.")

    if not message and not template_name:
        raise ValueError("Provide either a message body or a template.")

    notification = Notification.objects.create(
        recipient=recipient,
        subject=subject or "",
        message=message or "",
        template_name=template_name,
        context=context or {},
        channel=channel,
        notification_type=notification_type,
        metadata=metadata or {},
    )

    from modules.notification.tasks import dispatch_notification

    dispatch_notification.delay(str(notification.id))
    return notification


def notify_woman_onboarding(woman, channel_preferences: Optional[Iterable[NotificationChannel]] = None) -> List[Notification]:
    """Send welcome notifications when a woman account is onboarded."""
    channel_preferences = list(channel_preferences or [NotificationChannel.EMAIL])
    notifications: List[Notification] = []

    greeting_name = woman.first_name or woman.surname or "Customer"
    email_body = (
        f"Hi {greeting_name},\n\n"
        "Welcome to Kidashi! You now have access to financial services tailored to your needs. "
        "We will keep you informed about your account activity and opportunities as they become available.\n\n"
        "-- The Kidashi Team"
    )

    if NotificationChannel.EMAIL in channel_preferences and woman.email:
        notifications.append(
            queue_notification(
                recipient=woman.email,
                subject="Welcome to Kidashi",
                message=email_body,
                channel=NotificationChannel.EMAIL,
                notification_type=NotificationType.WOMAN_ONBOARDING,
                metadata={"woman_id": str(woman.id)},
            )
        )

    if NotificationChannel.SMS in channel_preferences and woman.mobile_number:
        sms_body = f"Hi {greeting_name}, welcome to Kidashi! We will share updates about your account here."
        notifications.append(
            queue_notification(
                recipient=woman.mobile_number,
                message=sms_body,
                channel=NotificationChannel.SMS,
                notification_type=NotificationType.WOMAN_ONBOARDING,
                metadata={"woman_id": str(woman.id)},
            )
        )

    return notifications
