from django.core.cache import cache
from celery import shared_task
from modules.service.enums import ServiceCode
from modules.service.models import Service


@shared_task(bind=True, max_retries=3)
def fetch_and_cache_shinobi_loans(self, cba_customer_id, token=None):
    if not token:
        return
    try:
        service = Service.get_service(code=ServiceCode.CBA_CODE)
        integration = service.active_integrations(channel="API").first()
        provider = integration.get_client()
        response = provider.fetch_cba_customer_assets(cba_customer_id, token=token)
        cache_key = f"woman_loan_summary_{cba_customer_id}"
        cache.set(cache_key, response, timeout=300)
        print(f"Cached loan data for {cba_customer_id}", response)
    except Exception as exc:
        print(f"Failed to fetch Shinobi loans for {cba_customer_id}: {exc}")
        self.retry(exc=exc, countdown=30)
