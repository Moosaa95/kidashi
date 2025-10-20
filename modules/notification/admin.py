from django.contrib import admin

from modules.notification.models import EmailTracker, InAppNotification, Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "notification_type", "channel", "status", "sent_at", "created_at")
    list_filter = ("channel", "notification_type", "status", "created_at")
    search_fields = ("recipient", "subject", "template_name", "message")
    readonly_fields = ("created_at", "updated_at", "sent_at", "error")
    date_hierarchy = "created_at"


@admin.register(EmailTracker)
class EmailTrackerAdmin(admin.ModelAdmin):
    list_display = ("address", "status", "subject", "notification", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("address", "subject", "message")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("notification",)


@admin.register(InAppNotification)
class InAppNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "cba_customer_id", "is_read", "created_at")
    list_filter = ("event_type", "is_read", "created_at")
    search_fields = ("title", "message", "=cba_customer_id")
    readonly_fields = ("created_at", "updated_at")
