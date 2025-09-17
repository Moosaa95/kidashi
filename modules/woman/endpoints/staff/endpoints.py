from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from modules.woman.models import Woman
from modules.woman.serializers import FetchWomenFilterSerializer, WomanSerializer


class FetchWomanFilter(APIView):
    @extend_schema(
        tags=["Women"],
        summary="Fetch Women with Filters",
        request=FetchWomenFilterSerializer,
        responses={
            200: WomanSerializer(many=True),
            400: "Bad Request",
        },
    )
    def post(self, request):
        serializer = FetchWomenFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        condition = Q()
        for key, value in validated_data.items():
            condition.add(Q(**{key: value}), Q.AND)

        women = Woman.fetch_women(conditions=condition)

        return Response(data=dict(status=True, message="Women fetched successfully", data=women), status=status.HTTP_200_OK)


class GetWomanDetail(APIView):
    @extend_schema(
        tags=["Women"],
        summary="Get Woman Details",
        responses={
            200: WomanSerializer,
            404: "Not Found",
        },
    )
    def post(self, request):
        serializer = WomanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        woman_id = serializer.validated_data.get("woman_id")
        woman = Woman.get_woman(id=woman_id)
        if not woman:
            return Response(data=dict(status=False, message="Woman not found"), status=status.HTTP_404_NOT_FOUND)

        return Response(data=dict(status=True, message="Woman fetched successfully", data=woman), status=status.HTTP_200_OK)
