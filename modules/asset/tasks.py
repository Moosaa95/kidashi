from celery import shared_task
from decimal import Decimal
from modules.asset.enums import AssetActivityType, AssetStatus
from modules.asset.models import Asset, AssetActivity
from modules.service.providers import PayrepCba


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def create_loan_in_payrep(self, asset_id=None, token=None, product_id=None, log_id=None):
    if not asset_id or not token or not product_id or not log_id:
        return

    asset = Asset.get_asset(id=asset_id, obj=True)
    if not asset:
        return

    activity_data = dict()

    payrep = PayrepCba()

    total_amount = (asset.value or Decimal(0)) + (asset.markup or Decimal(0))
    payload = {
        "account_number": asset.woman.account_number,
        "loan_product_id": str(product_id),
        "amount": float(total_amount),
    }

    try:
        response = payrep.create_loan_asset(token=token, **payload)

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
