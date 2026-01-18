import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.seasons.models import Seasons, DailyTasks

print(f"Total Seasons: {Seasons.objects.count()}")
for s in Seasons.objects.all():
    print(f"Full Season Info: ID={s.id} Code={s.season_code} Status={s.status} Farm={s.farm.name} Crop={s.crop.name}")

print(f"\nTotal Tasks: {DailyTasks.objects.count()}")
if DailyTasks.objects.exists():
    t = DailyTasks.objects.first()
    print(f"Sample Task: {t.task_name} (Season: {t.season.season_code})")
