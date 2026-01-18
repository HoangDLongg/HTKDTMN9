"""
Verification Script - Check Data Counts
Kiểm tra xem database đã có đủ dữ liệu chưa
Run: python test_data_counts.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Roles, Users
from apps.locations.models import Provinces, Districts, Wards
from apps.crops.models import Crops, TechnicalProcesses, ProcessStages, StageTasks
from apps.farms.models import Cooperatives, Farmers, Farms
from apps.seasons.models import Seasons, DailyTasks, FarmingLogs
from apps.market.models import PriceSources, MarketPrices, DemandForecasts, PlantingRecommendations
from apps.chatbot.models import ChatLogs, Faqs, Alerts, Notifications

def check_counts():
    """Check all table counts"""
    
    expected_minimum = {
        'roles': 4,
        'users': 5,
        'provinces': 63,
        'districts': 7,
        'wards': 7,
        'crops': 15,  # 5 initial + 15 new = 20 total
        'technical_processes': 2,
        'process_stages': 9,
        'stage_tasks': 20,
        'cooperatives': 2,
        'farmers': 3,
        'farms': 4,
        'seasons': 5,
        'daily_tasks': 10,  # At least 10 tasks
        'planting_recommendations': 5,  # At least 5
        'demand_forecasts': 30,  # At least 30
        'faqs': 10,  # At least 10
        'market_prices': 300,  # 30 days * ~10 crops minimum
        'price_sources': 3,
        'alerts': 3,
    }
    
    actual_counts = {
        'roles': Roles.objects.count(),
        'users': Users.objects.count(),
        'provinces': Provinces.objects.count(),
        'districts': Districts.objects.count(),
        'wards': Wards.objects.count(),
        'crops': Crops.objects.count(),
        'technical_processes': TechnicalProcesses.objects.count(),
        'process_stages': ProcessStages.objects.count(),
        'stage_tasks': StageTasks.objects.count(),
        'cooperatives': Cooperatives.objects.count(),
        'farmers': Farmers.objects.count(),
        'farms': Farms.objects.count(),
        'seasons': Seasons.objects.count(),
        'daily_tasks': DailyTasks.objects.count(),
        'planting_recommendations': PlantingRecommendations.objects.count(),
        'demand_forecasts': DemandForecasts.objects.count(),
        'faqs': Faqs.objects.count(),
        'market_prices': MarketPrices.objects.count(),
        'price_sources': PriceSources.objects.count(),
        'alerts': Alerts.objects.count(),
    }
    
    print("=" * 80)
    print("DATABASE DATA COUNT VERIFICATION")
    print("=" * 80)
    print(f"\n{'Table':<30} {'Expected (min)':<20} {'Actual':<20} {'Status':<10}")
    print("-" * 80)
    
    all_pass = True
    
    for table, expected in expected_minimum.items():
        actual = actual_counts.get(table, 0)
        status = "✓ PASS" if actual >= expected else "✗ FAIL"
        
        if actual < expected:
            all_pass = False
        
        # Color coding (if terminal supports)
        status_symbol = "✓" if actual >= expected else "✗"
        print(f"{table:<30} {expected:<20} {actual:<20} {status_symbol}")
    
    print("-" * 80)
    
    if all_pass:
        print("\n✅ ALL CHECKS PASSED! Database is ready for demo.")
    else:
        print("\n❌ SOME CHECKS FAILED. Run 'python seed_complete_data.py' to fix.")
    
    print("\n" + "=" * 80)
    
    # Additional checks
    print("\nADDITIONAL INFO:")
    print("-" * 80)
    
    active_seasons = Seasons.objects.filter(status='in_progress').count()
    print(f"Active Seasons: {active_seasons}")
    
    completed_tasks = DailyTasks.objects.filter(is_completed=True).count()
    print(f"Completed Tasks: {completed_tasks}")
    
    active_recommendations = PlantingRecommendations.objects.filter(status='active').count()
    print(f"Active Recommendations: {active_recommendations}")
    
    latest_price_date = MarketPrices.objects.order_by('-price_date').first()
    if latest_price_date:
        print(f"Latest Market Price Date: {latest_price_date.price_date}")
    
    print("=" * 80)
    
    return all_pass

if __name__ == '__main__':
    check_counts()
