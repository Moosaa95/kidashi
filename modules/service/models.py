from django.core.exceptions import ValidationError
from django.db import models

from common.mixins import ModelMixin
from modules.service.enums import ServiceCategoryType, ServiceChannel
from modules.service.providers.registry import get_provider_client
from modules.service.utils import normalise_channels


class ServiceCategory(ModelMixin):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=30, choices=ServiceCategoryType.choices, default=ServiceCategoryType.CORE_BANKING)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ServiceProvider(ModelMixin):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    module_path = models.CharField(
        max_length=255,
        help_text="Dotted path to the provider client class e.g. modules.service.providers.PayrepCba:PayrepCba",
    )
    supported_channels = models.JSONField(default=list, blank=True, help_text="List of supported service channels")
    metadata = models.JSONField(default=dict, blank=True, help_text="Optional configuration passed to the provider class")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        self.supported_channels = normalise_channels(self.supported_channels)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def supports_channel(self, channel):
        return channel in self.supported_channels

    def get_client(self, **overrides):
        """Instantiate the provider client using the configured module path."""
        params = {**(self.metadata or {}), **overrides}
        return get_provider_client(self.module_path, **params)


class Service(ModelMixin):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(ServiceCategory, null=True, blank=True, on_delete=models.SET_NULL, related_name="services")
    description = models.TextField(blank=True)
    supported_channels = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        self.supported_channels = normalise_channels(self.supported_channels)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def supports_channel(self, channel):
        return channel in self.supported_channels

    def active_integrations(self, channel=None):
        integrations = self.integrations.filter(is_active=True)
        if channel:
            integrations = integrations.filter(channel=channel)
        return integrations.order_by("priority")


class ServiceIntegration(ModelMixin):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="integrations")
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name="integrations")
    channel = models.CharField(max_length=20, choices=ServiceChannel.choices)
    priority = models.PositiveSmallIntegerField(default=1, help_text="Lower values are preferred when selecting a provider")
    config = models.JSONField(default=dict, blank=True, help_text="Overrides passed when instantiating the provider client")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["service", "channel", "priority"]
        unique_together = ("service", "channel", "priority")

    def __str__(self):
        return f"{self.service.code}::{self.channel}::{self.provider.code}"

    def clean(self):
        super().clean()

        if not self.service.supports_channel(self.channel):
            raise ValidationError({"channel": f"Service '{self.service.code}' does not support channel '{self.channel}'."})

        if not self.provider.supports_channel(self.channel):
            raise ValidationError({"channel": f"Provider '{self.provider.code}' does not support channel '{self.channel}'."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def get_client(self, **overrides):
        params = {**(self.config or {}), **overrides}
        return self.provider.get_client(**params)
