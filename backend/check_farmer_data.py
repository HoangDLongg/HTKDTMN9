#!/usr/bin/env python
"""
Check farmers data and their relationship to users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import User
from apps.farms.models import Farmers

print("=== USERS ===")
users = User.objects.all()
for u in users:
    role_id = u.role.role_id if u.role else None
    role_name = u.role.role_name if u.role else None
    print(f"ID: {u.user_id}, Username: {u.username}, Role: {role_id} ({role_name})")

print("\n=== FARMERS ===")
farmers = Farmers.objects.all()
for f in farmers:
    user_username = f.user.username if f.user else None
    user_id = f.user.user_id if f.user else None
    print(f"Farmer ID: {f.id}, User ID: {user_id}, Username: {user_username}, Code: {f.farmer_code}")

print("\n=== CHECKING farmer1 USER ===")
try:
    farmer1_user = User.objects.get(username='farmer1')
    print(f"✓ Found farmer1 user: ID={farmer1_user.user_id}")
    
    # Try to find farmer record
    try:
        farmer = Farmers.objects.get(user=farmer1_user)
        print(f"✓ Found farmer record: ID={farmer.id}, Code={farmer.farmer_code}")
    except Farmers.DoesNotExist:
        print("✗ No farmer record found for farmer1 user")
        print(f"  Need to create Farmers record with user_id={farmer1_user.user_id}")
except User.DoesNotExist:
    print("✗ farmer1 user not found")
