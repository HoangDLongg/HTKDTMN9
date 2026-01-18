"""
Seed Production Data - Điền dữ liệu sản lượng cho seasons
Run: python seed_production_data.py
"""
import os
import django
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.seasons.models import Seasons
from datetime import datetime, timedelta


def seed_production_data():
    """Add actual_yield data to completed seasons"""
    
    print("\n📦 Seeding Production Data...")
    print("=" * 60)
    
    # Get all seasons
    seasons = Seasons.objects.all()
    print(f"\n✓ Found {seasons.count()} seasons")
    
    # Also create some historical completed seasons
    from apps.farms.models import Farms
    from apps.crops.models import Crops, TechnicalProcesses
    
    farms = list(Farms.objects.all())
    crops = list(Crops.objects.all())
    processes = list(TechnicalProcesses.objects.all())
    
    if not farms or not crops:
        print("\n⚠️  Need farms and crops in database first!")
        return
    
    print(f"\n📝 Creating historical completed seasons...")
    
    # Create 10 completed seasons from past year
    historical_count = 0
    for i in range(10):
        # Random past dates (3-12 months ago)
        months_ago = random.randint(3, 12)
        start_date = datetime.now().date() - timedelta(days=months_ago * 30)
        
        farm = random.choice(farms)
        crop = random.choice(crops)
        
        # Try to find matching process, or use None
        matching_processes = [p for p in processes if p.crop_id == crop.id]
        process = random.choice(matching_processes) if matching_processes else None
        
        area = Decimal(str(round(random.uniform(0.5, 3.0), 2)))
        expected_yield = area * Decimal(str(round(random.uniform(15, 25), 2)))
        actual_yield = expected_yield * Decimal(str(round(random.uniform(0.8, 1.2), 2)))
        
        season_code = f"S{start_date.year}{start_date.month:02d}{i:03d}"
        
        season = Seasons.objects.create(
            season_code=season_code,
            farm=farm,
            crop=crop,
            process=process,
            start_date=start_date,
            expected_harvest_date=start_date + timedelta(days=90),
            actual_harvest_date=start_date + timedelta(days=random.randint(85, 95)),
            area_planted=area,
            expected_yield=expected_yield,
            actual_yield=actual_yield,
            status='completed',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        print(f"  ✓ Created #{season.id}: {crop.name} - {actual_yield} tấn")
        historical_count += 1
    
    print(f"\n✓ Created {historical_count} historical completed seasons")
    
    # Update existing seasons
    completed_count = 0
    for season in seasons:
        # Simulate completion for seasons that should be done
        if season.start_date:
            days_since_start = (datetime.now().date() - season.start_date).days
            
            # If season started more than 30 days ago, add some yield progress
            if days_since_start > 30:
                # Calculate actual yield based on expected yield with some variance
                if season.expected_yield:
                    variance = random.uniform(0.8, 1.2)  # 80%-120% of expected
                    actual = float(season.expected_yield) * variance
                else:
                    # Default yield based on crop type and area
                    area = float(season.area_planted) if season.area_planted else 1.0
                    tons_per_ha = random.uniform(15, 25)
                    actual = area * tons_per_ha
                
                season.actual_yield = Decimal(str(round(actual, 2)))
                season.status = 'completed'
                season.save()
                
                crop_name = season.crop.name if season.crop else 'Unknown'
                print(f"  ✓ Updated #{season.id} ({crop_name}): {season.actual_yield} tấn")
                completed_count += 1
    
    print(f"\n✓ Updated {completed_count} existing seasons")
    print("=" * 60)
    
    # Show summary
    total_yield = Seasons.objects.filter(actual_yield__isnull=False).aggregate(
        total=django.db.models.Sum('actual_yield')
    )['total'] or 0
    
    print(f"\n📊 Summary:")
    print(f"  Total completed seasons: {Seasons.objects.filter(status='completed').count()}")
    print(f"  Seasons with yield data: {Seasons.objects.filter(actual_yield__isnull=False).count()}")
    print(f"  Total production: {total_yield} tấn")
    print("\n✅ Done! Check the production page now.")


if __name__ == '__main__':
    seed_production_data()
