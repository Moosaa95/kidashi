from django.urls import path

from modules.notification.endpoints.mobile import endpoints as views

urlpatterns = [
    path("in_app/fetch/", views.FetchInAppNotifications.as_view(), name="mobile-in-app-notification-fetch"),
    path("in_app/detail/", views.GetInAppNotification.as_view(), name="mobile-in-app-notification-detail"),
    path("in_app/update/", views.UpdateInAppNotification.as_view(), name="mobile-in-app-notification-update"),
]
