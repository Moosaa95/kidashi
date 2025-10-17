from rest_framework import serializers
from modules.trust_circle.enums import LoanEligibility, TrustCircleStatus, NewMembershipVoteOption


class CreateTrustCircleRequestSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField(help_text="ID of the vendor creating the trust circle")
    circle_name = serializers.CharField(max_length=255, help_text="Name of the trust circle")
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True, help_text="Optional description of the trust circle")


class GetTrustCircleRequestSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False, help_text="UUID of the trust circle to retrieve")
    vendor_id = serializers.UUIDField(required=False, help_text="ID of the vendor that created the trust circle (alternative lookup)")
    circle_name = serializers.CharField(max_length=255, required=False, help_text="Name of the trust circle (alternative lookup)")
    values = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        """
        Ensure at least one lookup method is provided
        """
        if not data.get("id") and not (data.get("vendor_id") and data.get("circle_name")):
            raise serializers.ValidationError("Either 'id' or both 'vendor_id' and 'circle_name' must be provided")
        return data


class FetchTrustCircleWithFilterRequestSerializer(serializers.Serializer):
    filters = serializers.DictField(child=serializers.CharField(), required=False)
    count = serializers.IntegerField(required=False, min_value=1)


class TrustCircleSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False, help_text="Unique identifier of the trust circle")
    vendor_id = serializers.UUIDField(required=False, help_text="Filter by vendor ID")
    circle_name = serializers.CharField(max_length=255, required=False, help_text="Filter by trust circle name")
    loan_eligibility = serializers.ChoiceField(choices=LoanEligibility.choices, required=False, help_text="Filter by loan eligibility status")
    status = serializers.ChoiceField(choices=TrustCircleStatus.choices, required=False, help_text="Filter by trust circle status")
    # activation_date = serializers.DateTimeField(required=False, allow_null=True, help_text="Activation date of the trust circle")
    # date = serializers.CharField(required=False, help_text="Filter by a specific creation date (YYYY-MM-DD)")
    # start_date = serializers.CharField(required=False, help_text="Filter by creation start date (YYYY-MM-DD)")
    # end_date = serializers.CharField(required=False, help_text="Filter by creation end date (YYYY-MM-DD)")


class FetchTrustCircleFilterSerializer(serializers.Serializer):
    filters = TrustCircleSerializer(required=False, help_text="Optional filters for fetching trust circles")
    search = serializers.CharField(required=False, allow_blank=True, help_text="Search trust circles by circle name")
    count = serializers.IntegerField(required=False, min_value=1, help_text="Optional limit on the number of records to return")


class ProposeWomanRequestSerializer(serializers.Serializer):
    initiating_vendor_id = serializers.UUIDField(help_text="ID of the vendor proposing the addition")
    trust_circle_id = serializers.UUIDField(help_text="UUID of the trust circle")
    woman_id = serializers.UUIDField(help_text="UUID of the woman to be added to the trust circle")
    selected_voters = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        max_length=2,
        help_text="List of 2 voter UUIDs when circle has 3 or greater members. Required only when circle has >= 3 members.",
    )

class VoteItemSerializer(serializers.Serializer):
    vote_id = serializers.UUIDField(help_text="UUID of the membership vote")
    otp = serializers.CharField(max_length=4, min_length=4, help_text="OTP code provided by the voter")

class UpdateVoteRequestSerializer(serializers.Serializer):
    votes = serializers.ListField(
        child=VoteItemSerializer(),
        allow_empty=False,
        help_text="List of vote items, each containing vote_id and otp. Required when circle has >= 3 members.",
    )

class AddorRemoveVoteSerializer(serializers.Serializer):
    trust_circle_id = serializers.UUIDField(help_text="ID of the trust circle", required=False, allow_null=True)
    voter_id = serializers.UUIDField(help_text="ID of the voter", allow_null=True, required=False)

class VotesSerializer(serializers.Serializer):
    trust_circle_id = serializers.UUIDField(required=False, help_text="Optional: UUID of specific trust circle", allow_null=True)
    candidate_member = serializers.UUIDField(required=False, help_text="Optional: UUID of the candidate member")
    
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
