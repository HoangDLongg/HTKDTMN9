#!/usr/bin/env python
"""
Check market data in database
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.market.models import MarketPrices, PlantingRecommendations
from apps.seasons.models import SeasonRegistrations

print("=" * 60)
print("MARKET DATA CHECK")
print("=" * 60)

# Check market prices
print("\n📊 MARKET PRICES")
prices = MarketPrices.objects.select_related('crop').order_by('-price_date')[:10]
print(f"Total: {MarketPrices.objects.count()} records")
if prices:
    print("\nGần nhất:")
    for p in prices:
        print(f"  {p.price_date} | {p.crop.name if p.crop else 'N/A'} | "
              f"{p.price_min}-{p.price_max} | {p.market_location}")
else:
    print("⚠️ Chưa có dữ liệu giá")

# Check recommendations
print("\n\n💡 PLANTING RECOMMENDATIONS")
recommendations = PlantingRecommendations.objects.select_related(
    'cooperative', 'crop'
).order_by('-created_at')[:10]
print(f"Total: {PlantingRecommendations.objects.count()} records")
if recommendations:
    print("\nGần nhất:")
    for r in recommendations:
        print(f"  ID: {r.id}")
        print(f"  HTX: {r.cooperative.name if r.cooperative else 'N/A'}")
        print(f"  Cây: {r.crop.name if r.crop else 'N/A'}")
        print(f"  Diện tích: {r.recommended_area} ha")
        print(f"  Ngày: {r.recommended_start_date}")
        print(f"  Giá: {r.expected_price}")
        print(f"  Status: {r.status}")
        print()
else:
    print("⚠️ Chưa có recommendations")

# Check registrations
print("\n📝 SEASON REGISTRATIONS")
registrations = SeasonRegistrations.objects.select_related(
    'recommendation', 'farmer', 'farm'
).order_by('-created_at')[:10]
print(f"Total: {SeasonRegistrations.objects.count()} records")
if registrations:
    print("\nGần nhất:")
    for r in registrations:
        print(f"  ID: {r.id}")
        print(f"  Farmer: {r.farmer.farmer_code if r.farmer else 'N/A'}")
        print(f"  Farm: {r.farm.name if r.farm else 'N/A'}")
        print(f"  Area: {r.area_registered} ha")
        print(f"  Status: {r.status}")
        print()
else:
    print("⚠️ Chưa có registrations")

print("=" * 60)
