import urllib.request
import json
import urllib.parse

def get_token():
    url = "http://localhost:8000/api/token/"
    data = {"username": "farmer1", "password": "password123"}
    data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as f:
            resp = json.loads(f.read().decode('utf-8'))
            return resp.get('access')
    except Exception as e:
        print(f"Token Error: {e}")
        return None

def check_farms(token):
    url = "http://localhost:8000/api/farms/"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req) as f:
            data = f.read().decode('utf-8')
            json_data = json.loads(data)
            print("--- API RESPONSE START ---")
            print(json.dumps(json_data, indent=2))
            print("--- API RESPONSE END ---")
            
            if isinstance(json_data, list):
                print(f"Format: LIST (Count: {len(json_data)})")
            elif 'results' in json_data:
                print(f"Format: PAGINATED (Count: {json_data.get('count')})")
            else:
                print("Format: UNKNOWN")
                
    except Exception as e:
        print(f"Farms API Error: {e}")
        try:
             # Print error response body if available
             if hasattr(e, 'read'):
                 print(e.read().decode('utf-8'))
        except:
            pass

token = get_token()
if token:
    print(f"Token acquired. Fetching farms...")
    check_farms(token)
else:
    print("Failed to get token.")
