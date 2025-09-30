# from rest_framework.response import Response
# from rest_framework import status, exceptions


class IsPayrepAuthenticatedMixin:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            self.permission_denied(request, message="PayRep authorization token required")

        token = auth_header.replace("Bearer ", "").strip()
        if not token:
            self.permission_denied(request, message="Invalid PayRep token")

        request.payrep_token = token
