from rest_framework import status
from django.http import JsonResponse


class IsPayrepAuthenticatedMixin:
    def dispatch(self, request, *args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse(status=status.HTTP_400_BAD_REQUEST, data=dict(status=False, message="PayRep authorization token required"))

        token = auth_header.replace("Bearer ", "").strip()
        if not token:
            return JsonResponse(status=status.HTTP_400_BAD_REQUEST, data=dict(status=False, message="Invalid PayRep token"))

        request.payrep_token = token
        return super().dispatch(request, *args, **kwargs)
