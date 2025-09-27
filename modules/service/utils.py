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
