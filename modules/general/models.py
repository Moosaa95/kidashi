from django.db import models, IntegrityError

# from cloudinary.models import CloudinaryField
from common.mixins import ModelMixin


class Country(ModelMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.name

    @classmethod
    def fetch_countries(cls):
        return cls.objects.all()


class GeoRegion(ModelMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.name


class State(ModelMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True)
    region = models.ForeignKey(GeoRegion, on_delete=models.CASCADE)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.name

    @classmethod
    def fetch_states(cls):
        return cls.objects.all()


class LocalGovernment(ModelMixin):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.name

    @classmethod
    def fetch_local_governments(cls, state_id):
        return cls.objects.filter(state_id=state_id)


class Configurations(ModelMixin):
    name = models.CharField(max_length=30, null=True, blank=True, unique=True)
    configurations = models.JSONField(null=True, blank=True)
    accounting_code = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.name

    @classmethod
    def get_config(cls, name):
        try:
            return cls.objects.get(name=name)
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_configurations(cls, name):
        try:
            configuration = cls.objects.get(name=name)
            return configuration.configurations
        except cls.DoesNotExist:
            return {}

    @classmethod
    def get_fields(cls):
        return ["name", "configurations", "accounting_code"]

    @classmethod
    def create_configurations(cls, name, accounting_code=None, configurations=None):
        try:
            cls.objects.create(name=name, accounting_code=accounting_code, configurations=configurations)
            return True
        except Exception as e:
            print("error=----=====", e)
            return False

    @classmethod
    def fetch_configurations(cls, conditions):
        return cls.objects.filter(conditions).order_by("-pk").values(*cls.get_fields())

    @classmethod
    def update_configurations(cls, name, **kwargs):
        if not kwargs:
            return False

        configurations = cls.get_configurations(name)

        if not configurations:
            new_config = [configurations]
            configuration = cls.create_configurations(name, configurations=new_config)
            # return configuration

        if not configurations:
            updated = [kwargs]
            cls.objects.filter(name=name).update(configurations=updated)
            return updated

        if isinstance(configurations, dict):
            configurations = [configurations]

        configurations.append(kwargs)

        configuration = cls.objects.filter(name=name).update(configurations=configurations)

        return configuration


class Bank(ModelMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=12, unique=True)
    cbn_code = models.CharField(max_length=12, null=True, blank=True)

    objects = models.Manager()

    def __str__(self):
        return self.name

    @classmethod
    def get_fields(cls):
        return [
            "id",
            "name",
            "code",
            "cbn_code",
        ]

    @classmethod
    def create_bank(cls, **kwargs):
        try:
            query = cls.objects.create(**kwargs)
        except IntegrityError:
            query = None
        return query

    @classmethod
    def get_bank(cls, **kwargs):
        try:
            query = cls.objects.get(**kwargs)
        except cls.DoesNotExist:
            query = None
        return query

    @classmethod
    def fetch_banks(cls):
        return cls.objects.all().values(*cls.get_fields())

    @classmethod
    def get_probable_bankV1(cls, account_number):
        possible_banks = []
        banks = [
            {"bank_name": "Access Bank", "cbn_code": "044", "bank_code": "000014"},
            {"bank_name": "Fidelity Bank", "cbn_code": "070", "bank_code": "000007"},
            {"bank_name": "StanbicIBTC Bank", "cbn_code": "221", "bank_code": "000012"},
            {"bank_name": "StandardChartered", "cbn_code": "068", "bank_code": "000021"},
            {"bank_name": "Citi Bank", "cbn_code": "023", "bank_code": "000009"},
            {"bank_name": "GTBank Plc", "cbn_code": "058", "bank_code": "000013"},
            {"bank_name": "Sterling Bank", "cbn_code": "232", "bank_code": "000001"},
            {"bank_name": "Access Bank (Diamond)", "cbn_code": "063", "bank_code": "000005"},
            {"bank_name": "UBA", "cbn_code": "033", "bank_code": "000004"},
            {"bank_name": "Ecobank Bank", "cbn_code": "050", "bank_code": "000010"},
            {"bank_name": "Union Bank", "cbn_code": "032", "bank_code": "000018"},
            {"bank_name": "Wema bank", "cbn_code": "035", "bank_code": "000017"},
            {"bank_name": "First Bank", "cbn_code": "011", "bank_code": "000016"},
            {"bank_name": "Polaris Bank", "cbn_code": "076", "bank_code": "000008"},
            {"bank_name": "Zenith Bank Plc", "cbn_code": "057", "bank_code": "000015"},
            {"bank_name": "FCMB", "cbn_code": "214", "bank_code": "000003"},
            {"bank_name": "Unity bank", "cbn_code": "215", "bank_code": "000011"},
        ]
        arr = list(account_number)
        try:
            check_digit = arr.pop(9)
        except IndexError:
            return possible_banks
        pool = 0
        mul = [3, 7, 3, 3, 7, 3, 3, 7, 3]
        cmul = [3, 7, 3]
        i = 0
        for num in arr:
            val = int(num) * mul[i]
            pool += val
            i += 1

        for bank in banks:
            i = 0
            pool2 = 0
            code_chars = list(bank["cbn_code"])
            for char in code_chars:
                val1 = int(char) * cmul[i]
                pool2 += val1
                i += 1
            rem = (pool2 + pool) % 10
            cc = 10 - rem
            if cc == 10:
                cc = 0

            if cc == int(check_digit):
                possible_banks.append(dict(name=bank["bank_name"], code=bank["bank_code"]))

            # if len(possible_banks) == 3:
            #     return possible_banks
        return possible_banks

    @classmethod
    def get_probable_bank(cls, account_number):
        possible_banks = []
        banks = [
            {"bank_name": "Payrep MFB", "cbn_code": "51388", "bank_code": "951388"},
            {"bank_name": "Access Bank", "cbn_code": "044", "bank_code": "000014"},
            {"bank_name": "Fidelity Bank", "cbn_code": "070", "bank_code": "000007"},
            {"bank_name": "StanbicIBTC Bank", "cbn_code": "221", "bank_code": "000012"},
            {"bank_name": "StandardChartered", "cbn_code": "068", "bank_code": "000021"},
            {"bank_name": "Citi Bank", "cbn_code": "023", "bank_code": "000009"},
            {"bank_name": "GTBank Plc", "cbn_code": "058", "bank_code": "000013"},
            {"bank_name": "Sterling Bank", "cbn_code": "232", "bank_code": "000001"},
            {"bank_name": "Access Bank (Diamond)", "cbn_code": "063", "bank_code": "000005"},
            {"bank_name": "UBA", "cbn_code": "033", "bank_code": "000004"},
            {"bank_name": "Ecobank Bank", "cbn_code": "050", "bank_code": "000010"},
            {"bank_name": "Union Bank", "cbn_code": "032", "bank_code": "000018"},
            {"bank_name": "Wema bank", "cbn_code": "035", "bank_code": "000017"},
            {"bank_name": "First Bank", "cbn_code": "011", "bank_code": "000016"},
            {"bank_name": "Polaris Bank", "cbn_code": "076", "bank_code": "000008"},
            {"bank_name": "Zenith Bank Plc", "cbn_code": "057", "bank_code": "000015"},
            {"bank_name": "FCMB", "cbn_code": "214", "bank_code": "000003"},
            {"bank_name": "Unity bank", "cbn_code": "215", "bank_code": "000011"},
        ]
        arr = list(account_number)
        try:
            check_digit = arr.pop(9)
        except IndexError:
            return possible_banks
        pool = 0
        mul = [3, 7, 3, 3, 7, 3, 3, 7, 3]
        cmul = [3, 7, 3, 3, 7, 3]
        i = 0
        for num in arr:
            val = int(num) * mul[i]
            pool += val
            i += 1

        for bank in banks:
            if len(bank["cbn_code"]) == 3:
                bank["cbn_code"] = "000" + bank["cbn_code"]
            else:
                bank["cbn_code"] = "9" + bank["cbn_code"]
            i = 0
            pool2 = 0
            code_chars = list(bank["cbn_code"])
            for char in code_chars:
                val1 = int(char) * cmul[i]
                pool2 += val1
                i += 1
            rem = (pool2 + pool) % 10
            cc = 10 - rem
            if cc == 10:
                cc = 0

            if cc == int(check_digit):
                possible_banks.append(dict(name=bank["bank_name"], code=bank["bank_code"]))

            # if len(possible_banks) == 3:
            #     return possible_banks
        return possible_banks


class TaskScheduler(ModelMixin):
    name = models.CharField(max_length=255, null=True, blank=True, unique=True)
    task = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

    @classmethod
    def get_task(cls, **kwargs):
        try:
            return cls.objects.get(**kwargs)
        except cls.DoesNotExist:
            return None

    @classmethod
    def fetch_tasks(cls):
        return cls.objects.all().values("name", "task", "description")

    @classmethod
    def create_task(cls, **kwargs):
        try:
            return cls.objects.create(**kwargs)
        except IntegrityError:
            return None


class OnboardingActivityLogs(ModelMixin):
    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="onboarding_activities")
    action = models.CharField(max_length=255)
    description = models.TextField()
    status = models.BooleanField(default=False)
    data = models.JSONField(default=dict)

    @classmethod
    def create_log(cls, **kwargs):
        return cls.objects.create(**kwargs)

    @classmethod
    def get_log(cls, **filters):
        try:
            return cls.objects.get(**filters)
        except cls.DoesNotExist:
            return False

    @classmethod
    def update_log(cls, log_id, **kwargs):
        return cls.objects.filter(id=log_id).update(**kwargs)
