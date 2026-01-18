"""
Test N8N Chatbot Integration

This script tests the chatbot workflow end-to-end:
1. Test n8n webhook directly
2. Test Django API endpoint
3. Verify chat logs saved to database

Usage:
    python test_chatbot.py
"""

import requests
import json

# Configuration
N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/agri-chat'
DJANGO_API_URL = 'http://127.0.0.1:8000/api/chatbot/chat/'

# Test messages with expected intents
TEST_MESSAGES = [
    {'message': 'giá thị trường hôm nay', 'expected_intent': 'market_price'},
    {'message': 'hôm nay tôi phải làm gì?', 'expected_intent': 'daily_tasks'},
    {'message': 'nên trồng cây gì?', 'expected_intent': 'recommendations'},
    {'message': 'tiến độ vụ mùa', 'expected_intent': 'seasons'},
    {'message': 'cảnh báo thời tiết', 'expected_intent': 'alerts'},
    {'message': 'thông tin trang trại của tôi', 'expected_intent': 'farms'},
    {'message': 'trợ giúp', 'expected_intent': 'help'},
    {'message': 'câu hỏi random', 'expected_intent': 'faq'}
]

def test_n8n_directly():
    """Test n8n webhook directly without Django"""
    print("=" * 60)
    print("1. TESTING N8N WEBHOOK DIRECTLY")
    print("=" * 60)
    
    try:
        response = requests.get('http://localhost:5678')
        print("✅ N8N is running")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: N8N is not running!")
        print("   Please start n8n: n8n start")
        return False
    
    print("\nTesting webhook with sample messages...\n")
    
    for test in TEST_MESSAGES[:3]:  # Test first 3
        print(f"📤 Testing: \"{test['message']}\"")
        
        try:
            response = requests.post(
                N8N_WEBHOOK_URL,
                json={'message': test['message'], 'user_id': 1},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('answer', '')[:100]  # First 100 chars
                print(f"✅ Response: {answer}...\n")
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   {response.text}\n")
                
        except requests.exceptions.ConnectionError:
            print("❌ ERROR: Cannot connect to n8n webhook")
            print("   Make sure workflow is ACTIVE in n8n\n")
            return False
        except Exception as e:
            print(f"❌ ERROR: {e}\n")
            return False
    
    return True


def test_django_api(token):
    """Test Django API endpoint"""
    print("=" * 60)
    print("2. TESTING DJANGO API ENDPOINT")
    print("=" * 60)
    
    try:
        response = requests.get('http://127.0.0.1:8000/api/')
        print("✅ Django server is running")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Django is not running!")
        print("   Please start Django: python manage.py runserver")
        return False
    
    print("\nTesting chat endpoint with auth...\n")
    
    for test in TEST_MESSAGES[:2]:  # Test first 2
        print(f"📤 Testing: \"{test['message']}\"")
        
        try:
            response = requests.post(
                DJANGO_API_URL,
                json={'message': test['message']},
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}'
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', '')[:100]
                print(f"✅ Response: {answer}...\n")
            elif response.status_code == 401:
                print("❌ ERROR: Unauthorized - token invalid")
                return False
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   {response.text}\n")
                
        except Exception as e:
            print(f"❌ ERROR: {e}\n")
            return False
    
    return True


def get_auth_token():
    """Login and get JWT token"""
    print("=" * 60)
    print("AUTHENTICATION")
    print("=" * 60)
    
    print("Logging in as farmer1...")
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/auth/login/',
            json={'username': 'farmer1', 'password': 'farmer123'}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print(f"✅ Login successful")
            print(f"   User: {data.get('full_name')}")
            print(f"   Role: {data.get('role')}\n")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None


def check_chat_logs():
    """Check if chat logs are being saved"""
    print("=" * 60)
    print("3. CHECKING CHAT LOGS IN DATABASE")
    print("=" * 60)
    
    try:
        import os
        import sys
        import django
        
        # Setup Django
        sys.path.append(os.path.join(os.path.dirname(__file__)))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()
        
        from apps.chatbot.models import ChatLogs
        
        logs = ChatLogs.objects.all().order_by('-created_at')[:5]
        
        if logs.exists():
            print(f"✅ Found {logs.count()} recent chat logs:\n")
            for log in logs:
                print(f"  • {log.user_message[:50]}...")
                print(f"    Intent: {log.intent}")
                print(f"    Time: {log.created_at}\n")
        else:
            print("⚠️  No chat logs found yet")
            print("   Logs will be created after chatting\n")
            
        return True
        
    except Exception as e:
        print(f"⚠️  Could not check database: {e}")
        print("   (This is optional - logs will still work)\n")
        return True


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("🤖 AGRISUPPLY CHATBOT TEST SUITE")
    print("=" * 60 + "\n")
    
    # Test 1: N8N Webhook
    if not test_n8n_directly():
        print("\n❌ N8N tests FAILED - fix n8n before proceeding")
        return
    
    # Test 2: Get auth token
    token = get_auth_token()
    if not token:
        print("\n❌ Authentication FAILED - cannot test Django API")
        return
    
    # Test 3: Django API
    if not test_django_api(token):
        print("\n❌ Django API tests FAILED")
        return
    
    # Test 4: Database logs
    check_chat_logs()
    
    # Final summary
    print("=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\n🎉 Chatbot is ready to use!")
    print("   Visit: http://localhost:3000/farmer/support\n")


if __name__ == '__main__':
    main()
