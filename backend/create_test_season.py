import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.farms.models import Farmers, Farms
from apps.seasons.models import Seasons
from apps.crops.models import Crops, TechnicalProcesses

# Get farmer 1
farmer = Farmers.objects.first()
print(f"\n=== FARMER 1 INFO ===")
print(f"ID: {farmer.id}, Username: {farmer.user.username}")

# Get farmer's farm
farm = Farms.objects.filter(farmer=farmer).first()
if not farm:
    print("ERROR: Farmer 1 has no farm!")
    exit(1)

print(f"Farm: {farm.name}")
print(f"Location: {farm.ward.name if farm.ward else 'No ward'}")

# Check existing seasons
seasons = Seasons.objects.filter(farm=farm)
print(f"\nExisting Seasons: {seasons.count()}")

if seasons.exists():
    for s in seasons[:3]:
        print(f"  - Season {s.id}: {s.crop.name if s.crop else 'N/A'}")
        print(f"    Status: {s.status}, Start: {s.start_date}, Area: {s.area_planted} ha")
else:
    print("\nNo seasons found. Creating test season...")
    
    # Get a crop (Cà chua)
    crop = Crops.objects.filter(name__icontains='Cà chua').first()
    if not crop:
        crop = Crops.objects.first()
    
    # Get technical process
    process = TechnicalProcesses.objects.filter(crop=crop).first()
    if not process:
        process = TechnicalProcesses.objects.first()
    
    # Create season
    from apps.seasons.services import SeasonService
    
    season = SeasonService.create_season_with_timeline(
        farm=farm,
        crop=crop,
        process=process,
        start_date=date.today(),
        area_planted=1.5
    )
    
    print(f"\n✅ Created Season {season.id}:")
    print(f"   Crop: {crop.name}")
    print(f"   Farm: {farm.name}")
    print(f"   Status: {season.status}")
    print(f"   Daily tasks auto-generated!")

print("\n=== DONE ===")
