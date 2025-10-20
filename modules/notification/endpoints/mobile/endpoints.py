from django.db.models import Q
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema, inline_serializer

from modules.notification.models import InAppNotification
from modules.notification.serializers import (
    FetchInAppNotificationsRequestSerializer,
    GetInAppNotificationRequestSerializer,
    InAppNotificationListSerializer,
    InAppNotificationSerializer,
    UpdateInAppNotificationRequestSerializer,
)


class FetchInAppNotifications(APIView):
    @extend_schema(
        tags=["Notification"],
        description="Fetch in-app notifications with optional filters",
        request=FetchInAppNotificationsRequestSerializer,
        responses={
            200: inline_serializer(
                name="FetchInAppNotificationsResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=serializers.ListField(child=InAppNotificationListSerializer()),
                ),
            )
        },
    )
    def post(self, request):
        serializer = FetchInAppNotificationsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        raw_filters = validated.get("filters", {})
        # count = validated.get("count")

        conditions = Q()
        if not raw_filters:
            data = InAppNotification.fetch_inappnotifications(count=20)

        search = raw_filters.pop("search", None)
        if search:
            conditions &= Q(title__icontains=search) | Q(message__icontains=search)

        start_date = raw_filters.pop("start_date", None)
        end_date = raw_filters.pop("end_date", None)
        date = raw_filters.pop("date", None)
        if date:
            conditions &= Q(created_at__startswith=date)
        if start_date and end_date:
            conditions &= Q(created_at__date__range=[start_date, end_date])

        for key, value in raw_filters.items():
            conditions &= Q(**{key: value})

        if not conditions.children:
            conditions = None

        data = InAppNotification.fetch_inappnotifications(conditions=conditions)
        return Response(
            {
                "status": True,
                "message": "Notifications fetched successfully",
                "data": data,
            },
            status=status.HTTP_200_OK,
        )


class GetInAppNotification(APIView):
    @extend_schema(
        tags=["Notification"],
        description="Retrieve details of a single in-app notification",
        request=GetInAppNotificationRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetInAppNotificationResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=InAppNotificationSerializer(),
                ),
            ),
            404: inline_serializer(
                name="NotificationNotFoundResponse",
                fields=dict(status=serializers.BooleanField(), message=serializers.CharField()),
            ),
        },
    )
    def post(self, request):
        serializer = GetInAppNotificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        filters = {"id": validated.get("notification_id")}
        notification = InAppNotification.get_inapp_notification(**filters)
        if not notification:
            return Response(
                {"status": False, "message": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = InAppNotificationSerializer(notification).data
        return Response(
            {
                "status": True,
                "message": "Notification fetched successfully",
                "data": data,
            },
            status=status.HTTP_200_OK,
        )


class UpdateInAppNotification(APIView):
    @extend_schema(
        tags=["Notification"],
        description="Update an in-app notification (e.g. mark as read)",
        request=UpdateInAppNotificationRequestSerializer,
        responses={
            200: inline_serializer(
                name="UpdateInAppNotificationResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=InAppNotificationSerializer(),
                ),
            ),
            404: inline_serializer(
                name="UpdateNotificationNotFoundResponse",
                fields=dict(status=serializers.BooleanField(), message=serializers.CharField()),
            ),
        },
    )
    def post(self, request):
        serializer = UpdateInAppNotificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        notification_id = validated.pop("notification_id")

        notification = InAppNotification.update_notification(notification_id=notification_id, **validated)
        if not notification:
            return Response(
                {"status": False, "message": "Notification failed to update"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "status": True,
                "message": "Notification updated successfully",
            },
            status=status.HTTP_200_OK,
        )
