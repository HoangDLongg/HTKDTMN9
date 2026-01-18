#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from django.contrib.auth.hashers import make_password

# Reset passwords for demo accounts
users_to_reset = [
    ('admin', 'admin123'),
    ('htx_manager', 'htx123'),
    ('farmer1', 'farmer123'),
    ('farmer3', 'farmer123'),
]

for username, password in users_to_reset:
    try:
        user = Users.objects.get(username=username)
        user.password_hash = make_password(password)
        user.save()
        print(f'✅ Reset password for {username}')
    except Users.DoesNotExist:
        print(f'❌ User {username} not found')

print('\n✅ All passwords reset successfully!')
