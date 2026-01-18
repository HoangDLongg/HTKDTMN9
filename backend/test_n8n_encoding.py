import requests
import json

# Test với nhiều encoding
messages = [
    "giá thị trường hôm nay",
    "gia thi truong hom nay",  # không dấu
    "giá",
    "price"
]

for msg in messages:
    print(f"\n{'='*60}")
    print(f"Testing: {msg}")
    print(f"{'='*60}")
    
    response = requests.post(
        'http://localhost:5678/webhook/agri-chat',
        json={'message': msg, 'user_id': 1},
        headers={'Content-Type': 'application/json; charset=utf-8'},
        timeout=10
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result.get('answer', '')[:100]}...")
