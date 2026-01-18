import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users

try:
    u = Users.objects.get(username='htx_manager')
    print(f"User: {u.username}")
    print(f"Role ID: {u.role_id}")
    if u.role:
        print(f"Role Name: '{u.role.name}'")
    else:
        print("Role: None")
except Exception as e:
    print(f"Error: {e}")
