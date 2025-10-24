from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.trust_circle.models import TrustCircle
from modules.trust_circle.serializers import (
    FetchTrustCircleFilterSerializer,
    FetchTrustCircleWithFilterRequestSerializer,
)


class FetchTrustCirclesWithFilter(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        summary="Fetch Trust Circles with Filters",
        request=FetchTrustCircleWithFilterRequestSerializer,
    )
    def post(self, request):
        serializer = FetchTrustCircleWithFilterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        filters = validated.get("filters", {})
        count = validated.get("count")
        include_summary = validated.get("include_summary", False)

        and_condition = Q()

        # Extract date-related filters
        date = filters.pop("date", None)
        start_date = filters.pop("start_date", None)
        end_date = filters.pop("end_date", None)

        if date:
            and_condition &= Q(created_at__date=date)
        if start_date and end_date:
            and_condition &= Q(created_at__date__range=[start_date, end_date])
        elif start_date:
            and_condition &= Q(created_at__date__gte=start_date)
        elif end_date:
            and_condition &= Q(created_at__date__lte=end_date)

        # If no filters provided at all and no date, return all
        if not filters and and_condition == Q():
            data = TrustCircle.fetch_trust_circles_with_filter(count=count)
        else:
            # Apply remaining filters
            for key, value in filters.items():
                and_condition &= Q(**{key: value})

            data = TrustCircle.fetch_trust_circles_with_filter(conditions=and_condition, count=count)

        response_data = {"status": True, "data": data}

        if include_summary:
            summary = TrustCircle.get_trust_circle_metrics(conditions=and_condition if and_condition != Q() else None)
            response_data["summary"] = summary

        return Response(response_data, status=status.HTTP_200_OK)


class GetTrustCircleDetail(APIView):
    @extend_schema(
        tags=["Trust Circle"],
        summary="Get Trust Circle Details",
        request=FetchTrustCircleFilterSerializer,
        responses={
            200: "Trust Circle details fetched successfully",
            404: "Trust Circle not found",
        },
    )
    def post(self, request):
        serializer = FetchTrustCircleFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        include_summary = serializer.validated_data.get("include_summary", True)
        validated_filter = serializer.validated_data.get("filters", {})
        trust_circle_id = validated_filter.get("id")
        trust_circle = TrustCircle.get_trust_circle(id=trust_circle_id, values=True)

        if not trust_circle:
            return Response(data=dict(status=False, message="Trust Circle not found"), status=status.HTTP_404_NOT_FOUND)

        print("SUMMARY:", include_summary)
        if include_summary:
            summary = TrustCircle.get_trust_circle_metrics(conditions=Q(id=trust_circle_id))
            trust_circle["summary"] = summary
        return Response(
            data=dict(status=True, message="Trust Circle details fetched successfully", data=trust_circle),
            status=status.HTTP_200_OK,
        )
