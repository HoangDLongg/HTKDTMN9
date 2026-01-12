from rest_framework import serializers
from .models import Roles, Users


class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'role_name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {'password_hash': {'write_only': True}}


class UsersCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users with password"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Users
        fields = ['username', 'email', 'password', 'full_name', 'phone', 'role']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Users(**validated_data)
        user.password_hash = password  # Should use proper password hashing
        user.save()
        return user
