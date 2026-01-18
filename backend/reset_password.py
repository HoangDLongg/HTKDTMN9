import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users

from django.contrib.auth.hashers import make_password

try:
    u = Users.objects.get(username='farmer1')
    u.password_hash = make_password('password123')
    u.save()
    print("Password for farmer1 reset to 'password123'")
except Exception as e:
    print(f"Error: {e}")
