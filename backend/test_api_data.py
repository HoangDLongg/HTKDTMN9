"""
Quick API test script
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(endpoint, name):
    """Test an API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}/")
        print(f"\n{'='*60}")
        print(f"Testing: {name}")
        print(f"Endpoint: {endpoint}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                count = data.get('count', 0)
                results = data.get('results', [])
                print(f"Total Count: {count}")
                print(f"Items in this page: {len(results)}")
                if results:
                    print(f"\nFirst item:")
                    print(json.dumps(results[0], indent=2, ensure_ascii=False))
            elif isinstance(data, list):
                print(f"Total Items: {len(data)}")
                if data:
                    print(f"\nFirst item:")
                    print(json.dumps(data[0], indent=2, ensure_ascii=False))
            else:
                print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# Test endpoints
print("="*60)
print("API DATA TEST")
print("="*60)

test_endpoint("provinces", "Provinces (63 tỉnh/thành)")
test_endpoint("crops", "Crops (Cây trồng)")
test_endpoint("market-prices", "Market Prices (Giá thị trường)")
test_endpoint("roles", "Roles")
test_endpoint("technical-processes", "Technical Processes")

print(f"\n{'='*60}")
print("Test completed!")
print(f"{'='*60}")
