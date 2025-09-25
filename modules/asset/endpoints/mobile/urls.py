from django.urls import path

from modules.asset.endpoints.mobile.endpoints import CreateAsset, FetchAssets, GetAsset


urlpatterns = (
    path("create_asset", CreateAsset.as_view()),
    path("fetch_assets", FetchAssets.as_view()),
    path("get_asset", GetAsset.as_view()),
)
