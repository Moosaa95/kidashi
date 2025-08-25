import re

from django.core import validators

from rest_framework import serializers

from common.functions import parse_and_format_date, clean_amount

MOBILE_NUMBER_VALIDATOR = validators.RegexValidator(
    regex=r"^([0]{1})([7-9]{1})([0|1]{1})([0-9]{8})",
    message="Please enter a valid phone number",
)


def validate_mobile_number(mobile_number):
    x = re.compile("^(0)([7-9])([0|1])([0-9]{8})", re.IGNORECASE)
    if not x.match(mobile_number):
        raise serializers.ValidationError("Not a valid mobile number")


def validate_password(password):
    pattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    x = re.compile(pattern)
    if not x.match(password):
        raise serializers.ValidationError("Not a valid password")


def validate_date(value):
    try:
        return parse_and_format_date(value)
    except ValueError:
        raise serializers.ValidationError("Date must be in DD/MM/YYYY format.")


def validate_amount(value):
    try:
        return clean_amount(value)
    except ValueError:
        raise serializers.ValidationError("Invalid amount")
