import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users, Roles

print("=" * 60)
print("CHECKING USER ROLES IN DATABASE")
print("=" * 60)

# Get all roles
roles = Roles.objects.all()
print("\n📋 Available Roles:")
for role in roles:
    print(f"   ID: {role.id} | Name: {role.name}")

print("\n" + "=" * 60)
print("USER → ROLE MAPPING")
print("=" * 60)

users = Users.objects.select_related('role').all()
for u in users:
    print(f"Username: {u.username:20} | Role ID: {u.role_id if u.role_id else 'NULL':5} | Role Name: {u.role.name if u.role else 'NULL'}")

print("\n" + "=" * 60)
print("CHECKING htx_manager SPECIFICALLY")
print("=" * 60)

try:
    htx = Users.objects.select_related('role').get(username='htx_manager')
    print(f"Username: {htx.username}")
    print(f"Role ID in DB: {htx.role_id}")
    print(f"Role Name: {htx.role.name if htx.role else 'NULL'}")
    print(f"Expected: cooperative_manager")
    
    if htx.role and htx.role.name != 'cooperative_manager':
        print(f"\n❌ PROBLEM FOUND!")
        print(f"   htx_manager has role: {htx.role.name}")
        print(f"   Expected: cooperative_manager")
        
        # Try to find correct role
        try:
            correct_role = Roles.objects.get(name='cooperative_manager')
            print(f"\n✅ Found cooperative_manager role (ID: {correct_role.id})")
            print(f"   Fixing htx_manager user...")
            htx.role = correct_role
            htx.save()
            print(f"   ✅ FIXED! htx_manager now has cooperative_manager role")
        except Roles.DoesNotExist:
            print(f"   ❌ cooperative_manager role doesn't exist in database!")
    else:
        print(f"\n✅ htx_manager has correct role")
        
except Users.DoesNotExist:
    print("❌ htx_manager user not found in database")
