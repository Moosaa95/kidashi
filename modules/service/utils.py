import importlib
from django.core.exceptions import ValidationError
from modules.service.enums import ServiceChannel


def normalise_channels(channels):
    if not channels:
        return []

    if not isinstance(channels, (list, tuple)):
        raise ValidationError({"supported_channels": "Channels should be provided as a list."})

    seen = []
    valid_values = set(ServiceChannel.values)
    for channel in channels:
        if channel not in valid_values:
            raise ValidationError({"supported_channels": f"Unsupported channel '{channel}'."})
        if channel not in seen:
            seen.append(channel)
    return seen


def get_class_instance(class_name, initiators=None):
    """
    Dynamically import a provider client class and return an instance.

    Args:
        class_name (str): Name of the class (e.g. 'PayrepCba', 'ThermolinksClient').
        initiators (dict, optional): Keyword args to pass into the class constructor.

    Returns:
        object: An instance of the provider client.
    """
    # normalize casing: 'payrepCba' -> 'PayrepCba'
    class_name = class_name[0].upper() + class_name[1:]

    # build module path (e.g. 'service.providers.PayrepCba')
    module_str = "service.providers." + class_name
    module = importlib.import_module(module_str)

    # instantiate class
    if initiators:
        return getattr(module, class_name)(**initiators)
    return getattr(module, class_name)()
