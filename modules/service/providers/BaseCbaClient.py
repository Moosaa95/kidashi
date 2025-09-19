import os
import requests
from json import JSONDecodeError


USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"


class BaseCbaClient:
    """
    Base class for Core Banking Application (CBA) providers.
    Defines common HTTP request/response handling.
    """

    def __init__(self, base_url, fi, mode=None):
        self.base_url = base_url.rstrip("/")
        self.fi = fi
        self.mode = mode or os.getenv("MODE", "DEV")

    def send_request(self, url, data=None, method="post", token=None, timeout=120):
        # if not token:
        #     return dict(req_status=False, status=401, message="Missing Authorization token")

        headers = {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        try:
            if method.lower() == "get":
                response = requests.get(url, params=data, headers=headers, timeout=timeout)
            elif method.lower() == "put":
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            response.raise_for_status()
            return dict(req_status=True, **response.json())

        except requests.exceptions.HTTPError as e:
            return dict(req_status=False, status=response.status_code, message=str(e))
        except requests.exceptions.RequestException as e:
            return dict(req_status=False, status=900, message=str(e))
        except JSONDecodeError:
            return dict(req_status=False, status=901, message="Invalid JSON from provider")
