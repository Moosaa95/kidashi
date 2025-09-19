from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.trust_circle.models import TrustCircle
from modules.trust_circle.serializers import (
    FetchTrustCircleFilterSerializer,
    TrustCircleSerializer,
)


class FetchTrustCirclesFilter(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        summary="Fetch Trust Circles with Filters",
        request=FetchTrustCircleFilterSerializer,
    )
    def post(self, request):
        serializer = FetchTrustCircleFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        and_condition = Q()

        filters = serializer.validated_data.get("filters", {})
        if not filters:
            data = TrustCircle.fetch_trust_circles()
            return Response({"status": True, "data": data}, status=status.HTTP_200_OK)

        date = filters.pop("date", None)
        start_date = filters.pop("start_date", None)
        end_date = filters.pop("end_date", None)

        # Date filters
        if date:
            and_condition.add(Q(created_at__startswith=date), Q.AND)
        if start_date and end_date:
            and_condition.add(Q(created_at__range=[start_date, end_date]), Q.AND)

        # Remaining filters
        for key, value in filters.items():
            and_condition.add(Q(**{key: value}), Q.AND)

        data = TrustCircle.fetch_trust_circles(conditions=and_condition)
        return Response({"status": True, "data": data}, status=status.HTTP_200_OK)


class GetTrustCircleDetail(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        summary="Get Trust Circle Detail",
        request=TrustCircleSerializer,
    )
    def post(self, request):
        response_dict = dict(status=False)
        serializer = TrustCircleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        circle_id = serializer.validated_data.get("trust_circle_id")

        circle = TrustCircle.get_trust_circle(id=circle_id)
        if not circle:
            response_dict.update(message="Trust circle not found")
            return Response(response_dict, status=status.HTTP_404_NOT_FOUND)

        response_dict.update(status=True, data=circle)
        return Response(response_dict, status=status.HTTP_200_OK)
