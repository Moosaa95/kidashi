from celery import shared_task

from modules.notification.tasks import send_sms
from modules.vendor.models import Vendor


@shared_task
def notify_vendor_status_change(vendor_id=None, new_status=None):
    vendor = Vendor.get_vendor(id=vendor_id)
    if not vendor:
        return None

    messages = {
        "ACTIVE": f"Congratulations {vendor.first_name}, your Kidashi vendor application has been approved! You now have full access to the vendor dashboard.",
        "REJECTED": f"Hello {vendor.first_name}, we regret to inform you your vendor application was not approved. Please contact support for assistance.",
        "SUSPENDED": f"Dear {vendor.first_name}, your vendor account has been temporarily suspended. Kindly reach out to your coordinator.",
        "INACTIVE": "Your vendor account is currently inactive. Contact support if this is unexpected.",
    }

    message = messages.get(new_status, f"Your vendor status has been updated to {new_status}.")
    send_sms.delay(message, vendor.phone)
    return f"Queued SMS for vendor {vendor.phone}"
