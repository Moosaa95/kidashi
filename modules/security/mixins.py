from rest_framework import exceptions


class IsPayrepAuthenticatedMixin:
    def dispatch(self, request, *args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise exceptions.AuthenticationFailed("PayRep authorization token required")

        token = auth_header.replace("Bearer ", "").strip()
        if not token:
            raise exceptions.AuthenticationFailed("Invalid PayRep token")

        request.payrep_token = token
        return super().dispatch(request, *args, **kwargs)
