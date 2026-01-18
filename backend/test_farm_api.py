#!/usr/bin/env python
"""
Test Farm API với ward_details và crop_details
"""
import requests
import json

# Login để lấy token
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

print(f"✅ Login thành công!")
print(f"   User ID: {token_data.get('user_id')}")
print(f"   Farmer ID: {farmer_id}")
print()

# Test get farms
headers = {'Authorization': f'Bearer {token}'}
print(f"📋 Lấy danh sách farms của farmer {farmer_id}...")
farms_response = requests.get(
    f'http://127.0.0.1:8000/api/farms/?farmer={farmer_id}',
    headers=headers
)

if farms_response.status_code != 200:
    print(f"❌ Get farms failed: {farms_response.text}")
    exit(1)

farms_data = farms_response.json()
print(f"Response type: {type(farms_data)}")
print(f"Response: {farms_data}")
print()

# Check if it's a list or dict with results
if isinstance(farms_data, dict) and 'results' in farms_data:
    farms = farms_data['results']
elif isinstance(farms_data, list):
    farms = farms_data
else:
    print(f"Unexpected response format: {farms_data}")
    exit(1)

print(f"✅ Tìm thấy {len(farms)} vườn")
print()

# Kiểm tra farm đầu tiên
if farms:
    farm = farms[0]
    print(f"🏡 Farm: {farm['name']}")
    print(f"   ID: {farm['id']}")
    print(f"   Diện tích: {farm['area_hectare']} ha")
    print(f"   Ward ID: {farm.get('ward')}")
    print(f"   Ward Details: {farm.get('ward_details')}")
    print()
    
    # Test get seasons của farm này
    print(f"🌱 Lấy seasons của farm {farm['id']}...")
    seasons_response = requests.get(
        f"http://127.0.0.1:8000/api/seasons/?farm={farm['id']}",
        headers=headers
    )
    
    if seasons_response.status_code == 200:
        seasons_data = seasons_response.json()
        
        # Check if it's a list or dict with results
        if isinstance(seasons_data, dict) and 'results' in seasons_data:
            seasons = seasons_data['results']
        elif isinstance(seasons_data, list):
            seasons = seasons_data
        else:
            seasons = []
        
        print(f"✅ Tìm thấy {len(seasons)} vụ mùa")
        
        if seasons:
            season = seasons[0]
            print(f"   Season: {season.get('season_code')}")
            print(f"   Status: {season.get('status')}")
            print(f"   Crop ID: {season.get('crop')}")
            print(f"   Crop Details: {season.get('crop_details')}")
    else:
        print(f"❌ Get seasons failed: {seasons_response.text}")
