#!/usr/bin/env python
"""
Simple check of farmer1 data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from apps.farms.models import Farmers

print("=== Checking farmer1 user ===")
try:
    farmer1_user = Users.objects.get(username='farmer1')
    print(f"✓ Found farmer1 user:")
    print(f"  id: {farmer1_user.id}")
    print(f"  username: {farmer1_user.username}")
    print(f"  role: {farmer1_user.role.name if farmer1_user.role else 'No role'}")
    
    print("\n=== Checking Farmers table for farmer1 ===")
    try:
        farmer = Farmers.objects.get(user=farmer1_user)
        print(f"✓ Found farmer record:")
        print(f"  farmer_id: {farmer.id}")
        print(f"  farmer_code: {farmer.farmer_code}")
        print(f"  user_id: {farmer.user.id}")
    except Farmers.DoesNotExist:
        print(f"✗ No farmer record found for user_id {farmer1_user.id}")
        
except Users.DoesNotExist:
    print("✗ farmer1 user not found in database")

print("\n=== All Farmers ===")
all_farmers = Farmers.objects.select_related('user').all()
for f in all_farmers:
    print(f"Farmer ID: {f.id}, Code: {f.farmer_code}, User: {f.user.username if f.user else 'None'}, User ID: {f.user.id if f.user else 'None'}")
