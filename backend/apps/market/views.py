from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from .models import PriceSources, MarketPrices, DemandForecasts, PlantingRecommendations
from .serializers import PriceSourcesSerializer, MarketPricesSerializer, DemandForecastsSerializer, PlantingRecommendationsSerializer
from .services import MarketPriceService


class PriceSourcesViewSet(viewsets.ModelViewSet):
    """API endpoint for PriceSources"""
    queryset = PriceSources.objects.all()
    serializer_class = PriceSourcesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class MarketPricesViewSet(viewsets.ModelViewSet):
    """API endpoint for MarketPrices with analysis"""
    queryset = MarketPrices.objects.all()
    serializer_class = MarketPricesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def current_price(self, request):
        """
        Get current price for a crop
        
        GET /api/market-prices/current_price/?crop_id=1&market_location=Chợ Bình Điền
        """
        crop_id = request.query_params.get('crop_id')
        market_location = request.query_params.get('market_location')
        
        if not crop_id:
            return Response({'error': 'crop_id is required'}, status=400)
        
        price = MarketPriceService.get_current_price(crop_id, market_location)
        
        if price:
            serializer = self.get_serializer(price)
            return Response(serializer.data)
        return Response({'message': 'No price data found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def trend(self, request):
        """
        Get price trend for a crop
        
        GET /api/market-prices/trend/?crop_id=1&days=30&market_location=Chợ Bình Điền
        """
        crop_id = request.query_params.get('crop_id')
        days = int(request.query_params.get('days', 30))
        market_location = request.query_params.get('market_location')
        
        if not crop_id:
            return Response({'error': 'crop_id is required'}, status=400)
        
        trend_data = MarketPriceService.get_price_trend(crop_id, days, market_location)
        
        if trend_data:
            return Response(trend_data)
        return Response({'message': 'No price data found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def compare_markets(self, request):
        """
        Compare prices across markets
        
        GET /api/market-prices/compare_markets/?crop_id=1&date=2026-01-12
        """
        crop_id = request.query_params.get('crop_id')
        date_str = request.query_params.get('date')
        
        if not crop_id:
            return Response({'error': 'crop_id is required'}, status=400)
        
        date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
        
        comparison = MarketPriceService.compare_market_prices(crop_id, date)
        return Response(comparison)


class DemandForecastsViewSet(viewsets.ModelViewSet):
    """API endpoint for DemandForecasts"""
    queryset = DemandForecasts.objects.all()
    serializer_class = DemandForecastsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def get_forecast(self, request):
        """
        Get forecast for a crop
        
        GET /api/demand-forecasts/get_forecast/?crop_id=1&months=3
        """
        crop_id = request.query_params.get('crop_id')
        months = int(request.query_params.get('months', 3))
        
        if not crop_id:
            return Response({'error': 'crop_id is required'}, status=400)
        
        forecasts = MarketPriceService.get_forecast(crop_id, months)
        return Response(forecasts)


class PlantingRecommendationsViewSet(viewsets.ModelViewSet):
    """API endpoint for PlantingRecommendations"""
    queryset = PlantingRecommendations.objects.all()
    serializer_class = PlantingRecommendationsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def best_selling_time(self, request):
        """
        Get best time to sell recommendation
        
        GET /api/planting-recommendations/best_selling_time/?crop_id=1&harvest_date=2026-05-01
        """
        crop_id = request.query_params.get('crop_id')
        harvest_date_str = request.query_params.get('harvest_date')
        
        if not crop_id or not harvest_date_str:
            return Response({'error': 'crop_id and harvest_date are required'}, status=400)
        
        harvest_date = datetime.strptime(harvest_date_str, '%Y-%m-%d').date()
        
        recommendation = MarketPriceService.get_best_selling_time(crop_id, harvest_date)
        return Response(recommendation)
    
    @action(detail=False, methods=['get'])
    def for_location(self, request):
        """
        Get crop recommendations based on location
        
        GET /api/planting-recommendations/for_location/?farmer_id=1
        GET /api/planting-recommendations/for_location/?province_id=1
        GET /api/planting-recommendations/for_location/?province_id=1&district_id=5
        """
        from .crop_recommender import CropRecommendationService
        
        farmer_id = request.query_params.get('farmer_id')
        
        if farmer_id:
            # Auto-detect location from farmer's farm
            result = CropRecommendationService.get_recommendations_for_farmer(farmer_id)
            return Response(result)
        else:
            # Use explicit location
            province_id = request.query_params.get('province_id')
            district_id = request.query_params.get('district_id')
            
            if not province_id:
                return Response({'error': 'farmer_id or province_id is required'}, status=400)
            
            recommendations = CropRecommendationService.get_recommendations_by_location(
                province_id=province_id,
                district_id=district_id
            )
            
            return Response({'recommendations': recommendations})
