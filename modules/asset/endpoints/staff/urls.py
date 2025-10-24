from django.urls import path
from modules.asset.endpoints.staff.endpoints import FetchAssetsWithFilter, GetAssetDetail


urlpatterns = [
    path("fetch_assets", FetchAssetsWithFilter.as_view(), name="staff-fetch-assets"),
    path("get_asset", GetAssetDetail.as_view(), name="staff-get-asset-detail"),
]
