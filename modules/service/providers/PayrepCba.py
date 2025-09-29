import os
from modules.service.providers.BaseCbaClient import BaseCbaClient


class PayrepCba(BaseCbaClient):

    def __init__(self, base_url=None, mode=None):
        super().__init__(
            base_url=(base_url or os.getenv("CBA_BASE_URL", "https://dev.payrepmfb.com")).rstrip("/") + "/api/v1/",
            fi="payrepcba",
            mode=mode,
        )

        self.customer_endpoints = {
            "verify_mobile": {
                "endpoint": "customer/mobile/verify_mobile_number",
                "method": "post",
                "required_fields": ["mobile_number", "type"],
            },
            "register_mobile": {
                "endpoint": "customer/mobile/register_mobile_number",
                "method": "post",
                "required_fields": ["mobile_number", "otp", "type"],
            },
            "verify_email": {
                "endpoint": "customer/mobile/verify_email",
                "method": "post",
                "required_fields": ["email"],
            },
            "register_email": {
                "endpoint": "customer/mobile/register_email",
                "method": "post",
                "required_fields": ["email", "mobile_number", "otp"],
            },
            "nationality": {
                "endpoint": "customer/mobile/nationality",
                "method": "put",
                "required_fields": ["nationality"],
            },
            "nin_lookup": {
                "endpoint": "compliance/mobile/nin_lookup",
                "method": "post",
                "required_fields": ["cba_customer_id", "nin"],
            },
            "bvn_lookup": {
                "endpoint": "compliance/mobile/bvn_lookup",
                "method": "post",
                "required_fields": ["cba_customer_id", "bvn"],
            },
            "verification_check": {
                "endpoint": "compliance/mobile/verification_check",
                "method": "post",
                "required_fields": ["verification"],
            },
            "personal_and_location_setup": {
                "endpoint": "customer/mobile/location/{cba_customer_id}",
                "method": "put",
                "required_fields": ["residential_address", "state", "lga", "country", "community"],
            },
            "next_of_kin": {
                "endpoint": "customer/mobile/next_of_kin",
                "method": "post",
                "required_fields": ["first_name", "surname", "phone", "relationship", "nin", "address", "state", "lga"],
            },
            "identification_check": {
                "endpoint": "compliance/mobile/documents/{cba_customer_id}",
                "method": "post",
                "required_fields": ["document_type", "document_class", "file"],
            },
            "pep": {
                "endpoint": "customer/mobile/pep/{cba_customer_id}",
                "method": "put",
                "required_fields": ["is_pep"],
            },
            "source_of_income": {
                "endpoint": "customer/mobile/income/{cba_customer_id}",
                "method": "put",
                "required_fields": ["employment_type", "occupation", "annual_income"],
            },
            "manual_customer_details": {
                "endpoint": "customer/mobile/manual_customer_details",
                "method": "post",
                "required_fields": ["first_name", "surname", "phone", "email", "residential_address", "state", "lga", "country", "nin", "bvn", "dob", "nationality", "community"],
            },
            "facial_capture": {
                "endpoint": "compliance/mobile/facial_capture/{cba_customer_id}",
                "method": "post",
                "required_fields": ["file"],
            },
            "attestation": {
                "endpoint": "customer/mobile/attestation/{cba_customer_id}",
                "method": "post",
                "required_fields": [],
            },
        }

    def get_fi(self):
        return self.fi

    def get_cba_customer_details(self, cba_customer_id, token):

        url = f"{self.base_url}/customer/mobile/customer_basic/{cba_customer_id}"
        return self.send_request(url, method="get", token=token)

    def create_loan_asset(self, token, payload):
        url = f"{self.base_url}/loan/mobile/book_loan"
        response = self.send_request(url, data=payload, method="post", token=token)
        if not response.get("req_status"):
            return dict(
                req_status=False,
                status=response.get("status", 400),
                message=response.get("message", "Request to PayRep failed"),
            )

        loan_id = response.get("loan_id") or (response.get("data") or {}).get("loan_id") or ((response.get("data") or {}).get("loan") or {}).get("id")

        if not loan_id:
            return dict(
                req_status=True,
                status=False,
                message="Loan creation response did not include loan_id",
                raw=response,
            )

        return dict(
            req_status=True,
            status=True,
            message="Loan created successfully",
            loan_id=loan_id,
            raw=response,
        )

    def customer_action(self, action, payload, token=None, path_params=None):
        """
        Perform a customer action by looking up the endpoint config.
        """
        config = self.customer_endpoints.get(action)
        if not config:
            return dict(req_status=False, status=400, message=f"Unsupported action '{action}'")

        missing = [f for f in config["required_fields"] if f not in payload]
        if missing:
            return dict(
                req_status=False,
                status=422,
                message=f"Missing required fields: {', '.join(missing)}",
            )

        url = f"{self.base_url}/{config['endpoint']}"
        if path_params:
            url = url.format(**path_params)

        return self.send_request(url, data=payload, method=config["method"], token=token)
