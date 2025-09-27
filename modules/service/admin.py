from django.contrib import admin

from modules.service.models import Service, ServiceCategory, ServiceIntegration, ServiceProvider


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "type", "updated_at")
    search_fields = ("name", "code")
    list_filter = ("type",)


@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active", "updated_at")
    search_fields = ("name", "code")
    list_filter = ("is_active",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "category", "is_active", "updated_at")
    search_fields = ("name", "code")
    list_filter = ("category", "is_active")
    filter_horizontal = ()
    readonly_fields = ("created_at", "updated_at")


@admin.register(ServiceIntegration)
class ServiceIntegrationAdmin(admin.ModelAdmin):
    list_display = ("service", "provider", "channel", "priority", "is_active")
    list_filter = ("channel", "is_active")
    search_fields = ("service__name", "service__code", "provider__name", "provider__code")
    readonly_fields = ("created_at", "updated_at")
