from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from modules.security.enums import OtpPurpose
from modules.security.models import OTP


class OtpMobileEndpointsTests(APITestCase):
    generate_url = "/api/v1/security/mobile/generate_otp"
    verify_url = "/api/v1/security/mobile/verify_otp"
    resend_url = "/api/v1/security/mobile/resend_otp"

    def setUp(self):
        super().setUp()
        cache.clear()

    def test_generate_otp_creates_record_and_returns_expiry(self):
        payload = {"purpose": OtpPurpose.OTHER}

        response = self.client.post(self.generate_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertIn("expires_at", response.data)
        self.assertEqual(OTP.objects.filter(purpose=OtpPurpose.OTHER).count(), 1)

    def test_verify_otp_success(self):
        otp_record = OTP.create_otp(purpose=OtpPurpose.OTHER, log_to_db=True)

        payload = {
            "purpose": OtpPurpose.OTHER,
            "otp": otp_record.otp,
        }

        response = self.client.post(self.verify_url, payload, format="json")
        print("RES", response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertEqual(response.data["message"], "OTP verified")
        otp_record.refresh_from_db()
        self.assertTrue(otp_record.used)

    def test_verify_otp_invalid_returns_error_payload(self):
        OTP.create_otp(purpose=OtpPurpose.OTHER, log_to_db=True)

        payload = {
            "purpose": OtpPurpose.OTHER,
            "otp": "0000",
        }

        response = self.client.post(self.verify_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["status"])
        self.assertEqual(response.data["message"], "Invalid OTP")

    def test_resend_otp_throttles_after_three_requests(self):
        payload = {"purpose": OtpPurpose.OTHER}
        print("PAYLOAD", payload)
        for attempt in range(3):
            response = self.client.post(self.resend_url, payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data["status"])

        response = self.client.post(self.resend_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertFalse(response.data["status"])
        self.assertEqual(response.data["message"], "Resend limit reached. Try again later.")
        self.assertEqual(
            OTP.objects.filter(purpose=OtpPurpose.OTHER).count(),
            3,
        )
