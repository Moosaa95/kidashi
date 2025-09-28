from django.core.exceptions import ValidationError
from django.test import TestCase

from modules.service.enums import ServiceChannel, ServiceCategoryType
from modules.service.models import Service, ServiceCategory, ServiceIntegration, ServiceProvider
from modules.service.providers import PayrepCba


class ServiceModelTests(TestCase):
    def setUp(self):
        self.category = ServiceCategory.objects.create(
            name="Core Banking",
            code="CORE",
            type=ServiceCategoryType.CORE_BANKING,
            description="Core banking workflows",
        )

        self.provider = ServiceProvider.objects.create(
            name="PayRep CBA",
            code="payrep",
            module_path="modules.service.providers.PayrepCba:PayrepCba",
            supported_channels=[ServiceChannel.MOBILE, ServiceChannel.API],
        )

        self.service = Service.objects.create(
            name="Customer Onboarding",
            code="cust_onboard",
            category=self.category,
            supported_channels=[ServiceChannel.MOBILE, ServiceChannel.API],
        )

    def test_service_provider_client_instantiation(self):
        client = self.provider.get_client()
        self.assertIsInstance(client, PayrepCba)

    def test_service_integration_get_client_merges_config(self):
        integration = ServiceIntegration.objects.create(
            service=self.service,
            provider=self.provider,
            channel=ServiceChannel.MOBILE,
            priority=1,
            config={"base_url": "http://testserver"},
        )

        client = integration.get_client()
        self.assertIsInstance(client, PayrepCba)
        self.assertEqual(client.base_url, "http://testserver")

    def test_integration_rejects_channels_not_supported_by_service(self):
        invalid_integration = ServiceIntegration(
            service=self.service,
            provider=self.provider,
            channel=ServiceChannel.USSD,
        )

        with self.assertRaises(ValidationError):
            invalid_integration.full_clean()

    def test_integration_rejects_channels_not_supported_by_provider(self):
        provider = ServiceProvider.objects.create(
            name="API only",
            code="only_api",
            module_path="modules.service.providers.PayrepCba:PayrepCba",
            supported_channels=[ServiceChannel.API],
        )

        invalid_integration = ServiceIntegration(
            service=self.service,
            provider=provider,
            channel=ServiceChannel.MOBILE,
        )

        with self.assertRaises(ValidationError):
            invalid_integration.full_clean()
