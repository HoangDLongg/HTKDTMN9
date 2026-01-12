from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Roles, Users
from .serializers import RolesSerializer, UsersSerializer, UsersCreateSerializer


class RolesViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing roles
    """
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name', 'created_at']


class UsersViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users
    """
    queryset = Users.objects.select_related('role').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'full_name']
    ordering_fields = ['id', 'username', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UsersCreateSerializer
        return UsersSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
