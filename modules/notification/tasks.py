import os

# from typing import Optional

import requests
from django.template.loader import render_to_string
from celery import shared_task

from modules.notification.enums import NotificationChannel, NotificationStatus
from modules.notification.models import Notification
from modules.service.models import Service

# from django.conf import settings
# from django.core.mail import EmailMultiAlternatives
# from django.template.loader import render_to_string

# from modules.notification.enums import NotificationChannel, NotificationStatus
# from modules.notification.models import EmailTracker, Notification


# def _refresh_status(notification):
#     if notification.status != NotificationStatus.PENDING:
#         notification.status = NotificationStatus.PENDING
#         notification.error = None
#         notification.save(update_fields=["status", "error", "updated_at"])


# def _send_email(notification):
#     from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "Kidashi <no-reply@kidashi.local>")
#     context = notification.context or {}
#     body = notification.message

#     if notification.template_name:
#         body = render_to_string(notification.template_name, context)

#     email = EmailMultiAlternatives(
#         subject=notification.subject or "",
#         body=body,
#         from_email=from_email,
#         to=[notification.recipient],
#     )

#     if notification.template_name:
#         email.attach_alternative(body, "text/html")

#     email.send(fail_silently=False)

#     EmailTracker.create_record(
#         address=notification.recipient,
#         subject=notification.subject or "",
#         message=body,
#         status=True,
#         notification=notification,
#     )

#     notification.mark_sent()


# def _send_sms(notification):
#     gateway_url = getattr(settings, "SMS_GATEWAY_URL", os.getenv("SMS_GATEWAY_URL"))
#     if not gateway_url:
#         raise RuntimeError("SMS gateway is not configured. Set SMS_GATEWAY_URL in environment or settings.")

#     payload = {
#         "to": notification.recipient,
#         "message": notification.message,
#     }

#     api_key = getattr(settings, "SMS_GATEWAY_API_KEY", os.getenv("SMS_GATEWAY_API_KEY"))
#     headers = {"Content-Type": "application/json"}
#     if api_key:
#         headers["Authorization"] = f"Bearer {api_key}"

#     response = requests.post(gateway_url, json=payload, headers=headers, timeout=15)
#     response.raise_for_status()

#     notification.mark_sent()


# @shared_task(bind=True, max_retries=3, retry_backoff=True, retry_jitter=True)
# def dispatch_notification(self, notification_id: str) -> Optional[str]:
#     try:
#         notification = Notification.objects.get(id=notification_id)
#     except Notification.DoesNotExist:
#         return None

#     if notification.status == NotificationStatus.SENT:
#         return str(notification.id)

#     _refresh_status(notification)

#     try:
#         if notification.channel == NotificationChannel.EMAIL:
#             _send_email(notification)
#         elif notification.channel == NotificationChannel.SMS:
#             _send_sms(notification)
#         else:
#             raise ValueError(f"Unsupported notification channel: {notification.channel}")
#     except Exception as exc:
#         notification.mark_failed(str(exc))
#         raise self.retry(exc=exc)


#     return str(notification.id)
@shared_task
def send_email(**kwargs):
    print("======sending email========")
    text_message = kwargs.get("message", None)
    template_name = kwargs.get("template_name", None)
    template_context = kwargs.get("template_context", None)
    subject = kwargs.get("subject", None)
    recipient = kwargs.get("recipient")
    html_message = kwargs.get("html_message", None)
    attachment_path = kwargs.get("attachment_path", None)

    if template_name and template_context:
        html_message = render_to_string(template_name, template_context)

    mail_data = {
        "from": "PayRep(KIDASHI) Team<admin@mypayrep.com>",
        "to": ", ".join(recipient) if isinstance(recipient, list) else recipient,
        "subject": subject,
    }

    if text_message:
        mail_data.update(text=text_message)

    if html_message:
        mail_data.update(html=html_message)

    files = None
    if attachment_path and os.path.exists(attachment_path):
        filename = os.path.basename(attachment_path)
        files = [("attachment", (filename, open(attachment_path, "rb"), "application/octet-stream"))]

    response = requests.post("https://api.mailgun.net/v3/mypayrep.com/messages", auth=("api", os.getenv("MAILGUN_API_KEY")), data=mail_data, files=files)
    print("========email sent===========")
    print(response.content)
    status = NotificationStatus.SUCCESS if response.status_code == 200 else NotificationStatus.FAILED
    Notification.create_notification(recipient=kwargs.get("recipient"), notification_type=NotificationChannel.EMAIL, message=kwargs.get("message", ""), status=status)


@shared_task
def send_sms(message, recipient):
    print("=======send sms============")
    print(message)
    print(recipient)
    provider = None
    service = Service.get_service(code="sms01")
    integration = service.active_integrations(channel="API").first()

    provider = integration.get_client()

    if not provider:
        Notification.create_notification(recipient=recipient, channel=NotificationChannel.SMS, message=message, status=NotificationStatus.FAILED)
        return False
    response = provider.send_sms(message, recipient)
    print(response)
    print("=======sms sent===========")
    status = NotificationStatus.SENT if response else NotificationStatus.FAILED
    Notification.create_notification(recipient=recipient, channel=NotificationChannel.SMS, message=message, status=status)
    return status
