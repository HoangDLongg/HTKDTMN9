import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.market.models import PlantingRecommendations
from apps.crops.models import Crops
from apps.farms.models import Cooperatives

def create_mock_recommendations():
    # Ensure we have at least one crop and cooperative
    crop1, _ = Crops.objects.get_or_create(id=1, defaults={'name': 'Dưa lưới'})
    crop2, _ = Crops.objects.get_or_create(id=2, defaults={'name': 'Cà chua'})
    
    # Create recommendations
    recs = [
        {
            'crop': crop1,
            'recommended_area': 1.5,
            'recommended_start_date': date.today() + timedelta(days=5),
            'expected_price': 45000,
            'reason': 'Nhu cầu thị trường tăng cao vào tháng sau, giá tốt.',
            'priority_level': 1,
            'status': 'active'
        },
        {
            'crop': crop2,
            'recommended_area': 0.5,
            'recommended_start_date': date.today() + timedelta(days=10),
            'expected_price': 15000,
            'reason': 'Phù hợp luân canh, đang thiếu nguồn cung cục bộ.',
            'priority_level': 2,
            'status': 'active'
        }
    ]
    
    count = 0
    for rec in recs:
        PlantingRecommendations.objects.create(**rec)
        count += 1
        
    print(f"Created {count} mock planting recommendations.")

if __name__ == '__main__':
    create_mock_recommendations()
