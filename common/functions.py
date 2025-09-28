import os
import base64
import json
from decimal import Decimal
from json import JSONDecodeError
import datetime
import hmac
import math
import secrets
import time
import hashlib
import binascii
import random
import string
import uuid

from django.utils import timezone
from django.utils.crypto import get_random_string

from simplejson.errors import JSONDecodeError as EXTRAJsonError
import requests


REQ_HEADERS = {
    "Content-Type": "application/json",
}

TWO_PLACES = Decimal(10) ** -2


mode = os.getenv("MODE", "dev").lower()


def send_request(url, data, headers=REQ_HEADERS, time_out=120, flat_response=False):
    response = None
    print("========req data============")
    print(url)
    print(data)
    try:
        response = requests.post(
            url,
            data=json.dumps(data),
            headers=headers,
            verify=True,
            timeout=time_out,
        )
        # if os.getenv("MODE", "dev"):
        print("======REQUEST RESPONSE=======")
        print(response.content)

        if not response.ok:
            message = "server response issues!"
            return {
                "message": message,
                "req_status": False,
                "response_code": str(response.status_code),
            }
        response_data = dict(req_status=True)
        if flat_response:
            for key, value in response.json().items():
                if type(value) is dict:
                    response_data.update(value)
                else:
                    response_data[key] = value
        else:
            response_data.update(response.json())
        return response_data

    except requests.exceptions.RequestException as e:  # raise connection errors
        print("============ERROR==================")
        print(e)
        message = "connection error, failed to connect to aggregator!"
        return {"status": False, "message": message, "req_status": False}

    except (JSONDecodeError, EXTRAJsonError):
        print("============JSON ERROR==================")
        print(response.content)
        message = "failed to parse json data!"
        return {"status": False, "message": message, "req_status": True}


def call_internal_api(url, data, dj_request, headers=REQ_HEADERS, time_out=120, flat_response=False):
    response = None
    session_cookie = {"sessionid": dj_request.session.session_key}

    session = requests.Session()
    session.cookies.update(session_cookie)
    try:
        response = session.post(
            url,
            data=json.dumps(data),
            headers=headers,
            verify=True,
            timeout=time_out,
        )
        if os.getenv("MODE", "dev"):
            print("======INTERNAL REQUEST=======")
            print(response.content)

        if not response.ok:
            message = "server response issues!"
            return {
                "message": message,
                "req_status": False,
                "response_code": str(response.status_code),
            }
        response_data = dict(req_status=True)
        if flat_response:
            for key, value in response.json().items():
                if type(value) is dict:
                    response_data.update(value)
                else:
                    response_data[key] = value
        else:
            response_data.update(response.json())
        return response_data

    except requests.exceptions.RequestException as e:  # raise connection errors
        raise e

    except (JSONDecodeError, EXTRAJsonError):
        raise requests.exceptions.RequestException


def hash_password(ppt):
    bppt = ppt.encode()
    pct = hashlib.pbkdf2_hmac("sha256", bppt, b"rep#5@l1m!pay", 10000)
    dehex = binascii.hexlify(pct)
    hash_pass = dehex.decode()
    return hash_pass


def generate_password(length=12):
    """
    Generate a secure password for staff user creation.

    :param length: Length of the generated password (default is 12).
    :return: A randomly generated secure password.
    """
    if length < 8:
        raise ValueError("Password length must be at least 8 characters for security.")

    # Define character pools
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*()-_=+"

    # Ensure password contains at least one character from each pool
    password = [
        random.choice(lower),
        random.choice(upper),
        random.choice(digits),
        random.choice(special),
    ]

    # Fill the remaining length with a mix of all character pools
    all_characters = lower + upper + digits + special
    password += random.choices(all_characters, k=length - 4)

    # Shuffle the password to ensure randomness
    random.shuffle(password)

    return "".join(password)


def money_format(value):
    if not value:
        value = 0
    fvalue = float(value)
    readable = "{0:,.2f}".format(fvalue)
    return readable


def clean_amount(value):
    if isinstance(value, str):
        value = abs(Decimal(value.replace(",", "")))
    else:
        value = abs(value)
    return value


def clean_string(value):
    return value.replace("&", " ")


def json_helper(item):
    if isinstance(item, datetime.datetime):
        return item.strftime("%d/%m/%Y, %H:%M:%S")

    if isinstance(item, Decimal):
        return str(item)

    if isinstance(item, type(None)):
        return "None"


def unicode_striper(word):
    string_encode = word.encode("ascii", "ignore")
    string_decode = string_encode.decode()
    return string_decode


def space_remover(word):
    new_word = unicode_striper(word.strip())
    return new_word


def gen_random_key(length=32, encode="b32"):
    key = get_random_string(length=length, allowed_chars="1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if encode == "b32":
        key = base64.b32encode(key.encode()).decode("utf-8")
    return key


def gen_totp(key, step=600, length=6):
    counter = math.floor(time.time() // step)

    hmac_object = hmac.new(key.encode(), counter.to_bytes(length=8, byteorder="big"), hashlib.sha1)
    hmac_sha1 = hmac_object.hexdigest()

    # truncate to 6 digits
    offset = int(hmac_sha1[-1], 16)
    binary = int(hmac_sha1[(offset * 2) : ((offset * 2) + 8)], 16) & 0x7FFFFFFF
    totp = str(binary)[-length:]
    return totp


def generate_reference_number():
    """Generate a unique reference number"""
    timestamp = timezone.now().strftime("%Y%m%d%H%M%S%f")  # Format: YYYYMMDDHHMMSSss
    # rand = uuid.uuid4().hex[:6].upper()  # Get first 6 characters of UUID
    # rand = get_random_string(length=3, allowed_chars="1234567890")
    return timestamp


def import_json(file_path):
    current_dir = os.path.dirname(__file__)
    # Construct the absolute file path to the JSON file
    json_file_path = os.path.join(current_dir, file_path)
    with open(json_file_path, "r") as file:
        data = json.load(file)
    return data


def compare_strings(s1, s2, threshold=0.8):

    normalized_input = " ".join(s1.lower().split())
    normalized_response = " ".join(s2.lower().split())

    input_words = set(normalized_input.split())
    response_words = set(normalized_response.split())

    common_words = input_words & response_words
    total_words = input_words | response_words

    similarity_ratio = len(common_words) / len(total_words)

    return similarity_ratio >= threshold


def parse_and_format_date(value, date_format="%d/%m/%Y"):
    try:
        parsed_date = datetime.datetime.strptime(value, date_format).date()
    except ValueError:
        parsed_date = datetime.datetime.strptime(value, "%m/%d/%Y").date()
    return parsed_date


def convert_decimal(obj):
    """Convert Decimal values to float for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)  # or str(obj) if needed
    raise TypeError("Object of type %s is not JSON serializable" % type(obj))


def generate_serial(prefix="SN", date_format="%Y%m", suffix_length=6):
    """
    Generate a serial number with a date component and random suffix.

    Parameters:
    - prefix (str): Prefix for the serial number
    - date_format (str): strftime format for the date component
    - suffix_length (int): Length of the random suffix

    Returns:
    - str: Generated serial number
    """
    date_part = timezone.now().strftime(date_format)
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=suffix_length))
    return f"{prefix}{date_part}{suffix}"


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            # return the uuid as a string
            return str(obj)
        return super().default(obj)


def json_list_default():
    return []


def generate_otp(length=6):
    """Generate a random OTP"""
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(length))
