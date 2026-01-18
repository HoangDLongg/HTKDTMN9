from rest_framework import serializers
from .models import Roles, Users


class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'role_name', 'is_active', 'created_at', 'updated_at', 'password']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {'password_hash': {'write_only': True}}

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.password_hash = make_password(password)
        
        instance.save()
        return instance


from django.contrib.auth.hashers import make_password

class UsersCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users with password"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Users
        fields = ['username', 'email', 'password', 'full_name', 'phone', 'role']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Users(**validated_data)
        user.password_hash = make_password(password)  # Proper password hashing
        user.save()
        return user
