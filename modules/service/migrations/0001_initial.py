# Generated manually to align with Service models inspired by Shinobi implementation.
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ServiceCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255, unique=True)),
                ("code", models.CharField(max_length=50, unique=True)),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("CORE_BANKING", "Core Banking"),
                            ("VALUE_ADDED", "Value Added"),
                            ("SUPPORT", "Support"),
                        ],
                        default="CORE_BANKING",
                        max_length=30,
                    ),
                ),
                ("description", models.TextField(blank=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="ServiceProvider",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("code", models.CharField(max_length=100, unique=True)),
                ("description", models.TextField(blank=True)),
                (
                    "module_path",
                    models.CharField(
                        help_text="Dotted path to the provider client class e.g. modules.service.providers.PayrepCba:PayrepCba",
                        max_length=255,
                    ),
                ),
                (
                    "supported_channels",
                    models.JSONField(blank=True, default=list, help_text="List of supported service channels"),
                ),
                ("metadata", models.JSONField(blank=True, default=dict, help_text="Optional configuration passed to the provider class")),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("code", models.CharField(max_length=100, unique=True)),
                ("description", models.TextField(blank=True)),
                ("supported_channels", models.JSONField(blank=True, default=list)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="services",
                        to="service.servicecategory",
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="ServiceIntegration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "channel",
                    models.CharField(
                        choices=[
                            ("MOBILE", "Mobile App"),
                            ("USSD", "USSD"),
                            ("IVR", "IVR"),
                            ("WEB", "Web"),
                            ("API", "API"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "priority",
                    models.PositiveSmallIntegerField(
                        default=1, help_text="Lower values are preferred when selecting a provider"
                    ),
                ),
                ("config", models.JSONField(blank=True, default=dict, help_text="Overrides passed when instantiating the provider client")),
                ("is_active", models.BooleanField(default=True)),
                (
                    "provider",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="integrations",
                        to="service.serviceprovider",
                    ),
                ),
                (
                    "service",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="integrations",
                        to="service.service",
                    ),
                ),
            ],
            options={
                "ordering": ["service", "channel", "priority"],
                "unique_together": {("service", "channel", "priority")},
            },
        ),
    ]
