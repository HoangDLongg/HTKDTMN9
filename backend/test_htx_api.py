import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import Users
import urllib.request
import json

def get_token(username):
    user = Users.objects.get(username=username)
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

def call_api(path, token):
    url = f"http://127.0.0.1:8000/api{path}"
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return str(e)

token = get_token('htx_manager')
print(f"Token obtained for htx_manager")

seasons_data = call_api('/seasons/', token)
print("\n--- Seasons Response ---")
if isinstance(seasons_data, dict):
    print(f"Format: PAGINATED, Count: {seasons_data.get('count')}")
    if 'results' in seasons_data and len(seasons_data['results']) > 0:
        for sample in seasons_data['results']:
            print(f"Season: ID={sample.get('id')}, Name='{sample.get('name')}', Code='{sample.get('season_code')}'")
else:
    print(f"Response error or unexpected format: {seasons_data}")

farms_data = call_api('/farms/', token)
print("\n--- Farms Response ---")
if isinstance(farms_data, dict):
    print(f"Format: PAGINATED, Count: {farms_data.get('count')}")
else:
    print(f"Response error or unexpected format: {farms_data}")
