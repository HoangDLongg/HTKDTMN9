"""
Business logic services for market price analysis
"""
from datetime import datetime, timedelta
from django.db.models import Avg, Max, Min, Q
from apps.market.models import MarketPrices, DemandForecasts


class MarketPriceService:
    """Service for market price queries and analysis"""
    
    @staticmethod
    def get_current_price(crop_id, market_location=None):
        """
        Get most recent price for a crop
        
        Args:
            crop_id: Crop ID
            market_location: Optional market location filter
            
        Returns:
            Latest MarketPrice instance or None
        """
        query = MarketPrices.objects.filter(crop_id=crop_id)
        
        if market_location:
            query = query.filter(market_location=market_location)
        
        return query.order_by('-price_date').first()
    
    @staticmethod
    def get_price_trend(crop_id, days=30, market_location=None):
        """
        Get price trend for a crop over specified days
        
        Args:
            crop_id: Crop ID
            days: Number of days to look back
            market_location: Optional market location filter
            
        Returns:
            dict with trend data
        """
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        query = MarketPrices.objects.filter(
            crop_id=crop_id,
            price_date__gte=start_date,
            price_date__lte=end_date
        )
        
        if market_location:
            query = query.filter(market_location=market_location)
        
        prices = query.order_by('price_date')
        
        if not prices.exists():
            return None
        
        # Calculate statistics
        stats = prices.aggregate(
            avg_price=Avg('price_avg'),
            min_price=Min('price_min'),
            max_price=Max('price_max')
        )
        
        # Calculate trend (simple: compare first week vs last week)
        first_week = prices.filter(price_date__lt=start_date + timedelta(days=7))
        last_week = prices.filter(price_date__gte=end_date - timedelta(days=7))
        
        first_week_avg = first_week.aggregate(avg=Avg('price_avg'))['avg'] or 0
        last_week_avg = last_week.aggregate(avg=Avg('price_avg'))['avg'] or 0
        
        trend = 'stable'
        if last_week_avg > first_week_avg * 1.1:
            trend = 'increasing'
        elif last_week_avg < first_week_avg * 0.9:
            trend = 'decreasing'
        
        return {
            'crop_id': crop_id,
            'period_days': days,
            'data_points': prices.count(),
            'average_price': round(stats['avg_price'], 2) if stats['avg_price'] else 0,
            'min_price': round(stats['min_price'], 2) if stats['min_price'] else 0,
            'max_price': round(stats['max_price'], 2) if stats['max_price'] else 0,
            'trend': trend,
            'price_change_percent': round(((last_week_avg - first_week_avg) / first_week_avg * 100), 2) if first_week_avg > 0 else 0,
        }
    
    @staticmethod
    def compare_market_prices(crop_id, date=None):
        """
        Compare prices across different markets for a crop
        
        Args:
            crop_id: Crop ID
            date: Specific date (default: latest)
            
        Returns:
            list of prices by market location
        """
        if date is None:
            # Get latest date with data
            latest_price = MarketPrices.objects.filter(crop_id=crop_id).order_by('-price_date').first()
            if not latest_price:
                return []
            date = latest_price.price_date
        
        prices = MarketPrices.objects.filter(
            crop_id=crop_id,
            price_date=date
        ).order_by('market_location')
        
        return [
            {
                'market_location': p.market_location,
                'price_min': p.price_min,
                'price_max': p.price_max,
                'price_avg': p.price_avg,
                'source': p.source.name if p.source else None,
            }
            for p in prices
        ]
    
    @staticmethod
    def get_forecast(crop_id, months_ahead=3):
        """
        Get demand forecast for a crop
        
        Args:
            crop_id: Crop ID
            months_ahead: Number of months to forecast
            
        Returns:
            list of forecast data
        """
        today = datetime.now().date()
        
        forecasts = DemandForecasts.objects.filter(
            crop_id=crop_id,
            forecast_for_month__gte=today,
            forecast_for_month__lte=today + timedelta(days=months_ahead * 30)
        ).order_by('forecast_for_month')
        
        return [
            {
                'forecast_month': f.forecast_for_month,
                'predicted_demand': f.predicted_demand,
                'predicted_price': f.predicted_price,
                'confidence_score': f.confidence_score,
                'forecast_date': f.forecast_date,
            }
            for f in forecasts
        ]
    
    @staticmethod
    def get_best_selling_time(crop_id, harvest_date):
        """
        Recommend best time to sell based on price trends and forecasts
        
        Args:
            crop_id: Crop ID
            harvest_date: Expected harvest date
            
        Returns:
            dict with recommendation
        """
        # Get forecasts for next 3 months after harvest
        forecasts = DemandForecasts.objects.filter(
            crop_id=crop_id,
            forecast_for_month__gte=harvest_date,
            forecast_for_month__lte=harvest_date + timedelta(days=90)
        ).order_by('forecast_for_month')
        
        if not forecasts.exists():
            return {
                'recommendation': 'no_data',
                'message': 'Không có dữ liệu dự báo'
            }
        
        # Find month with highest predicted price
        best_forecast = max(forecasts, key=lambda f: f.predicted_price or 0)
        
        return {
            'recommendation': 'optimal_time',
            'best_month': best_forecast.forecast_for_month,
            'predicted_price': best_forecast.predicted_price,
            'confidence': best_forecast.confidence_score,
            'message': f'Nên bán vào tháng {best_forecast.forecast_for_month.strftime("%m/%Y")} với giá dự kiến {best_forecast.predicted_price:,.0f} VNĐ/kg'
        }
