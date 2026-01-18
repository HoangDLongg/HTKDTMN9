import requests

# Get auth token
login_response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    json={
        'username': 'farmer1',
        'password': 'farmer123'
    }
)

if login_response.status_code == 200:
    token = login_response.json()['access']
    print(f"✅ Logged in successfully")
    
    # Test chatbot API
    chat_response = requests.post(
        'http://127.0.0.1:8000/api/chat/',
        json={'message': 'giá thị trường hôm nay'},
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json; charset=utf-8'
        }
    )
    
    print(f"\nStatus: {chat_response.status_code}")
    if chat_response.status_code == 200:
        result = chat_response.json()
        print(f"\n{result.get('answer', '')}")
    else:
        print(f"Error: {chat_response.text}")
else:
    print(f"❌ Login failed: {login_response.text}")
