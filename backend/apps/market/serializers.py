from rest_framework import serializers
from .models import PriceSources, MarketPrices, DemandForecasts, PlantingRecommendations

class PriceSourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceSources
        fields = '__all__'


class MarketPricesSerializer(serializers.ModelSerializer):
    crop_details = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketPrices
        fields = '__all__'
    
    def get_crop_details(self, obj):
        if obj.crop:
            return {
                'id': obj.crop.id,
                'code': obj.crop.code,
                'name': obj.crop.name,
            }
        return None


class DemandForecastsSerializer(serializers.ModelSerializer):
    crop_details = serializers.SerializerMethodField()
    
    class Meta:
        model = DemandForecasts
        fields = '__all__'
    
    def get_crop_details(self, obj):
        if obj.crop:
            return {
                'id': obj.crop.id,
                'code': obj.crop.code,
                'name': obj.crop.name,
            }
        return None


class PlantingRecommendationsSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    crop_details = serializers.SerializerMethodField()
    cooperative_details = serializers.SerializerMethodField()
    
    class Meta:
        model = PlantingRecommendations
        fields = '__all__'
    
    def get_crop_details(self, obj):
        if obj.crop:
            return {
                'id': obj.crop.id,
                'code': obj.crop.code,
                'name': obj.crop.name,
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
