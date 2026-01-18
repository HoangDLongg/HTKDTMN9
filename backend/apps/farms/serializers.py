from rest_framework import serializers
from .models import Cooperatives, Farmers, Farms

class CooperativesSerializer(serializers.ModelSerializer):
    manager_details = serializers.SerializerMethodField()
    ward_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Cooperatives
        fields = '__all__'
    
    def get_manager_details(self, obj):
        if obj.manager:
            return {
                'id': obj.manager.id,
                'username': obj.manager.username,
                'full_name': obj.manager.full_name,
                'email': obj.manager.email,
            }
        return None
    
    def get_ward_details(self, obj):
        if obj.ward:
            return {
                'id': obj.ward.id,
                'name': obj.ward.name,
                'district': {
                    'name': obj.ward.district.name,
                    'province': {
                        'name': obj.ward.district.province.name
                    }
                } if obj.ward.district else None
            }
        return None


class FarmersSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    cooperative_details = serializers.SerializerMethodField()
    ward_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Farmers
        fields = '__all__'
    
    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'full_name': obj.user.full_name,
                'phone': obj.user.phone,
            }
        return None
    
    def get_cooperative_details(self, obj):
        if obj.cooperative:
            return {
                'id': obj.cooperative.id,
                'code': obj.cooperative.code,
                'name': obj.cooperative.name,
            }
        return None
    
    def get_ward_details(self, obj):
        if obj.ward:
            return {
                'id': obj.ward.id,
                'name': obj.ward.name,
                'district': {
                    'name': obj.ward.district.name,
                    'province': {
                        'name': obj.ward.district.province.name
                    }
                } if obj.ward.district else None
            }
        return None


class FarmsSerializer(serializers.ModelSerializer):
    ward_details = serializers.SerializerMethodField()
    farmer_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Farms
        fields = '__all__'
    
    def get_ward_details(self, obj):
        if obj.ward:
            return {
                'id': obj.ward.id,
                'code': obj.ward.code,
                'name': obj.ward.name,
                'district': {
                    'name': obj.ward.district.name,
                } if obj.ward.district else None
            }
        return None
    
    def get_farmer_details(self, obj):
        if obj.farmer:
            return {
                'id': obj.farmer.id,
                'farmer_code': obj.farmer.farmer_code,
                'user': {
                    'full_name': obj.farmer.user.full_name if obj.farmer.user else None
                } if obj.farmer.user else None
            }
        return None
