from rest_framework import viewsets, permissions
from .models import Cooperatives, Farmers, Farms
from .serializers import CooperativesSerializer, FarmersSerializer, FarmsSerializer

class CooperativesViewSet(viewsets.ModelViewSet):
    """API endpoint for Cooperatives"""
    queryset = Cooperatives.objects.all()
    serializer_class = CooperativesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FarmersViewSet(viewsets.ModelViewSet):
    """API endpoint for Farmers"""
    queryset = Farmers.objects.all()
    serializer_class = FarmersSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FarmsViewSet(viewsets.ModelViewSet):
    """API endpoint for Farms"""
    queryset = Farms.objects.all()
    serializer_class = FarmsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
