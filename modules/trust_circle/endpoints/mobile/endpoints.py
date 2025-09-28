from django.db import transaction
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
from modules.trust_circle.enums import TrustCircleActivityType, NewMembershipVoteOption, TrustCircleStatus
from modules.trust_circle.models import TrustCircle, CircleActivity, CircleMembershipVote, VoteStatus
from modules.trust_circle.serializers import (
    CreateTrustCircleRequestSerializer,
    GetTrustCircleRequestSerializer,
    FetchTrustCirclesRequestSerializer,
    ProposeWomanRequestSerializer,
    UpdateVoteRequestSerializer,
    VoteStatusRequestSerializer,
    PendingVotesRequestSerializer,
    ResendOtpRequestSerializer,
    ExpiredVotesRequestSerializer,
)
from modules.vendor.enums import VendorStatus
from modules.vendor.models import Vendor
from modules.woman.models import Woman
from modules.woman.enums import WomanStatus


def send_otp_to_woman(woman, otp):
    mobile_number = woman.mobile_number
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
                                        "loan_amount": serializers.DecimalField(max_digits=10, decimal_places=2),
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
                        "loan_amount": woman.loan_amount,
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
        request=FetchTrustCirclesRequestSerializer,
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
        serializer = FetchTrustCirclesRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor_id = serializer.validated_data["vendor_id"]
        circle_status_filter = serializer.validated_data.get("status_filter", TrustCircleStatus.ACTIVE)

        vendor = Vendor.get_vendor(id=vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Build query
        queryset = TrustCircle.objects.filter(vendor=vendor, status=circle_status_filter)

        circles = queryset.values(*TrustCircle.get_fields())

        # Add computed properties to each circle
        circles_data = []
        for circle in circles:
            circle_obj = TrustCircle.objects.get(id=circle["id"])
            circle["current_member_count"] = circle_obj.current_member_count
            circle["can_add_more_members"] = circle_obj.can_add_more_members
            circle["is_full"] = circle_obj.is_full
            circle["can_accept_new_members_by_voting"] = circle_obj.can_accept_new_members_by_voting
            circles_data.append(circle)

        return Response(
            {
                "status": True,
                "message": "Trust Circles fetched successfully",
                "data": {
                    "circles": circles_data,
                    "total_count": len(circles_data),
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
                    action_taken=serializers.CharField(),
                    vote_id=serializers.UUIDField(required=False),
                    voting_deadline=serializers.DateTimeField(required=False),
                    voters=serializers.ListField(
                        child=inline_serializer(
                            name="VoterInfo",
                            fields={
                                "id": serializers.UUIDField(),
                                "name": serializers.CharField(),
                                "mobile_number": serializers.CharField(),
                            },
                        ),
                        required=False,
                    ),
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
        try:
            trust_circle = TrustCircle.objects.get(id=trust_circle_id)
        except TrustCircle.DoesNotExist:
            return Response({"status": False, "message": "Trust Circle not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get woman
        try:
            woman = Woman.objects.get(id=woman_id)
        except Woman.DoesNotExist:
            return Response({"status": False, "message": "Woman not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if circle is full
        if trust_circle.is_full:
            return Response({"status": False, "message": "Trust Circle is already full"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if woman is already a member
        if woman in trust_circle.get_active_members():
            return Response({"status": False, "message": "Woman is already a member of this Trust Circle"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there's already a pending vote for this woman
        existing_vote = CircleMembershipVote.objects.filter(trust_circle=trust_circle, candidate_member=woman, status=VoteStatus.PENDING).first()

        if existing_vote:
            return Response({"status": False, "message": "There is already a pending vote for this woman"}, status=status.HTTP_400_BAD_REQUEST)

        ip_address = get_request_ip(request=request)

        current_member_count = trust_circle.current_member_count

        try:
            with transaction.atomic():
                if current_member_count < 3:
                    # Automatically add woman to trust circle
                    woman.trust_circle = trust_circle
                    woman.status = WomanStatus.ACTIVE
                    woman.save()

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
                            "action_taken": "automatic_addition",
                        },
                        status=status.HTTP_200_OK,
                    )

                else:
                    # Create voting process
                    active_members = list(trust_circle.get_active_members())

                    if current_member_count == 3:
                        # Use all 3 members as voters
                        voters = active_members
                    else:
                        # Vendor must select 3 voters
                        if not selected_voter_ids or len(selected_voter_ids) != 3:
                            return Response({"status": False, "message": "Must select exactly 3 voters when circle has more than 3 members"}, status=status.HTTP_400_BAD_REQUEST)

                        # Validate selected voters
                        voters = []
                        for voter_id in selected_voter_ids:
                            try:
                                voter = Woman.objects.get(id=voter_id)
                                if voter not in active_members:
                                    return Response(
                                        {"status": False, "message": f"Selected voter {voter.first_name + ' ' + voter.surname} is not an active member of this circle"},
                                        status=status.HTTP_400_BAD_REQUEST,
                                    )
                                voters.append(voter)
                            except Woman.DoesNotExist:
                                return Response({"status": False, "message": f"Voter with ID {voter_id} not found"}, status=status.HTTP_404_NOT_FOUND)

                    # Create the vote
                    vote = CircleMembershipVote.create_vote(trust_circle=trust_circle, candidate_member=woman, initiating_vendor=vendor, voters=voters)

                    # Generate OTPs for all voters
                    vote.voter_one_generated_otp = generate_otp()
                    vote.voter_two_generated_otp = generate_otp()
                    vote.voter_three_generated_otp = generate_otp()
                    vote.save()

                    # Send OTPs to voters
                    send_otp_to_woman(vote.voter_one, vote.voter_one_generated_otp)
                    send_otp_to_woman(vote.voter_two, vote.voter_two_generated_otp)
                    send_otp_to_woman(vote.voter_three, vote.voter_three_generated_otp)

                    # Log activity
                    CircleActivity.create_activity(
                        trust_circle=trust_circle,
                        activity_type=TrustCircleActivityType.VOTE_INITIATED,
                        description=f"Voting initiated for woman '{woman.first_name + ' ' + woman.surname}' to join Trust Circle '{trust_circle.circle_name}'",
                        performed_by=vendor,
                        affected_woman=woman,
                        metadata={"vote_id": str(vote.id), "candidate_id": str(woman.id), "voters": [str(v.id) for v in voters]},
                        ip_address=ip_address,
                    )

                    voters_info = [{"id": voter.id, "name": voter.first_name + " " + voter.surname, "mobile_number": voter.mobile_number} for voter in voters]

                    return Response(
                        {
                            "status": True,
                            "message": "Voting process initiated. OTPs have been sent to selected voters.",
                            "action_taken": "voting_initiated",
                            "vote_id": vote.id,
                            "voting_deadline": vote.voting_deadline,
                            "voters": voters_info,
                        },
                        status=status.HTTP_200_OK,
                    )

        except ValidationError as e:
            return Response({"status": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"status": False, "message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateTrustCircleVote(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Submit or update a vote for Trust Circle membership",
        request=UpdateVoteRequestSerializer,
        responses={
            200: inline_serializer(
                name="UpdateVoteResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    vote_status=serializers.CharField(),
                    votes_received=serializers.IntegerField(),
                    total_votes_needed=serializers.IntegerField(),
                    is_complete=serializers.BooleanField(),
                    result=serializers.CharField(required=False),
                    approved_votes=serializers.IntegerField(required=False),
                    rejected_votes=serializers.IntegerField(required=False),
                ),
            ),
            400: inline_serializer(
                name="UpdateVoteErrorResponse",
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

        initiating_vendor_id = serializer.validated_data["initiating_vendor_id"]
        vote_id = serializer.validated_data["vote_id"]
        voter_position = serializer.validated_data["voter_position"]
        otp = serializer.validated_data["otp"]
        vote_choice = serializer.validated_data["vote_choice", NewMembershipVoteOption.APPROVE]

        # Get vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get vote
        try:
            vote = CircleMembershipVote.objects.get(id=vote_id, initiating_vendor=vendor)
        except CircleMembershipVote.DoesNotExist:
            return Response({"status": False, "message": "Membership Vote not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if vote is still active
        if vote.status != VoteStatus.PENDING:
            return Response({"status": False, "message": f"Vote is no longer active. Current status: {vote.status}"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if vote has expired
        if vote.is_expired:
            vote.expire_vote()
            return Response({"status": False, "message": "Voting deadline has expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate voter position
        if voter_position not in [1, 2, 3]:
            return Response({"status": False, "message": "Invalid voter position. Must be 1, 2, or 3"}, status=status.HTTP_400_BAD_REQUEST)

        ip_address = get_request_ip(request=request)

        try:
            with transaction.atomic():
                # Check if this voter has already voted
                existing_vote = None
                if voter_position == 1 and vote.voter_one_vote:
                    existing_vote = vote.voter_one_vote
                elif voter_position == 2 and vote.voter_two_vote:
                    existing_vote = vote.voter_two_vote
                elif voter_position == 3 and vote.voter_three_vote:
                    existing_vote = vote.voter_three_vote

                if existing_vote:
                    return Response({"status": False, "message": f"Voter {voter_position} has already submitted their vote"}, status=status.HTTP_400_BAD_REQUEST)

                # Submit the vote
                vote.submit_vote(voter_position, otp, vote_choice)

                # Get voter name for logging
                voter = None
                if voter_position == 1:
                    voter = vote.voter_one
                elif voter_position == 2:
                    voter = vote.voter_two
                elif voter_position == 3:
                    voter = vote.voter_three

                # Log activity
                CircleActivity.create_activity(
                    trust_circle=vote.trust_circle,
                    activity_type=TrustCircleActivityType.VOTE_SUBMITTED,
                    description=f"Vote submitted by '{voter.first_name + ' ' + voter.surname}' for candidate '{vote.candidate_member.first_name + ' ' + vote.candidate_member.surname}': {vote_choice}",
                    performed_by=vendor,
                    affected_woman=voter,
                    metadata={"vote_id": str(vote.id), "voter_position": voter_position, "vote_choice": vote_choice, "candidate_id": str(vote.candidate_member.id)},
                    ip_address=ip_address,
                )

                response_data = {
                    "status": True,
                    "message": f"Vote submitted successfully by voter {voter_position}",
                    "vote_status": vote.status,
                    "votes_received": vote.votes_received,
                    "total_votes_needed": 3,
                    "is_complete": vote.is_complete,
                }

                # If voting is complete, add result information
                if vote.is_complete:
                    response_data.update(
                        {
                            "result": vote.status,
                            "approved_votes": vote.approved_votes,
                            "rejected_votes": vote.rejected_votes,
                        }
                    )

                    # If approved, add woman to trust circle
                    if vote.status == VoteStatus.APPROVED:
                        vote.candidate_member.trust_circle = vote.trust_circle
                        vote.candidate_member.status = WomanStatus.ACTIVE
                        vote.candidate_member.save()

                        # Log member addition
                        CircleActivity.create_activity(
                            trust_circle=vote.trust_circle,
                            activity_type=TrustCircleActivityType.MEMBER_ADDED,
                            description=f"Woman '{vote.candidate_member.first_name + ' ' + vote.candidate_member.surname}' "
                            f"added to Trust Circle '{vote.trust_circle.circle_name}' after successful vote",
                            performed_by=vendor,
                            affected_woman=vote.candidate_member,
                            metadata={"vote_id": str(vote.id), "approved_votes": vote.approved_votes, "rejected_votes": vote.rejected_votes},
                            ip_address=ip_address,
                        )

                return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"status": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"status": False, "message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetVoteStatus(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Get the status of a specific membership vote",
        request=VoteStatusRequestSerializer,
        responses={
            200: inline_serializer(
                name="VoteStatusResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="VoteStatusData",
                        fields={
                            "vote_id": serializers.UUIDField(),
                            "trust_circle_name": serializers.CharField(),
                            "candidate_name": serializers.CharField(),
                            "status": serializers.CharField(),
                            "votes_received": serializers.IntegerField(),
                            "total_votes_needed": serializers.IntegerField(),
                            "is_complete": serializers.BooleanField(),
                            "is_expired": serializers.BooleanField(),
                            "voting_deadline": serializers.DateTimeField(),
                            "approved_votes": serializers.IntegerField(),
                            "rejected_votes": serializers.IntegerField(),
                            "result_message": serializers.CharField(allow_null=True),
                            "voters": serializers.ListField(
                                child=inline_serializer(
                                    name="VoterStatusInfo",
                                    fields={
                                        "position": serializers.IntegerField(),
                                        "name": serializers.CharField(),
                                        "has_voted": serializers.BooleanField(),
                                        "vote_choice": serializers.CharField(allow_null=True),
                                    },
                                )
                            ),
                        },
                    ),
                ),
            ),
        },
    )
    def post(self, request):
        initiating_vendor_id = request.data.get("initiating_vendor_id")
        vote_id = request.data.get("vote_id")

        if not initiating_vendor_id or not vote_id:
            return Response({"status": False, "message": "cba_customer_id and vote_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Initiating Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get vote
        try:
            vote = CircleMembershipVote.objects.select_related("trust_circle", "candidate_member", "voter_one", "voter_two", "voter_three").get(id=vote_id, initiating_vendor=vendor)
        except CircleMembershipVote.DoesNotExist:
            return Response({"status": False, "message": "Vote not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if vote has expired and update status
        if vote.is_expired and vote.status == VoteStatus.PENDING:
            vote.expire_vote()

        voters_info = [
            {
                "position": 1,
                "name": vote.voter_one.first_name + " " + vote.voter_one.surname,
                "has_voted": bool(vote.voter_one_vote),
                "vote_choice": vote.voter_one_vote,
            },
            {
                "position": 2,
                "name": vote.voter_two.first_name + " " + vote.voter_two.surname,
                "has_voted": bool(vote.voter_two_vote),
                "vote_choice": vote.voter_two_vote,
            },
            {
                "position": 3,
                "name": vote.voter_three.first_name + " " + vote.voter_three.surname,
                "has_voted": bool(vote.voter_three_vote),
                "vote_choice": vote.voter_three_vote,
            },
        ]

        return Response(
            {
                "status": True,
                "message": "Vote status retrieved successfully",
                "data": {
                    "vote_id": vote.id,
                    "trust_circle_name": vote.trust_circle.circle_name,
                    "candidate_name": vote.candidate_member.first_name + " " + vote.candidate_member.surname,
                    "status": vote.status,
                    "votes_received": vote.votes_received,
                    "total_votes_needed": 3,
                    "is_complete": vote.is_complete,
                    "is_expired": vote.is_expired,
                    "voting_deadline": vote.voting_deadline,
                    "approved_votes": vote.approved_votes,
                    "rejected_votes": vote.rejected_votes,
                    "result_message": vote.result_message,
                    "voters": voters_info,
                },
            },
            status=status.HTTP_200_OK,
        )


class GetPendingInitiatedVotes(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Get all pending votes for an initiating vendor's trust circles",
        request=PendingVotesRequestSerializer,
        responses={
            200: inline_serializer(
                name="PendingVotesResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="PendingVotesData",
                        fields={
                            "pending_initiated_votes": serializers.ListField(
                                child=inline_serializer(
                                    name="PendingVoteItem",
                                    fields={
                                        "vote_id": serializers.UUIDField(),
                                        "trust_circle_name": serializers.CharField(),
                                        "candidate_name": serializers.CharField(),
                                        "votes_received": serializers.IntegerField(),
                                        "voting_deadline": serializers.DateTimeField(),
                                        "time_remaining_hours": serializers.FloatField(),
                                        "is_expired": serializers.BooleanField(),
                                        "created_at": serializers.DateTimeField(),
                                    },
                                )
                            ),
                            "total_count": serializers.IntegerField(),
                        },
                    ),
                ),
            ),
        },
    )
    def post(self, request):
        initiating_vendor_id = request.data.get("initiating_vendor_id")
        trust_circle_id = request.data.get("trust_circle_id")

        if not initiating_vendor_id:
            return Response({"status": False, "message": "initiating_vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Initiating Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Build query
        queryset = CircleMembershipVote.objects.filter(initiating_vendor=vendor, status=VoteStatus.PENDING).select_related("trust_circle", "candidate_member")

        if trust_circle_id:
            queryset = queryset.filter(trust_circle_id=trust_circle_id)

        votes = queryset.order_by("voting_deadline")

        pending_votes_data = []
        now = timezone.now()

        for vote in votes:
            # Check if expired and update
            if vote.is_expired:
                vote.expire_vote()
                continue  # Skip expired votes

            time_remaining = vote.voting_deadline - now
            time_remaining_hours = time_remaining.total_seconds() / 3600

            pending_votes_data.append(
                {
                    "vote_id": vote.id,
                    "trust_circle_name": vote.trust_circle.circle_name,
                    "candidate_name": vote.candidate_member.first_name + " " + vote.candidate_member.surname,
                    "votes_received": vote.votes_received,
                    "voting_deadline": vote.voting_deadline,
                    "time_remaining_hours": max(0, time_remaining_hours),
                    "is_expired": vote.is_expired,
                    "created_at": vote.created_at,
                }
            )

        return Response(
            {
                "status": True,
                "message": "Pending Initiated votes retrieved successfully",
                "data": {
                    "pending_initiated_votes": pending_votes_data,
                    "total_count": len(pending_votes_data),
                },
            },
            status=status.HTTP_200_OK,
        )


class GetExpiredInitiatedVotes(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Get all expired votes for an initiating vendor's trust circles",
        request=ExpiredVotesRequestSerializer,
        responses={
            200: inline_serializer(
                name="ExpiredVotesResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    data=inline_serializer(
                        name="ExpiredVotesData",
                        fields={
                            "expired_initiated_votes": serializers.ListField(
                                child=inline_serializer(
                                    name="ExpiredVoteItem",
                                    fields={
                                        "vote_id": serializers.UUIDField(),
                                        "trust_circle_name": serializers.CharField(),
                                        "candidate_name": serializers.CharField(),
                                        "votes_received": serializers.IntegerField(),
                                        "voting_deadline": serializers.DateTimeField(),
                                        "is_expired": serializers.BooleanField(),
                                        "created_at": serializers.DateTimeField(),
                                    },
                                )
                            ),
                            "total_count": serializers.IntegerField(),
                        },
                    ),
                ),
            ),
        },
    )
    def post(self, request):
        initiating_vendor_id = request.data.get("initiating_vendor_id")
        trust_circle_id = request.data.get("trust_circle_id")

        if not initiating_vendor_id:
            return Response({"status": False, "message": "initiating_vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Initiating Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Build query
        queryset = CircleMembershipVote.objects.filter(initiating_vendor=vendor, status=VoteStatus.EXPIRED).select_related("trust_circle", "candidate_member")

        if trust_circle_id:
            queryset = queryset.filter(trust_circle_id=trust_circle_id)

        votes = queryset.order_by("created_at")

        expired_votes_data = []

        for vote in votes:
            expired_votes_data.append(
                {
                    "vote_id": vote.id,
                    "trust_circle_name": vote.trust_circle.circle_name,
                    "candidate_name": vote.candidate_member.first_name + " " + vote.candidate_member.surname,
                    "votes_received": vote.votes_received,
                    "voting_deadline": vote.voting_deadline,
                    "is_expired": vote.is_expired,
                    "created_at": vote.created_at,
                }
            )

        return Response(
            {
                "status": True,
                "message": "Expired Initiated votes retrieved successfully",
                "data": {
                    "expired_initiated_votes": expired_votes_data,
                    "total_count": len(expired_votes_data),
                },
            },
            status=status.HTTP_200_OK,
        )


class ResendVoterOTP(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        description="Resend OTP to a specific voter",
        request=ResendOtpRequestSerializer,
        responses={
            200: inline_serializer(
                name="ResendOTPResponse",
                fields=dict(
                    status=serializers.BooleanField(),
                    message=serializers.CharField(),
                    voter_name=serializers.CharField(),
                    phone_number=serializers.CharField(),
                ),
            ),
        },
    )
    def post(self, request):
        serializer = ResendOtpRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        initiating_vendor_id = request.data.get("initiating_vendor_id")
        vote_id = request.data.get("vote_id")
        voter_position = request.data.get("voter_position")

        if voter_position not in [1, 2, 3]:
            return Response({"status": False, "message": "voter_position must be 1, 2, or 3"}, status=status.HTTP_400_BAD_REQUEST)

        # Get vendor
        vendor = Vendor.get_vendor(id=initiating_vendor_id)
        if not vendor:
            return Response({"status": False, "message": "Initiating Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get vote
        try:
            vote = CircleMembershipVote.objects.select_related("voter_one", "voter_two", "voter_three").get(id=vote_id, initiating_vendor=vendor)
        except CircleMembershipVote.DoesNotExist:
            return Response({"status": False, "message": "Vote not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if vote is still active
        if vote.status != VoteStatus.PENDING:
            return Response({"status": False, "message": f"Vote is no longer active. Current status: {vote.status}"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if vote has expired
        if vote.is_expired:
            vote.expire_vote()
            return Response({"status": False, "message": "Voting deadline has expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Get voter and check if they've already voted
        voter = None
        has_voted = False

        if voter_position == 1:
            voter = vote.voter_one
            has_voted = bool(vote.voter_one_vote)
        elif voter_position == 2:
            voter = vote.voter_two
            has_voted = bool(vote.voter_two_vote)
        elif voter_position == 3:
            voter = vote.voter_three
            has_voted = bool(vote.voter_three_vote)

        if has_voted:
            return Response({"status": False, "message": f"Voter {voter_position} has already submitted their vote"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new OTP and resend
        new_otp = generate_otp()

        if voter_position == 1:
            vote.voter_one_generated_otp = new_otp
        elif voter_position == 2:
            vote.voter_two_generated_otp = new_otp
        elif voter_position == 3:
            vote.voter_three_generated_otp = new_otp

        vote.save()

        # Send new OTP
        send_otp_to_woman(voter, new_otp)

        ip_address = get_request_ip(request=request)

        # Log activity
        CircleActivity.create_activity(
            trust_circle=vote.trust_circle,
            activity_type=TrustCircleActivityType.OTP_RESENT,
            description=f"OTP resent to voter '{voter.name}' (position {voter_position}) for vote {vote.id}",
            performed_by=vendor,
            affected_woman=voter,
            metadata={
                "vote_id": str(vote.id),
                "voter_position": voter_position,
            },
            ip_address=ip_address,
        )

        return Response(
            {
                "status": True,
                "message": f"OTP has been resent to voter {voter_position}",
                "voter_name": voter.first_name + " " + voter.surname,
                "phone_number": voter.mobile_number,
            },
            status=status.HTTP_200_OK,
        )
