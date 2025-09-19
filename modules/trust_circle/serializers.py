from rest_framework import serializers
from modules.trust_circle.enums import TrustCircleStatus, NewMembershipVoteOption


class CreateTrustCircleRequestSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField(help_text="ID of the vendor creating the trust circle")
    circle_name = serializers.CharField(max_length=255, help_text="Name of the trust circle")
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True, help_text="Optional description of the trust circle")


class GetTrustCircleRequestSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False, help_text="UUID of the trust circle to retrieve")
    vendor_id = serializers.UUIDField(required=False, help_text="ID of the vendor that created the trust circle (alternative lookup)")
    circle_name = serializers.CharField(max_length=255, required=False, help_text="Name of the trust circle (alternative lookup)")

    def validate(self, data):
        """
        Ensure at least one lookup method is provided
        """
        if not data.get("id") and not (data.get("vendor_id") and data.get("circle_name")):
            raise serializers.ValidationError("Either 'id' or both 'vendor_id' and 'circle_name' must be provided")
        return data


class FetchTrustCirclesRequestSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField(help_text="ID of the vendor whose trust circles to fetch")
    status_filter = serializers.ChoiceField(choices=TrustCircleStatus.choices, required=False, help_text="Optional filter by trust circle status")


class FetchTrustCircleWithFilterRequestSerializer(serializers.Serializer):
    filters = serializers.DictField(child=serializers.CharField(), required=False)
    count = serializers.IntegerField(required=False, min_value=1)


class ProposeWomanRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the vendor proposing the addition")
    trust_circle_id = serializers.UUIDField(help_text="UUID of the trust circle")
    woman_id = serializers.UUIDField(help_text="UUID of the woman to be added to the trust circle")
    selected_voters = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        allow_empty=True,
        max_length=3,
        min_length=3,
        help_text="List of 3 voter UUIDs when circle has more than 3 members. Required only when circle has >3 members.",
    )

    def validate_selected_voters(self, value):
        """
        Validate that if selected_voters is provided, it contains exactly 3 unique UUIDs
        """
        if value is not None:
            if len(value) != 3:
                raise serializers.ValidationError("Must select exactly 3 voters")
            if len(set(value)) != 3:
                raise serializers.ValidationError("All selected voters must be unique")
        return value


class UpdateVoteRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the vendor submitting the vote")
    vote_id = serializers.UUIDField(help_text="UUID of the membership vote")
    voter_position = serializers.IntegerField(min_value=1, max_value=3, help_text="Position of the voter (1, 2, or 3)")
    otp = serializers.CharField(max_length=6, min_length=6, help_text="OTP code provided by the voter")
    vote_choice = serializers.ChoiceField(
        choices=NewMembershipVoteOption.choices,
        help_text="Vote choice: APPROVE or REJECT",
        required=False,
        allow_blank=True,
    )

    def validate_otp(self, value):
        """
        Validate OTP format
        """
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        if not len(value) == 6:
            raise serializers.ValidationError("OTP must be between 6 digits")
        return value


class ExpiredVotesRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.CharField(max_length=50, help_text="ID of the vendor initiating the membership vote")
    trust_circle_id = serializers.UUIDField(required=False, help_text="Optional: UUID of specific trust circle")


class VoteStatusRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the vendor initiating the membership vote")
    vote_id = serializers.UUIDField(help_text="UUID of the membership vote to check")


class PendingVotesRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the vendor initiating the membership vote")
    trust_circle_id = serializers.UUIDField(help_text="UUID of the trust circle to check")


class ResendOtpRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the initiating vendor requesting the OTP resend")
    vote_id = serializers.UUIDField(help_text="UUID of the membership vote")
    voter_position = serializers.IntegerField(min_value=1, max_value=3, help_text="Position of the voter (1, 2, or 3)")
