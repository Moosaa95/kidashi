from django.urls import path
from modules.trust_circle.endpoints.mobile.endpoints import (
    CreateTrustCircle,
    GetTrustCircle,
    FetchTrustCircles,
    ProposeWomanToTrustCircle,
    ValidateVote,
    RemoveVoter,
    AddVoter,
    FetchVotes,
)

urlpatterns = (
    path("create", CreateTrustCircle.as_view(), name="create_trust_circle"),
    path("get", GetTrustCircle.as_view(), name="get_trust_circle"),
    path("fetch", FetchTrustCircles.as_view(), name="fetch_trust_circles"),
    path("propose-member", ProposeWomanToTrustCircle.as_view(), name="propose_woman_to_trust_circles"),
    path("vote/validate", ValidateVote.as_view(), name="validate_vote"),
    path("vote/remove", RemoveVoter.as_view(), name="remove_voter"),
    path("vote/add", AddVoter.as_view(), name="add_voter"),
    path("vote/fetch", FetchVotes.as_view(), name="fetch_votes"),
)