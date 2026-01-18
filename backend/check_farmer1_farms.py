#!/usr/bin/env python
"""
Check farms for farmer1
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from apps.farms.models import Farmers, Farms

print("=== Checking farmer1's farms ===")

# Get farmer1 user
farmer1_user = Users.objects.get(username='farmer1')
print(f"User: {farmer1_user.username} (ID: {farmer1_user.id})")

# Get farmer record
farmer = Farmers.objects.get(user=farmer1_user)
print(f"Farmer: {farmer.farmer_code} (ID: {farmer.id})")

# Get farms
farms = Farms.objects.filter(farmer=farmer)
print(f"\nTotal farms: {farms.count()}")

for farm in farms:
    print(f"\nFarm ID: {farm.id}")
    print(f"  Name: {farm.name}")
    print(f"  Area: {farm.area_hectare} ha")
    print(f"  Soil: {farm.soil_type}")
    print(f"  Ward: {farm.ward.name if farm.ward else 'N/A'}")
    
    # Check seasons for this farm
    from apps.seasons.models import Seasons
    seasons = Seasons.objects.filter(farm=farm).select_related('crop')
    print(f"  Seasons: {seasons.count()}")
    for season in seasons:
        print(f"    - {season.crop.name if season.crop else 'N/A'} ({season.status})")
