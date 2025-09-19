from rest_framework.response import Response
from rest_framework import status


class IsPayrepAuthenticatedMixin:
    def dispatch(self, request, *args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response(
                {"status": False, "message": "PayRep authorization token required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        token = auth_header.replace("Bearer ", "").strip()
        if not token:
            return Response(
                {"status": False, "message": "Invalid PayRep token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        request.payrep_token = token
        return super().dispatch(request, *args, **kwargs)
