import requests
import json

# Test login with new password
login_url = "http://127.0.0.1:8000/api/token/"

print("=" * 60)
print("Testing Login with Password: 123456")
print("=" * 60)

test_users = [
    ("admin", "123456"),
    ("htx_manager", "123456"),
    ("farmer1", "123456"),
]

for username, password in test_users:
    print(f"\n🧪 Testing: {username}")
    response = requests.post(login_url, json={"username": username, "password": password})
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Login SUCCESS!")
        print(f"   Role: {data.get('role')}")
        
        # Test /users/me/
        token = data.get('access')
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get("http://127.0.0.1:8000/api/users/me/", headers=headers)
        
        if me_response.status_code == 200:
            user_data = me_response.json()
            print(f"   role_name from /users/me/: {user_data.get('role_name')}")
        else:
            print(f"   ❌ /users/me/ failed: {me_response.status_code}")
    else:
        print(f"   ❌ Login FAILED: {response.json()}")

print("\n" + "=" * 60)
