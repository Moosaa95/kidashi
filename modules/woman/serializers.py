from rest_framework import serializers
from common.validators import validate_mobile_number


class WomanMobileVerifySerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    type = serializers.CharField(max_length=20, required=False, default="INDIVIDUAL")


class WomanMobileRegisterSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    otp = serializers.CharField(max_length=10)
    type = serializers.CharField(max_length=20, required=False, default="INDIVIDUAL")


class WomanEmailVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=50)


class WomanOnboardingRequestSerializer(serializers.Serializer):
    vendor_cba_customer_id = serializers.UUIDField(required=True, help_text="Vendor's CBA customer ID")
    trust_circle_id = serializers.UUIDField(required=False, help_text="Trust circle to assign the woman to")
    woman_cba_customer_id = serializers.UUIDField(required=True, help_text="Woman's CBA customer ID (from Payrep)")


class WomanEmailRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=50)
    mobile_number = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    otp = serializers.CharField(max_length=10)


class WomanNationalitySerializer(serializers.Serializer):
    nationality = serializers.CharField(max_length=64)


class WomanNinLookupSerializer(serializers.Serializer):
    cba_customer_id = serializers.CharField()
    nin = serializers.CharField(max_length=11)


class WomanBvnLookupSerializer(serializers.Serializer):
    cba_customer_id = serializers.CharField()
    bvn = serializers.CharField(max_length=11)


class WomanLocationSetupSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()
    residential_address = serializers.CharField(max_length=255)
    state = serializers.CharField(max_length=100)
    lga = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    community = serializers.CharField(max_length=255)


class WomanNextOfKinSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=False)
    first_name = serializers.CharField(max_length=255)
    surname = serializers.CharField(max_length=255)
    mobile_number = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    relationship = serializers.CharField(max_length=100)
    nin = serializers.CharField(max_length=11)
    address = serializers.CharField(max_length=255)
    state = serializers.CharField(max_length=100)
    lga = serializers.CharField(max_length=100)


class WomanIdentificationCheckSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()
    document_type = serializers.CharField(max_length=64)
    document_class = serializers.CharField(max_length=64)
    file = serializers.CharField(help_text="Base64-encoded document image or file token")


class WomanVerificationCheckSerializer(serializers.Serializer):
    verification = serializers.IntegerField(required=True)


class WomanPepSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()
    is_pep = serializers.BooleanField()


class WomanSourceOfIncomeSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()
    employment_type = serializers.CharField(max_length=64)
    occupation = serializers.CharField(max_length=100)
    annual_income = serializers.CharField(max_length=64)


class WomanManualCustomerDetailsSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    surname = serializers.CharField(max_length=255)
    mobile_number = serializers.CharField(max_length=20, validators=[validate_mobile_number])
    email = serializers.EmailField(max_length=50)
    residential_address = serializers.CharField(max_length=255)
    state = serializers.CharField(max_length=100)
    lga = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    nin = serializers.CharField(max_length=11)
    bvn = serializers.CharField(max_length=11)
    dob = serializers.CharField(max_length=20)
    nationality = serializers.CharField(max_length=100)
    community = serializers.CharField(max_length=255)


class WomanFacialCaptureSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()
    file = serializers.CharField(help_text="Base64-encoded selfie image or file token")


class WomanAttestationSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField()


class WomanSerializer(serializers.Serializer):
    woman_id = serializers.UUIDField(required=False, help_text="ID of the woman")
    first_name = serializers.CharField(max_length=255, required=False, help_text="Filter by first name")
    other_name = serializers.CharField(max_length=255, required=False, help_text="Filter by other name")
    surname = serializers.CharField(max_length=255, required=False, help_text="Filter by surname")
    mobile_number = serializers.CharField(max_length=20, required=False, help_text="Filter by mobile number", validators=[validate_mobile_number])
    account_number = serializers.CharField(max_length=20, required=False, help_text="Filter by account number")
    email = serializers.EmailField(max_length=50, required=False, help_text="Filter by email address")
    status = serializers.CharField(max_length=20, required=False, help_text="Filter by status")
    date = serializers.CharField(required=False, help_text="Filter by a specific registration date (YYYY-MM-DD)")
    start_date = serializers.CharField(required=False, help_text="Filter by a start date range (YYYY-MM-DD)")
    end_date = serializers.CharField(required=False, help_text="Filter by an end date range (YYYY-MM-DD)")
    trust_circle_id = serializers.UUIDField(required=False, help_text="Filter by trust circle ID")
    vendor_id = serializers.UUIDField(required=False, help_text="Filter by vendor ID")
    state_id = serializers.UUIDField(required=False, help_text="Filter by state ID")
    lga_id = serializers.UUIDField(required=False, help_text="Filter by local government area ID")
    country_id = serializers.UUIDField(required=False, help_text="Filter by country ID")
    repayment_status = serializers.CharField(max_length=20, required=False, help_text="Filter by repayment status")
    status = serializers.CharField(max_length=20, required=False, help_text="Filter by status")


class FetchWomenFilterSerializer(serializers.Serializer):
    filters = WomanSerializer(required=False)
    count = serializers.IntegerField(required=False, help_text="Number of records to fetch")


class GetWomanBasicDetailsRequestSerializer(serializers.Serializer):
    cba_customer_id = serializers.UUIDField(required=True, help_text="CBA customer ID of the woman")
