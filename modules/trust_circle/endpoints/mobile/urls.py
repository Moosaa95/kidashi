from django.urls import path
from modules.trust_circle.endpoints.mobile.endpoints import (
    CreateTrustCircle,
    GetTrustCircle,
    FetchTrustCircles,
    ProposeWomanToTrustCircle,
    UpdateTrustCircleVote,
    GetVoteStatus,
    GetPendingInitiatedVotes,
    ResendVoterOTP,
)

urlpatterns = (
    path("create", CreateTrustCircle.as_view(), name="create_trust_circle"),
    path("get", GetTrustCircle.as_view(), name="get_trust_circle"),
    path("fetch", FetchTrustCircles.as_view(), name="fetch_trust_circles"),
    path("propose-member", ProposeWomanToTrustCircle.as_view(), name="propose_woman_to_trust_circles"),
    path("vote/update", UpdateTrustCircleVote.as_view(), name="update_trust_circle_vote"),
    path("vote/status", GetVoteStatus.as_view(), name="vote_status"),
    path("vote/pending", GetPendingInitiatedVotes.as_view(), name="pending_votes"),
    path("vote/resend-otp", ResendVoterOTP.as_view(), name="resend_otp"),
)
