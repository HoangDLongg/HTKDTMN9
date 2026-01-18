import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users

print("=" * 60)
print("Users in Database")
print("=" * 60)

users = Users.objects.select_related('role').all()
for u in users:
    print(f"Username: {u.username:20} | Role: {u.role.name if u.role else 'None'}")

print("\n" + "=" * 60)
print("Testing password for 'admin'")
print("=" * 60)

try:
    from django.contrib.auth.hashers import check_password
    admin_user = Users.objects.get(username='admin')
    
    # Try checking the password
    is_valid = check_password('demo123', admin_user.password_hash)
    print(f"Password 'demo123' valid: {is_valid}")
    
    if not is_valid:
        print("\n⚠️ Password không đúng! Cần reset.")
        print("Run: python reset_demo_passwords.py")
except Exception as e:
    print(f"Error: {e}")
