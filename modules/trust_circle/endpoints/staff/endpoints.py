from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from modules.trust_circle.models import TrustCircle
from modules.trust_circle.serializers import (
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

        return Response({"status": True, "count": len(data), "data": data}, status=status.HTTP_200_OK)
