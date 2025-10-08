from django.contrib import admin
from modules.asset.models import Asset, AssetActivity


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "value", "status", "vendor", "woman", "created_at")
    list_filter = ("status", "vendor", "woman", "created_at")  # ✅ filter sidebar
    search_fields = ("name", "vendor__first_name", "vendor__surname", "woman__first_name", "woman__surname")
    ordering = ("-created_at",)


@admin.register(AssetActivity)
class AssetActivityAdmin(admin.ModelAdmin):
    list_display = ("id", "asset", "activity_type", "description", "performed_by", "created_at")
    list_filter = ("activity_type", "created_at")
    search_fields = ("asset__name", "description", "performed_by__username")
    ordering = ("-created_at",)
