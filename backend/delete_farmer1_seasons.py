import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.seasons.models import Seasons, DailyTasks

# Delete all seasons for farmer 1
farmer1_seasons = Seasons.objects.filter(farm__farmer__id=1)

print(f"Found {farmer1_seasons.count()} seasons for Farmer 1")

for season in farmer1_seasons:
    tasks_count = DailyTasks.objects.filter(season=season).count()
    crop_name = season.crop.name if season.crop else "Unknown"
    print(f"  - Season #{season.id}: {crop_name} ({tasks_count} tasks)")

if farmer1_seasons.count() > 0:
    confirm = input("\nDelete all these seasons? (yes/no): ")
    if confirm.lower() == 'yes':
        # Delete tasks first (cascade should handle this but explicit is better)
        for season in farmer1_seasons:
            DailyTasks.objects.filter(season=season).delete()
        
        farmer1_seasons.delete()
        print(f"\n✅ Deleted {farmer1_seasons.count()} seasons and their tasks")
    else:
        print("Cancelled")
else:
    print("No seasons to delete")
