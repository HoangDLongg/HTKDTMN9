"""
Test n8n Webhook for AgriSupply Chatbot
Run this after setting up n8n workflow
"""
import requests
import json

# n8n webhook URL (update this after you get it from n8n)
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/agri-chat"

def test_webhook(message, user_id=1):
    """Test n8n webhook with a message"""
    payload = {
        "message": message,
        "user_id": user_id
    }
    
    print(f"\n{'='*60}")
    print(f"Testing: {message}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"\nResponse:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            if 'answer' in result:
                print(f"\n📝 AI Answer:")
                print(result['answer'])
        else:
            print(f"\n❌ ERROR!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error! n8n is not running or webhook URL is wrong")
        print(f"Make sure n8n is running at: {N8N_WEBHOOK_URL}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Test different types of questions
    test_cases = [
        "giá thị trường hôm nay",
        "hôm nay tôi phải làm gì",
        "nên trồng cây gì",
        "vụ mùa của tôi đến đâu rồi"
    ]
    
    print("\n" + "="*60)
    print("n8n WEBHOOK TEST - AgriSupply Chatbot")
    print("="*60)
    print(f"Webhook URL: {N8N_WEBHOOK_URL}")
    print(f"Total tests: {len(test_cases)}")
    
    for message in test_cases:
        test_webhook(message)
    
    print("\n" + "="*60)
    print("Test completed!")
    print("="*60)
