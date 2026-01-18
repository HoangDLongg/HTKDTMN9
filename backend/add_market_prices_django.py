"""
Django script to add market prices for all crops
Run: python manage.py shell < add_market_prices_django.py
"""
import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import Crops
from apps.market.models import MarketPrices

# Get all crops
crops = Crops.objects.all()
print(f"Found {crops.count()} crops")

# Check existing prices
existing_crop_names = set(MarketPrices.objects.values_list('crop_name', flat=True).distinct())
print(f"Crops with existing prices: {existing_crop_names}")

# Add prices for crops without prices
added_count = 0
for crop in crops:
    if crop.name not in existing_crop_names:
        print(f"Adding price for: {crop.name}")
        
        # Generate realistic prices
        base_price = random.randint(15000, 50000)
        
        # Add prices for last 30 days
        for days_ago in range(30):
            price_date = datetime.now() - timedelta(days=days_ago)
            price_avg = base_price + random.randint(-5000, 5000)
            price_min = price_avg - random.randint(2000, 5000)
            price_max = price_avg + random.randint(2000, 5000)
            
            MarketPrices.objects.create(
                crop=crop,
                crop_name=crop.name,
                price_date=price_date,
                price_avg=price_avg,
                price_min=price_min,
                price_max=price_max,
                market_name='Chợ đầu mối Bình Điền'
            )
        
        added_count += 1

print(f"\n✅ Added prices for {added_count} crops")
print(f"Total crops with prices: {len(existing_crop_names) + added_count}")
