from rest_framework import viewsets, permissions
from .models import Provinces, Districts, Wards
from .serializers import ProvincesSerializer, DistrictsSerializer, WardsSerializer

class ProvincesViewSet(viewsets.ModelViewSet):
    """API endpoint for Provinces"""
    queryset = Provinces.objects.all()
    serializer_class = ProvincesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class DistrictsViewSet(viewsets.ModelViewSet):
    """API endpoint for Districts"""
    queryset = Districts.objects.all()
    serializer_class = DistrictsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class WardsViewSet(viewsets.ModelViewSet):
    """API endpoint for Wards"""
    queryset = Wards.objects.all()
    serializer_class = WardsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
