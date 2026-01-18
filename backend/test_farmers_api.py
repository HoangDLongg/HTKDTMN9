"""
Test Farmers API for Frontend
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# Login first
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("="*80)
print("TESTING FARMERS API")
print("="*80)

# Login
print("\n1. Login...")
response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
if response.status_code == 200:
    token = response.json()['access']
    print(f"✓ Login successful")
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get farmers
    print("\n2. Get farmers list...")
    response = requests.get(f"{BASE_URL}/farmers/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        farmers = data if isinstance(data, list) else data.get('results', [])
        print(f"✓ Got {len(farmers)} farmers")
        
        # Check first farmer structure
        if farmers:
            farmer = farmers[0]
            print(f"\nSample farmer structure:")
            print(json.dumps(farmer, indent=2, ensure_ascii=False))
            
            # Check required fields
            print(f"\nChecking fields:")
            print(f"  - id: {farmer.get('id')}")
            print(f"  - farmer_code: {farmer.get('farmer_code')}")
            print(f"  - user_details: {farmer.get('user_details')}")
            print(f"  - cooperative_details: {farmer.get('cooperative_details')}")
            print(f"  - ward_details: {farmer.get('ward_details')}")
            print(f"  - bank_account: {farmer.get('bank_account')}")
            print(f"  - bank_name: {farmer.get('bank_name')}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.text)
    
    # Get farms
    print("\n3. Get farms list...")
    response = requests.get(f"{BASE_URL}/farms/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        farms = data if isinstance(data, list) else data.get('results', [])
        print(f"✓ Got {len(farms)} farms")
    
    # Get seasons
    print("\n4. Get seasons list...")
    response = requests.get(f"{BASE_URL}/seasons/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        seasons = data if isinstance(data, list) else data.get('results', [])
        print(f"✓ Got {len(seasons)} seasons")
else:
    print(f"✗ Login failed: {response.status_code}")

print("\n" + "="*80)
