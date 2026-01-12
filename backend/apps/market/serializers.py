from rest_framework import serializers
from .models import PriceSources, MarketPrices, DemandForecasts, PlantingRecommendations

class PriceSourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceSources
        fields = '__all__'


class MarketPricesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPrices
        fields = '__all__'


class DemandForecastsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandForecasts
        fields = '__all__'


class PlantingRecommendationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantingRecommendations
        fields = '__all__'
