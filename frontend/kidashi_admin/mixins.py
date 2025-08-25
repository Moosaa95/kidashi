# from django.http import HttpResponseRedirect
# from modules.auth.models import StaffUser
#
#
# class LoginRequiredMixin:
#     def dispatch(self, request, *args, **kwargs):
#         if "user_pk" in request.session:
#             credentials = StaffUser.get_user(id=request.session["user_pk"])
#             if credentials.session_id and credentials.session_id == request.session.session_key:
#                 pass
#             elif not credentials.session_id:
#                 StaffUser.update_user(
#                     id=request.session["user_pk"],
#                     session_id=request.session.session_key,
#                 )
#             else:
#                 return HttpResponseRedirect("staff_login")
#             return super().dispatch(request, *args, **kwargs)
#         else:
#             return HttpResponseRedirect("staff_login")
#
#
# class PermissionRequiredMixin:
#     def dispatch(self, request, *args, **kwargs):
#         if type(self.permission) is list:
#             for permission in self.permission:
#                 if permission in request.session.get("permissions", []):
#                     return super().dispatch(request, *args, **kwargs)
#         elif self.permission in request.session["permissions"] or "admin" in request.session["permissions"]:
#             return super().dispatch(request, *args, **kwargs)
#         else:
#             return HttpResponseRedirect("staff_dashboard")
