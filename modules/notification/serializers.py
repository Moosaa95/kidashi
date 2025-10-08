from rest_framework import serializers

from modules.notification.enums import InAppEventType


class InAppNotificationSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    cba_customer_id = serializers.UUIDField(read_only=True)
    event_type = serializers.CharField(max_length=50, read_only=True)
    title = serializers.CharField(max_length=255, read_only=True)
    message = serializers.CharField(read_only=True)
    metadata = serializers.JSONField(read_only=True)
    is_read = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class InAppNotificationListSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    cba_customer_id = serializers.UUIDField()
    event_type = serializers.ChoiceField(choices=InAppEventType.choices)
    title = serializers.CharField()
    message = serializers.CharField()
    metadata = serializers.JSONField(allow_null=True)
    is_read = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField(allow_null=True)


class InAppNotificationFiltersSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=False, help_text="Filter notifications for a specific vendor")
    event_type = serializers.ChoiceField(choices=InAppEventType.choices, required=False, help_text="Filter by notification event type")
    is_read = serializers.BooleanField(required=False, help_text="Filter notifications by their read status")
    search = serializers.CharField(required=False, allow_blank=True, help_text="Search within notification title or message")
    start_date = serializers.DateField(required=False, help_text="Return notifications created on or after this date")
    end_date = serializers.DateField(required=False, help_text="Return notifications created on or before this date")

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("end_date cannot be earlier than start_date")
        return attrs


class FetchInAppNotificationsRequestSerializer(serializers.Serializer):
    filters = InAppNotificationFiltersSerializer(required=False)
    count = serializers.IntegerField(required=False, min_value=1, help_text="Limit the number of notifications returned")


class GetInAppNotificationRequestSerializer(serializers.Serializer):
    notification_id = serializers.UUIDField(help_text="ID of the notification to retrieve", required=False)
    # cba_customer_id = serializers.UUIDField(required=False, help_text="Restrict lookup to notifications owned by this vendor")


class UpdateInAppNotificationRequestSerializer(serializers.Serializer):
    notification_id = serializers.UUIDField(help_text="ID of the notification to update")
    cba_customer_id = serializers.UUIDField(required=False, help_text="Restrict update to notifications owned by this vendor")
    title = serializers.CharField(required=False, allow_blank=True, help_text="Updated notification title")
    message = serializers.CharField(required=False, allow_blank=True, help_text="Updated notification message body")
    is_read = serializers.BooleanField(required=False, help_text="Set the notification read status")

    def validate(self, attrs):
        update_fields = [key for key in ("title", "message", "is_read") if key in attrs]
        if not update_fields:
            raise serializers.ValidationError("Provide at least one field to update")
