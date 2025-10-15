from django.db import transaction
from django.db.models import Q
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from django.utils import timezone

from drf_spectacular.utils import extend_schema, inline_serializer
from common.functions import generate_otp
from modules.notification.tasks import send_sms
from modules.trust_circle.enums import TrustCircleActivityType, NewMembershipVoteOption
from modules.trust_circle.models import TrustCircle, CircleActivity, CircleMembershipVote, VoteStatus
from modules.trust_circle.serializers import (
    CreateTrustCircleRequestSerializer,
    GetTrustCircleRequestSerializer,
    ProposeWomanRequestSerializer,
    UpdateVoteRequestSerializer,
    VoteStatusRequestSerializer,
    PendingVotesRequestSerializer,
    ResendOtpRequestSerializer,
    ExpiredVotesRequestSerializer,
    FetchTrustCircleFilterSerializer,
    AddorRemoveVoteSerializer,
    VotesSerializer
)
from modules.vendor.enums import VendorStatus
from modules.vendor.models import Vendor
from modules.woman.models import Woman
from modules.woman.enums import WomanStatus
from modules.security.models import OTP
from modules.security.enums import OtpPurpose


def send_otp_to_woman(mobile_number, otp):
    # TODO: Send OTP to woman's mobile_number
    send_sms(message=f"this is your otp {otp}", recipient=mobile_number)


def get_request_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    return x_forwarded_for.split(",")[0].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR")


