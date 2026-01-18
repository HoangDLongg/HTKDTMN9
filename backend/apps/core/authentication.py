"""
Custom authentication backend for JWT tokens with custom Users model
"""
from django.contrib.auth.backends import BaseBackend
from apps.core.models import Users
from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWTAuthentication


class CustomUserBackend(BaseBackend):
    """
    Custom authentication backend for our Users model
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authenticate against our custom Users table"""
        try:
            user = Users.objects.get(username=username)
            if user.check_password(password) and user.is_active:
                return user
        except Users.DoesNotExist:
            return None
        return None

    def get_user(self, user_id):
        """Get user by ID"""
        try:
            return Users.objects.get(pk=user_id)
        except Users.DoesNotExist:
            return None


class CustomJWTAuthentication(BaseJWTAuthentication):
    """
    Custom JWT authentication that uses our custom Users model
    """
    def get_user(self, validated_token):
        """
        Returns a User object from a validated token.
        """
        try:
            user_id = validated_token.get('user_id')
            user = Users.objects.select_related('role').get(id=user_id)
            return user
        except Users.DoesNotExist:
            return None
