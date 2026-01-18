import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.seasons.models import SeasonRegistrations
from apps.farms.models import Farmers

print(f"Total Registrations: {SeasonRegistrations.objects.count()}")
for r in SeasonRegistrations.objects.all():
    print(f"ID: {r.id}, Farmer: {r.farmer.user.username}, Status: {r.status}, Farm: {r.farm.name}")
    
print("\n--- Farmers ---")
for f in Farmers.objects.all():
     print(f"ID: {f.id}, Code: {f.farmer_code}, Coop: {f.cooperative_id}, User: {f.user.username if f.user else 'None'}")
