import os
from json import JSONDecodeError
import requests


USER_AGENT = """Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"""

CONTENT_TYPE = "application/json"

HEADER = {"content-type": CONTENT_TYPE, "User-Agent": USER_AGENT}


class PayrepCba:
    def __init__(self):
        self.mode = os.getenv("MODE", "DEV")
        self.base_url = os.getenv("PAYREP_CBA_BASE_URL")
        self.fi = "payrepcba"

    def get_fi(self):
        return self.fi

    def send_request(self, url, data=None, method="get", token=None, time_out=120):
        res_data = dict(req_status=False)

        if not token:
            res_data.update(status=401, message="Missing Authorization token")
            return res_data

        headers = {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        try:
            if method == "get":
                response = requests.get(
                    url,
                    params=data,
                    headers=headers,
                    timeout=time_out,
                )
            else:
                response = requests.post(
                    url,
                    json=data,
                    headers=headers,
                    timeout=time_out,
                )

            response.raise_for_status()
            response_dict = response.json()
            res_data.update(response_dict, req_status=True)
            return res_data

        except requests.exceptions.HTTPError as e:
            return dict(req_status=False, status=response.status_code, message=str(e))
        except requests.exceptions.RequestException as e:
            return dict(req_status=False, status=900, message=str(e))
        except JSONDecodeError:
            return dict(req_status=False, status=901, message="Invalid JSON from Payrep")

    def get_cba_customer_details(self, cba_customer_id, token):
        url = f"{self.base_url}/customers/{cba_customer_id}"
        return self.send_request(url, method="get", token=token)