class CreateTrustCircle(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Create a new Trust Circle",
        request=CreateTrustCircleRequestSerializer,
        responses={
            201: inline_serializer(
                name="CreateTrustCircleResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    circle_id=serializers.UUIDField(),
                    circle_name=serializers.CharField(),
                    max_members=serializers.IntegerField(),
                    description=serializers.CharField(allow_blank=True),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = CreateTrustCircleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor_id = serializer.validated_data["vendor_id"]

        vendor = Vendor.get_vendor(id=vendor_id)

        if not vendor:
            return Response({"status": False, "message": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        if vendor.status != VendorStatus.ACTIVE:
            return Response({"status": False, "message": "Vendor is not active"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                trust_circle = TrustCircle.create_trust_circle(
                    vendor=vendor,
                    circle_name=serializer.validated_data["circle_name"],
                    description=serializer.validated_data.get("description", ""),
                )
        except IntegrityError:
            return Response(
                {"status": False, "message": "A circle with this name already exists for this vendor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ip_address = get_request_ip(request=request)

        CircleActivity.create_activity(
            trust_circle=trust_circle,
            activity_type=TrustCircleActivityType.CIRCLE_CREATED,
            description=f"Trust Circle '{trust_circle.circle_name}' created by Vendor '{vendor.cba_customer_id}'",
            performed_by=vendor,
            metadata={"circle_name": trust_circle.circle_name, "vendor_id": str(vendor.id)},
            ip_address=ip_address,
        )

        return Response(
            {
                "status": True,
                "message": "Trust Circle created successfully",
                "circle_id": trust_circle.id,
                "circle_name": trust_circle.circle_name,
                "max_members": trust_circle.max_members,
                "description": trust_circle.description,
                "trust_circle_status": trust_circle.status,
                "loan_eligibility": trust_circle.loan_eligibility,
                "created_at": trust_circle.created_at,
            },
            status=status.HTTP_201_CREATED,
        )


class GetTrustCircle(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Get details of a specific Trust Circle. Set 'values=true' to get only basic fields, 'values=false' or omit to get full details including women list.",
        request=GetTrustCircleRequestSerializer,
        responses={
            200: inline_serializer(
                name="GetTrustCircleResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="TrustCircleData",
                        fields={
                            "id": serializers.UUIDField(),
                            "circle_name": serializers.CharField(),
                            "description": serializers.CharField(allow_blank=True),
                            "max_members": serializers.IntegerField(),
                            "members_count": serializers.IntegerField(),
                            "status": serializers.CharField(),
                            "loan_eligibility": serializers.BooleanField(),
                            "created_at": serializers.DateTimeField(),
                            "updated_at": serializers.DateTimeField(),
                            "women": serializers.ListField(
                                child=inline_serializer(
                                    name="WomanData",
                                    fields={
                                        "id": serializers.UUIDField(),
                                        "first_name": serializers.CharField(),
                                        "other_name": serializers.CharField(allow_blank=True),
                                        "surname": serializers.CharField(),
                                        "mobile_number": serializers.CharField(),
                                        "account_number": serializers.CharField(),
                                        "occupation": serializers.CharField(allow_blank=True),
                                        "employment_type": serializers.CharField(allow_blank=True),
                                        "image": serializers.CharField(allow_blank=True),
                                        "status": serializers.CharField(),
                                    },
                                ),
                                required=False,
                                help_text="Only included when values=false",
                            ),
                        },
                    ),
                ),
            ),
            404: inline_serializer(
                name="NotFoundResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        response_data = dict(status=True, message="Trust Circle Found")
        serializer = GetTrustCircleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trust_circle_request_detail = serializer.validated_data

        trust_circle_detail = TrustCircle.get_trust_circle(**trust_circle_request_detail)
        if not trust_circle_detail:
            response_data.update(status=False, message="Trust Circle detail not found")
            return Response(data=response_data, status=status.HTTP_400_BAD_REQUEST)

        # Check if values=True was passed (returns dict) or values=False/None (returns model instance)
        if isinstance(trust_circle_detail, dict):
            # Dictionary format from values=True
            response_data.update(data=trust_circle_detail)
        else:
            # Model instance format from values=False/None - includes women list
            trust_circle_data = {
                "id": trust_circle_detail.id,
                "circle_name": trust_circle_detail.circle_name,
                "description": trust_circle_detail.description,
                "max_members": trust_circle_detail.max_members,
                "members_count": trust_circle_detail.current_member_count,
                "status": trust_circle_detail.status,
                "loan_eligibility": trust_circle_detail.loan_eligibility,
                "created_at": trust_circle_detail.created_at,
                "updated_at": trust_circle_detail.updated_at,
                "women": [
                    {
                        "id": woman.id,
                        "first_name": woman.first_name,
                        "other_name": woman.other_name,
                        "surname": woman.surname,
                        "mobile_number": woman.mobile_number,
                        "account_number": woman.account_number,
                        "cba_customer_id": woman.cba_customer_id,
                        "nin": woman.nin,
                        "bvn": woman.bvn,
                        "state": woman.state,
                        "lga": woman.lga,
                        "occupation": woman.occupation,
                        "employment_type": woman.employment_type,
                        "image": woman.image,
                        "status": woman.status,
                    }
                    for woman in trust_circle_detail.women.all()
                ],
            }
            response_data.update(data=trust_circle_data)

        return Response(data=response_data, status=status.HTTP_200_OK)


class FetchTrustCircles(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Fetch all Trust Circles for a vendor with optional filtering",
        request=FetchTrustCircleFilterSerializer,
        responses={
            200: inline_serializer(
                name="FetchTrustCirclesResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="TrustCirclesData",
                        fields={
                            "circles": serializers.ListField(
                                child=inline_serializer(
                                    name="CircleItem",
                                    fields={
                                        "id": serializers.UUIDField(),
                                        "circle_name": serializers.CharField(),
                                        "description": serializers.CharField(allow_blank=True),
                                        "max_members": serializers.IntegerField(),
                                        "current_member_count": serializers.IntegerField(),
                                        "can_add_more_members": serializers.BooleanField(),
                                        "is_full": serializers.BooleanField(),
                                        "status": serializers.CharField(),
                                        "loan_eligibility": serializers.CharField(),
                                        "activation_date": serializers.DateTimeField(allow_null=True),
                                        "created_at": serializers.DateTimeField(),
                                        "updated_at": serializers.DateTimeField(),
                                    },
                                )
                            ),
                            "total_count": serializers.IntegerField(),
                        },
                    ),
                ),
            ),
            404: inline_serializer(
                name="VendorNotFoundResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = FetchTrustCircleFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        filters_data = validated_data.get("filters", {}) or {}
        search = validated_data.get("search", "").strip()
        vendor_id = filters_data.get("vendor_id")
        # count = serializer.validated_data.get("count")

        if search:
            conditions = Q(circle_name__icontains=search)
        else:
            conditions = Q(vendor_id=vendor_id) if vendor_id else Q()

        for key, value in filters_data.items():
            conditions &= Q(**{key: value})

        trust_circles = TrustCircle.fetch_trust_circles_with_filter(conditions=conditions)

        return Response(
            {
                "status": True,
                "message": "Trust circles fetched successfully",
                "data": {
                    "circles": trust_circles,
                    "total_count": len(trust_circles),
                },
            },
            status=status.HTTP_200_OK,
        )


class ProposeWomanToTrustCircle(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Propose a woman to join a Trust Circle. Automatically adds if <3 members, creates vote if >=3 members.",
        request=ProposeWomanRequestSerializer,
        responses={
            200: inline_serializer(
                name="ProposeWomanResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
            400: inline_serializer(
                name="ProposeWomanErrorResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = ProposeWomanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        initiating_vendor_id = serializer.validated_data["initiating_vendor_id"]
        trust_circle_id = serializer.validated_data["trust_circle_id"]
        woman_id = serializer.validated_data["woman_id"]
        selected_voter_ids = serializer.validated_data.get("selected_voters", [])

        # Get member addition - initiating vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Initiating Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get trust circle
        trust_circle = TrustCircle.get_trust_circle(id=trust_circle_id)
        if not trust_circle:
            return Response({"status": False, "message": "Trust Circle not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get woman
        woman = Woman.get_woman(id=woman_id)
        if not woman:
            return Response({"status": False, "message": "Woman not found"}, status=status.HTTP_404_NOT_FOUND)

        if woman.get("trust_circle", None) == trust_circle_id:
            return Response({"status": False, "message": "Woman is already a member of this Trust Circle"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there's already a pending vote for this woman
        existing_vote = CircleMembershipVote.fetch_votes(trust_circle=trust_circle, candidate_member=woman, status=VoteStatus.PENDING).first()

        if existing_vote:
            return Response({"status": False, "message": "There is already a pending vote for this woman"}, status=status.HTTP_400_BAD_REQUEST)

        ip_address = get_request_ip(request=request)
        
        conditions = Q()

        conditions |= Q(trust_circle_id=trust_circle_id)
        conditions |= Q(status=WomanStatus.ACTIVE)

        active_member_count = Woman.fetch_women(conditions=conditions).count()

        try:
            with transaction.atomic():
                if not active_member_count:
                    # Automatically add woman to trust circle
                    woman = Woman.update_woman(woman_id, trust_circle_id=trust_circle_id, status=WomanStatus.ACTIVE)

                    # Log activity
                    CircleActivity.create_activity(
                        trust_circle=trust_circle,
                        activity_type=TrustCircleActivityType.MEMBER_ADDED,
                        description=f"Woman '{woman.first_name + ' ' + woman.surname}' automatically added to Trust Circle '{trust_circle.circle_name}'",
                        performed_by=vendor,
                        affected_woman=woman,
                        metadata={"woman_id": str(woman.id), "automatic_addition": True},
                        ip_address=ip_address,
                    )

                    return Response(
                        {
                            "status": True,
                            "message": "Woman successfully added to Trust Circle",
                        },
                        status=status.HTTP_200_OK,
                    )
                    
                if active_member_count == 1 and len(selected_voter_ids) < 1:
                    return Response({"status": False, "message": "At least 1 voter must be selected"}, status=status.HTTP_400_BAD_REQUEST)
                    
                if active_member_count != 1 and len(selected_voter_ids) < 2:
                    return Response({"status": False, "message": "At least 2 voters must be selected"}, status=status.HTTP_400_BAD_REQUEST)
                
                voters = []
                mobile_numbers = []
                
                # Refactored logic to use a single query to retrieve women in bulk

                # Fetch all women in a single query
                voter_women = Woman.objects.filter(id__in=selected_voter_ids)

                # Iterate over the selected voter IDs
                for voter_woman in voter_women:

                    if not voter_woman:
                        return Response({"status": False, "message": "Voter not found"}, status=status.HTTP_404_NOT_FOUND)

                    if voter_woman.trust_circle != trust_circle_id:
                        return Response({"status": False, "message": f"Selected voter {voter_woman.first_name + ' ' + voter_woman.surname} does not belong to this circle"}, status=status.HTTP_400_BAD_REQUEST)

                    if voter_woman.status != WomanStatus.ACTIVE:
                        return Response({"status": False, "message": f"Selected voter {voter_woman.first_name + ' ' + voter_woman.surname} is not an active member of this circle"}, status=status.HTTP_400_BAD_REQUEST)

                    voters.append(voter_woman.id)
                    mobile_numbers.append(voter_woman.mobile_number)

                votes = []
                for voter in voters:
                    # Create the vote
                    vote = CircleMembershipVote.create_vote(trust_circle=trust_circle, candidate_member=woman, initiating_vendor=vendor, voter=voter)
                    if not vote:
                        transaction.set_rollback(True)
                        return Response({"status": False, "message": "Error creating vote"}, status=status.HTTP_400_BAD_REQUEST)
                    votes.append(vote)
                    
                # Generate and send OTP to voter
                for mobile_number in mobile_numbers:
                    OTP.create_otp(
                        purpose=OtpPurpose.VOTER_VALIDATION,
                        subject_id=mobile_number,
                        channel="SMS",
                        log_to_db=True,
                        recipient=mobile_number,
                    )

                # Log activity
                CircleActivity.create_activity(
                    trust_circle=trust_circle,
                    activity_type=TrustCircleActivityType.VOTE_INITIATED,
                    description=f"Voting initiated for woman '{woman.first_name + ' ' + woman.surname}' to join Trust Circle '{trust_circle.circle_name}'",
                    performed_by=vendor,
                    affected_woman=woman,
                    metadata={"votes": [str(vote.id) for vote in votes], "candidate_id": str(woman.id), "voters": selected_voter_ids},
                    ip_address=ip_address,
                )

                return Response(
                    {
                        "status": True,
                        "message": "Voting process initiated. OTPs have been sent to selected voters.",
                    },
                    status=status.HTTP_200_OK,
                )

        except ValidationError as e:
            print("Validation exception:::", e)
            return Response({"status": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("General exception:::", e)
            return Response({"status": False, "message": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ValidateVote(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Submit or update a vote for Trust Circle membership",
        request=UpdateVoteRequestSerializer,
        responses={
            200: inline_serializer(
                name="ValidateVoteResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
            400: inline_serializer(
                name="ValidateVoteErrorResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = UpdateVoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        votes = serializer.validated_data["votes"]

        try:
            for vote in votes:
                with transaction.atomic():
                    vote_id = vote.get("vote_id")
                    otp = vote.get("otp")

                    circle_vote = CircleMembershipVote.get_vote(id=vote_id)
                    
                    if not circle_vote:
                        return Response({"status": False, "message": f"Membership Vote not found"}, status=status.HTTP_404_NOT_FOUND)

                    result = OTP.validate(
                        purpose=OtpPurpose.VOTER_VALIDATION,
                        input_otp=otp,
                        subject_id=circle_vote.voter.mobile_number,
                    )
                    if not result.get("status", False):
                        return Response({"status": False, "message": f"Invalid OTP for voter {circle_vote.voter.first_name + ' ' + circle_vote.voter.surname}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    updated_vote = CircleMembershipVote.update_vote_status(vote_id=vote_id, status=VoteStatus.APPROVED)
                    if not updated_vote:
                        transaction.set_rollback(True)
                        return Response({"status": False, "message": f"Error updating vote for voter {circle_vote.voter.first_name + ' ' + circle_vote.voter.surname}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                return Response({"status": True, "message": "All votes validated and updated successfully"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            print("ValidateVote::::Validation exception:::", e)
            return Response({"status": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("ValidateVote::::General exception:::", e)
            return Response({"status": False, "message": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RemoveVoter(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Remove a vote only if the vote is still pending",
        request=AddorRemoveVoteSerializer,
        responses={
            200: inline_serializer(
                name="RemoveVoterResponse",
                fields={
                    "status": serializers.BooleanField(),
                    "message": serializers.CharField(),
                },
            ),
            400: inline_serializer(
                name="RemoveVoterErrorResponse",
                fields={
                    "status": serializers.BooleanField(),
                    "message": serializers.CharField(),
                },
            ),
        },
    )
    def post(self, request):
        serializers = AddorRemoveVoteSerializer(data=request.data)
        serializers.is_valid(raise_exception=True)
        vote_id = serializers.validated_data.get("vote_id")


        result = CircleMembershipVote.delete_vote(vote_id)
            
        return Response(
            data=result,
            status=status.HTTP_200_OK,
        )


class AddVoter(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Add a vote, ensuring the maximum number of votes (2) is not exceeded",
        request=AddorRemoveVoteSerializer,
        responses={
            200: inline_serializer(
                name="AddVoterResponse",
                fields={
                    "status": serializers.BooleanField(),
                    "message": serializers.CharField(),
                },
            ),
            400: inline_serializer(
                name="AddVoterErrorResponse",
                fields={
                    "status": serializers.BooleanField(),
                    "message": serializers.CharField(),
                },
            ),
        },
    )
    def post(self, request):
        serializers = AddorRemoveVoteSerializer(data=request.data)
        serializers.is_valid(raise_exception=True)
        vote_id = serializers.validated_data.get("vote_id")

        vote = CircleMembershipVote.get_vote(id=vote_id)
        trust_circle = vote.trust_circle
        candidate_member = vote.candidate_member
        voter = vote.voter

        # Check if the maximum number of votes has been exceeded
        active_votes = CircleMembershipVote.fetch_votes(
            trust_circle=trust_circle,
            candidate_member=candidate_member,
            status=VoteStatus.PENDING
        ).count()

        if active_votes >= 2:
            return Response(
                {
                    "status": False,
                    "message": "Maximum number of votes (2) has been exceeded."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the vote
        CircleMembershipVote.create_vote(
            trust_circle=trust_circle,
            candidate_member=candidate_member,
            voter=voter,
            status=VoteStatus.PENDING
        )

        return Response(
            {
                "status": True,
                "message": "Vote successfully added."
            },
            status=status.HTTP_200_OK,
        )


class FetchVotes(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Fetch votes, returning vote ID, voter details (first name, surname, mobile_number), and vote status",
        request=VotesSerializer,
        responses={
            200: inline_serializer(
                name="FetchVotesResponse",
                fields={
                    "status": serializers.BooleanField(),
                    "message": serializers.CharField(),
                    "data": serializers.ListField(
                        child=inline_serializer(
                            name="VoteData",
                            fields={
                                "vote_id": serializers.UUIDField(),
                                "voter_first_name": serializers.CharField(),
                                "voter_surname": serializers.CharField(),
                                "voter_mobile_number": serializers.CharField(),
                                "vote_status": serializers.CharField(),
                            },
                        )
                    ),
                },
            ),
        },
    )
    def post(self, request):
        serializer = VotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trust_circle_id = serializer.validated_data.get("trust_circle_id")
        candidate_member = serializer.validated_data.get("candidate_member")

        votes = CircleMembershipVote.fetch_votes(trust_circle_id=trust_circle_id, candidate_member_id=candidate_member)

        return Response(
            {
                "status": True,
                "message": "Votes fetched successfully.",
                "data": votes,
            },
            status=status.HTTP_200_OK,
        )
