from rest_framework import viewsets, permissions
from .models import Cooperatives, Farmers, Farms
from .serializers import CooperativesSerializer, FarmersSerializer, FarmsSerializer

class CooperativesViewSet(viewsets.ModelViewSet):
    """API endpoint for Cooperatives"""
    queryset = Cooperatives.objects.select_related('manager', 'ward__district__province').all()
    serializer_class = CooperativesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FarmersViewSet(viewsets.ModelViewSet):
    """API endpoint for Farmers"""
    queryset = Farmers.objects.select_related(
        'user', 
        'cooperative', 
        'ward__district__province'
    ).all()
    serializer_class = FarmersSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class FarmsViewSet(viewsets.ModelViewSet):
    """API endpoint for Farms - filtered by current user's farmer"""
    serializer_class = FarmsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """
        Return farms based on user role:
        - Farmer: only their own farms
        - HTX/Admin: all farms (or farms in their cooperative)
        Optimized with select_related for better performance
        """
        user = self.request.user
        
        # If not authenticated, return empty queryset
        if not user.is_authenticated:
            return Farms.objects.none()
        
        # Base queryset with optimized loading
        queryset = Farms.objects.select_related(
            'farmer__user',
            'farmer__cooperative',
            'ward__district__province'
        )
        
        # Check role - Admin or HTX Manager can see all
        if user.role and user.role.name in ['Admin', 'HTX Manager', 'admin', 'cooperative_manager']:
            return queryset.all()
        
        # Farmer role - only their own farms
        try:
            return queryset.filter(farmer__user=user)
        except Exception as e:
            print(f"Error filtering farms: {e}")
            return Farms.objects.none()
