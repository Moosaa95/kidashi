from django.urls import path
from modules.woman.endpoints.staff.endpoints import (
    FetchWomanFilter,
    GetWomanDetail,
)

urlpatterns = [
    path("fetch_women", FetchWomanFilter.as_view(), name="fetch_women"),
    path("get_woman_detail", GetWomanDetail.as_view(), name="get_woman_detail"),
]
