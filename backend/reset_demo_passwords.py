import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from apps.core.models import Users

def reset_passwords():
    # Set all users password to '123456'
    new_hash = make_password('123456')
    print(f"Generated hash: {new_hash}")
    
    users = Users.objects.all()
    count = 0
    for user in users:
        print(f"Resetting password for {user.username} (Role: {user.role_id})")
        user.password_hash = new_hash
        user.save()
        count += 1
    
    print(f"Successfully reset passwords for {count} users to '123456'")

if __name__ == '__main__':
    reset_passwords()
