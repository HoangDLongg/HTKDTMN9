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
        # If authenticated via CustomToken, request.user might be an object or dict.
        # We need to handle it.
        user = request.user
        if isinstance(user, Users):
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        # Fallback if request.user is not our model (shouldn't happen if using custom auth, but let's be safe)
        try:
            user_obj = Users.objects.get(username=request.user.username)
            serializer = self.get_serializer(user_obj)
            return Response(serializer.data)
        except:
            return Response({"error": "User not found"}, status=404)


from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password

class CustomTokenObtainPairView(APIView):
    """
    Custom view to authenticate against apps.core.models.Users
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Find user in our custom table
            user = Users.objects.select_related('role').get(username=username)
            
            # Check password (now using PBKDF2 after reset)
            if check_password(password, user.password_hash):
                if not user.is_active:
                    return Response({'detail': 'User account is disabled.'}, status=status.HTTP_401_UNAUTHORIZED)
                
                # Get farmer_id if user is a farmer
                farmer_id = None
                try:
                    from apps.farms.models import Farmers
                    farmer = Farmers.objects.get(user=user)
                    farmer_id = farmer.id
                    print(f"✅ Found farmer_id: {farmer_id} for user: {user.username}")
                except Farmers.DoesNotExist:
                    print(f"⚠️ No Farmer record found for user: {user.username} (role: {user.role.name if user.role else 'None'})")
                except Exception as e:
                    print(f"❌ Error getting farmer_id: {e}")
                
                # Generate Token manually
                # RefreshToken expects an object with 'pk'
                refresh = RefreshToken.for_user(user)
                
                response_data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'role': user.role.name if user.role else None,
                    'user_id': user.id
                }
                
                # Add farmer_id if exists
                if farmer_id:
                    response_data['farmer_id'] = farmer_id
                    print(f"📤 Sending farmer_id in response: {farmer_id}")
                else:
                    print(f"⚠️ No farmer_id to send in response")
                
                return Response(response_data)
            else:
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        except Users.DoesNotExist:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
