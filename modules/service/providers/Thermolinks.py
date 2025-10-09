import traceback
from smpplib.client import Client
import os


class Thermolinks:
    def __init__(self):
        self.host = os.getenv("THERMOLINKS_HOST", "20.39.43.35")
        self.port = os.getenv("THERMOLINKS_PORT", "7661")
        self.system_id = os.getenv("THERMOLINKS_SYSTEM_ID", "PRALLT")
        self.password = os.getenv("THERMOLINKS_PASSWORD", "PRaLLT@1")
        self.sender = os.getenv("THERMOLINK_SENDER", "PAYREP MFB")

    def send_sms(self, message, recipient):
        print("==========THERMOLINKS REQUEST==============")
        print("RECIPIENT: ", recipient)
        print("MESSAGE: ", message)
        res_data = dict(req_status=False)
        client = Client(self.host, self.port)
        try:
            client.connect()
            client.bind_transceiver(system_id=self.system_id, password=self.password)
        except Exception:
            print("=== Thermolinks Connection Error ===")
            print(traceback.format_exc())
            return res_data

        recipient = "234" + recipient[-10:]
        try:
            response = client.send_message(
                source_addr_ton=5,
                source_addr_npi=0,
                source_addr=self.sender,
                dest_addr_ton=1,
                dest_addr_npi=1,
                destination_addr=recipient,
                short_message=message.encode("utf-8"),
                data_coding=0x00,
                registered_delivery=True,
            )
            print("=======THERMOLINKS RESPONSE==========")
            print(response)
            res_data.update(req_status=True)
        except Exception:
            print("=== Thermolinks Send Error ===")
            print(traceback.format_exc())
            res_data.update(req_status=False)

        client.unbind()
        client.disconnect()
        return res_data
