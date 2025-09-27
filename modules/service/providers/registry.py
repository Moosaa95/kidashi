"""Lightweight provider registry inspired by the Shinobi implementation."""

from importlib import import_module

from django.core.exceptions import ImproperlyConfigured


def load_provider_class(dotted_path):
    """Return the provider class for the dotted path (supports ``module:Class`` format)."""
    if ":" in dotted_path:
        module_path, class_name = dotted_path.split(":", 1)
    else:
        module_path, class_name = dotted_path.rsplit(".", 1)

    module = import_module(module_path)

    try:
        return getattr(module, class_name)
    except AttributeError as exc:
        raise ImproperlyConfigured(f"Provider class '{class_name}' not found in module '{module_path}'.") from exc


def get_provider_client(dotted_path, **init_kwargs):
    """Instantiate and return a provider client for the supplied dotted path."""
    provider_class = load_provider_class(dotted_path)
    return provider_class(**init_kwargs)


__all__ = ["get_provider_client", "load_provider_class"]
