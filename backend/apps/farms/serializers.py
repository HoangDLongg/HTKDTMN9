from rest_framework import serializers
from .models import Cooperatives, Farmers, Farms

class CooperativesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cooperatives
        fields = '__all__'


class FarmersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmers
        fields = '__all__'


class FarmsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farms
        fields = '__all__'
