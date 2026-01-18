import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from apps.farms.models import Farms, Farmers

print("--- DEBUG USER FARMS ---")
users = Users.objects.all()
for u in users:
    print(f"User: {u.id} - {u.username} (Role: {u.role.name if u.role else 'None'})")
    
    # Check if related farmer exists
    try:
        farmer = Farmers.objects.get(user=u)
        print(f"  -> Linked Farmer: {farmer.id} - {farmer}")
        
        # Check farms
        farms = Farms.objects.filter(farmer=farmer)
        print(f"  -> Farms: {farms.count()}")
        for f in farms:
            print(f"     * {f.name} (ID: {f.id})")
            
    except Farmers.DoesNotExist:
        print("  -> No linked farmer profile")

print("------------------------")
