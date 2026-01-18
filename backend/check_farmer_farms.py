import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.farms.models import Farms, Farmers

try:
    farmer = Farmers.objects.get(id=1)
    farms = Farms.objects.filter(farmer=farmer)
    print(f"Farmer: {farmer}")
    print(f"Farms count: {farms.count()}")
    for farm in farms:
        print(f" - Farm ID: {farm.id}, Name: {farm.name}")
except Exception as e:
    print(f"Error: {e}")
