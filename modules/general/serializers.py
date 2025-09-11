from rest_framework import serializers


class GeoRegionSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    code = serializers.CharField(max_length=10, required=False)


class CountrySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()


class StateSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    region = serializers.UUIDField()


class LocalGovernmentRequestSerializer(serializers.Serializer):
    state = serializers.UUIDField()


class LocalGovernmentSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    state = serializers.UUIDField()


class BankSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    cbn_code = serializers.CharField()


class AccountNumberSerializer(serializers.Serializer):
    account_number = serializers.CharField(max_length=10, required=False)


class ConfigurationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50, required=True)
    accounting_code = serializers.CharField(max_length=50, required=False)


class ConfigurationFilterSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    accounting_code = serializers.CharField(required=False)


class BanksFilterSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    code = serializers.CharField(required=False)
    cbn_code = serializers.CharField(required=False)


class ConfigUpdateSerializer(serializers.Serializer):
    name = serializers.CharField()
    configurations = serializers.JSONField()
