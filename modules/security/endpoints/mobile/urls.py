from django.urls import path
from modules.security.endpoints.mobile.endpoints import GenerateOtp, ResendOtp, VerifyOtp

urlpatterns = [
    path("generate_otp", GenerateOtp.as_view(), name="generate_otp"),
    path("resend_otp", ResendOtp.as_view(), name="resend_otp"),
    path("verify_otp", VerifyOtp.as_view(), name="verify_otp"),
]
