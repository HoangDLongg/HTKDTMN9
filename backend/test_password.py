#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Users
from django.contrib.auth.hashers import check_password

u = Users.objects.get(username='farmer1')
print('Username:', u.username)
print('Password check farmer123:', check_password('farmer123', u.password_hash))
print('Password hash:', u.password_hash[:50])
