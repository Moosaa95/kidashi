import os
from typing import Optional

import requests
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from modules.notification.enums import NotificationChannel, NotificationStatus
from modules.notification.models import EmailTracker, Notification


def _refresh_status(notification):
    if notification.status != NotificationStatus.PENDING:
        notification.status = NotificationStatus.PENDING
        notification.error = None
        notification.save(update_fields=["status", "error", "updated_at"])


def _send_email(notification):
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "Kidashi <no-reply@kidashi.local>")
    context = notification.context or {}
    body = notification.message

    if notification.template_name:
        body = render_to_string(notification.template_name, context)

    email = EmailMultiAlternatives(
        subject=notification.subject or "",
        body=body,
        from_email=from_email,
        to=[notification.recipient],
    )

    if notification.template_name:
        email.attach_alternative(body, "text/html")

    email.send(fail_silently=False)

    EmailTracker.create_record(
        address=notification.recipient,
        subject=notification.subject or "",
        message=body,
        status=True,
        notification=notification,
    )

    notification.mark_sent()


def _send_sms(notification):
    gateway_url = getattr(settings, "SMS_GATEWAY_URL", os.getenv("SMS_GATEWAY_URL"))
    if not gateway_url:
        raise RuntimeError("SMS gateway is not configured. Set SMS_GATEWAY_URL in environment or settings.")

    payload = {
        "to": notification.recipient,
        "message": notification.message,
    }

    api_key = getattr(settings, "SMS_GATEWAY_API_KEY", os.getenv("SMS_GATEWAY_API_KEY"))
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    response = requests.post(gateway_url, json=payload, headers=headers, timeout=15)
    response.raise_for_status()

    notification.mark_sent()


@shared_task(bind=True, max_retries=3, retry_backoff=True, retry_jitter=True)
def dispatch_notification(self, notification_id: str) -> Optional[str]:
    try:
        notification = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        return None

    if notification.status == NotificationStatus.SENT:
        return str(notification.id)

    _refresh_status(notification)

    try:
        if notification.channel == NotificationChannel.EMAIL:
            _send_email(notification)
        elif notification.channel == NotificationChannel.SMS:
            _send_sms(notification)
        else:
            raise ValueError(f"Unsupported notification channel: {notification.channel}")
    except Exception as exc:
        notification.mark_failed(str(exc))
        raise self.retry(exc=exc)

    return str(notification.id)


# @shared_task
# def send_sms(message, recipient):
#     print("=======send sms============")
#     print(message)
#     print(recipient)
#     provider = None
#     service = Service.get_service(code="sms01")

#     provider = get_class_instance(service.provider.name)

#     if not provider:
#         NotificationLog.create_log(recipient=recipient, notification_type=NotificationTypeChoices.SMS, message=message, status=NotificationStatusChoices.FAILED)
#         return False
#     response = provider.send_sms(message, recipient)
#     print(response)
#     print("=======sms sent===========")
#     status = NotificationStatusChoices.SUCCESS if response else NotificationStatusChoices.FAILED
#     NotificationLog.create_log(recipient=recipient, notification_type=NotificationTypeChoices.SMS, message=message, status=status)
#     return status
