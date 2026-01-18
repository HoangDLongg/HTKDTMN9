#!/usr/bin/env python
"""
Test Seasons API
"""
import requests
import json

# Login
print("🔐 Đang login...")
login_response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    json={'username': 'farmer1', 'password': 'farmer123'}
)

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token_data = login_response.json()
token = token_data['access']
farmer_id = token_data.get('farmer_id')

print(f"✅ Login thành công! Farmer ID: {farmer_id}")
print()

headers = {'Authorization': f'Bearer {token}'}

# Test seasons endpoint
print("🌾 Test API /api/seasons/?farm=1")
seasons_response = requests.get(
    'http://127.0.0.1:8000/api/seasons/?farm=1',
    headers=headers
)

print(f"Status: {seasons_response.status_code}")
if seasons_response.status_code == 200:
    data = seasons_response.json()
    print(f"✅ Tìm thấy {data.get('count', 0)} mùa vụ")
    if data.get('results'):
        season = data['results'][0]
        print(f"   Season ID: {season.get('id')}")
        print(f"   Crop: {season.get('crop_details')}")
        print(f"   Status: {season.get('status')}")
else:
    print(f"❌ Error: {seasons_response.text}")

print()

# Test daily-tasks endpoint
print("✅ Test API /api/daily-tasks/?season=6")
tasks_response = requests.get(
    'http://127.0.0.1:8000/api/daily-tasks/?season=6',
    headers=headers
)

print(f"Status: {tasks_response.status_code}")
if tasks_response.status_code == 200:
    data = tasks_response.json()
    print(f"✅ Tìm thấy {data.get('count', 0)} công việc")
else:
    print(f"❌ Error: {tasks_response.text}")

print()

# Test farming-logs endpoint
print("📝 Test API /api/farming-logs/?season=6")
logs_response = requests.get(
    'http://127.0.0.1:8000/api/farming-logs/?season=6',
    headers=headers
)

print(f"Status: {logs_response.status_code}")
if logs_response.status_code == 200:
    data = logs_response.json()
    print(f"✅ Tìm thấy {data.get('count', 0)} nhật ký")
else:
    print(f"❌ Error: {logs_response.text}")
