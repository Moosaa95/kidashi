from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


DJANGO_ADMIN = [
    # DJANGO ADMIN URLS
    path("admin/", admin.site.urls)
]

FRONT_END = [
    # FRONT END URLS
    path("", include("frontend.kidashi_admin.urls")),
    path("kidashi/", include("frontend.kidashi_admin.urls")),
]

API_URLS = [
    # API URLS
]

api_docs_url = [
    # DOCUMENTATION URLS
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("api/docs/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/swagger",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

urlpatterns = DJANGO_ADMIN + FRONT_END + API_URLS

if settings.DEBUG:
    urlpatterns += api_docs_url
