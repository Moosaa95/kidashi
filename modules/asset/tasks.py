from celery import shared_task
from modules.asset.enums import AssetActivityType, AssetStatus
from modules.asset.models import Asset, AssetActivity
from modules.service.enums import ServiceCode
from modules.service.models import Service


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def create_loan_in_payrep(self, asset_id=None, token=None, product_code=None, log_id=None):
    if not asset_id or not token or not product_code or not log_id:
        return

    asset = Asset.get_asset(id=asset_id, obj=True)
    if not asset:
        return

    activity_data = dict()
    service = Service.get_service(code=ServiceCode.CBA_CODE)
    integration = service.active_integrations(channel="API").first()
    provider = integration.get_client()

    # total_amount = (asset.value or Decimal(0)) + (asset.markup or Decimal(0))
    payload = {
        "woman_account_number": asset.woman.account_number,
        "vendor_account_number": asset.vendor.account_number,
        "product_code": str(product_code),
        "amount": float(asset.value),
    }

    try:
        response = provider.create_loan_asset(payload, token=token)

    except Exception as e:
        try:
            self.retry(exc=e)
        except self.MaxRetriesExceededError:
            Asset.update_assets(asset_id=asset.id, status=AssetStatus.FAILED)
            AssetActivity.update_activity(
                activity_id=log_id,
                activity_type=AssetActivityType.SYNC_FAILED,
                description="Max retries exceeded for PayRep loan creation",
                metadata={"error": str(e)},
            )
        return
    ok = bool(response.get("req_status") and response.get("status"))
    if ok and response.get("loan_id"):
        assign_result = Asset.assign_loan_id(asset_id=asset.id, loan_id=response["loan_id"])
        if assign_result.get("status"):
            activity_data.update(activity_type=AssetActivityType.SYNC_SUCCESS, description="Loan created successfully in PayRep Mfb", metadata={"loan_id": str(response["loan_id"]), "raw": response})
            AssetActivity.update_activity(activity_id=log_id, **activity_data)

        else:
            activity_data.update(activity_type=AssetActivityType.SYNC_WARNING, description="Loan created in PayRep but not linked in Kidashi", metadata={"error": assign_result.get("message")})
            AssetActivity.update_activity(activity_id=log_id, **activity_data)

    else:
        activity_data.update(activity_type=AssetActivityType.SYNC_FAILED, description="PayRep loan creation failed", metadata={"error": response.get("message", "Unknown error")})
        AssetActivity.update_activity(activity_id=log_id, **activity_data)
        Asset.update_assets(asset_id=asset.id, status=AssetStatus.FAILED)
