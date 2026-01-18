#!/usr/bin/env python
"""
Create farmer records for farmer users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from apps.farms.models import Farmers, Cooperatives

print("=== CHECKING FARMERS TABLE ===")
farmers = Farmers.objects.all()
print(f"Total farmers in database: {farmers.count()}")
for f in farmers:
    user_username = f.user.username if f.user else "No user"
    print(f"  - Farmer ID: {f.id}, Code: {f.farmer_code}, User: {user_username}")

print("\n=== CHECKING FARMER USERS ===")
farmer_users = Users.objects.filter(role__role_id=3)
print(f"Total users with farmer role: {farmer_users.count()}")

for user in farmer_users:
    print(f"\n👤 User: {user.username} (ID: {user.user_id})")
    
    # Check if farmer record exists
    try:
        farmer = Farmers.objects.get(user=user)
        print(f"   ✓ Has farmer record: ID={farmer.id}, Code={farmer.farmer_code}")
    except Farmers.DoesNotExist:
        print(f"   ✗ Missing farmer record - CREATING...")
        
        # Get or create a default cooperative
        coop, created = Cooperatives.objects.get_or_create(
            cooperative_code='HTX001',
            defaults={
                'cooperative_name': 'Hợp Tác Xã Mặc Định',
                'manager': None
            }
        )
        
        if created:
            print(f"   Created cooperative: {coop.cooperative_name}")
        
        # Create farmer record
        farmer_code = f"ND{user.user_id:04d}"  # ND0001, ND0002, etc.
        farmer = Farmers.objects.create(
            user=user,
            farmer_code=farmer_code,
            cooperative=coop
        )
        print(f"   ✓ Created farmer record: ID={farmer.id}, Code={farmer.farmer_code}")

print("\n=== SUMMARY ===")
print(f"Farmers in database: {Farmers.objects.count()}")
print(f"Users with farmer role: {Users.objects.filter(role__role_id=3).count()}")
