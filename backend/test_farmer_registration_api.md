# Backend API Test - Farmer Registration Flow

## Test với cURL hoặc Postman

### 1. Test Farmer Register

**Endpoint**: `POST http://127.0.0.1:8000/api/seasons/farmer-register/`

**Headers**:
```
Content-Type: application/json
Authorization: Token <farmer_token>  # Get token from login
```

**Body**:
```json
{
  "recommendation_id": 1,
  "farm_id": 1,
  "area_registered": 0.8
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration submitted successfully. Waiting for HTX approval.",
  "data": {
    "id": 1,
    "farmer_name": "Lê Văn Nông",
    "farm_name": "Vườn A",
    "crop_name": "Dưa lưới",
    "area_registered": "0.80",
    "status": "pending",
    ...
  }
}
```

---

### 2. Test Get Pending Registrations (HTX)

**Endpoint**: `GET http://127.0.0.1:8000/api/seasons/pending-registrations/`

**Headers**:
```
Authorization: Token <htx_token>
```

**Query Params** (optional):
- `status=pending`
- `cooperative_id=1`

**Expected Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "farmer_name": "Lê Văn Nông",
      "farm_name": "Vườn A - Dưa lưới",
      "crop_name": "Dưa lưới",
      "area_registered": "0.80",
      "expected_price": "45000.00",
      "status": "pending",
      "created_at": "2026-01-15T10:30:00Z"
    },
    ...
  ]
}
```

---

### 3. Test Approve Registration (HTX)

**Endpoint**: `POST http://127.0.0.1:8000/api/seasons/registrations/1/approve/`

**Headers**:
```
Authorization: Token <htx_token>
```

**Body**: Empty (or optional notes)

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration approved and season created",
  "data": {
    "id": 1,
    "status": "approved",
    "season": 10,  // New season ID created
    "approved_by": 2,
    "approved_at": "2026-01-15T10:45:00Z",
    ...
  }
}
```

**Side Effects**:
- New `Season` created
- 75 `DailyTasks` auto-generated
- Registration linked to season

---

### 4. Test Reject Registration (HTX)

**Endpoint**: `POST http://127.0.0.1:8000/api/seasons/registrations/2/reject/`

**Headers**:
```
Authorization: Token <htx_token>
```

**Body**:
```json
{
  "notes": "Diện tích trồng quá nhỏ, không đủ hiệu quả"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration rejected",
  "data": {
    "id": 2,
    "status": "rejected",
    "notes": "Diện tích trồng quá nhỏ...",
    ...
  }
}
```

---

## Quick Test Script (Python)

```python
import requests

BASE_URL = "http://127.0.0.1:8000/api"

# 1. Login to get token (assuming you have test users)
login_data = {"username": "farmer1", "password": "demo123"}
login_resp = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
farmer_token = login_resp.json()['token']

# 2. Farmer registers
headers = {"Authorization": f"Token {farmer_token}"}
register_data = {
    "recommendation_id": 1,
    "farm_id": 1,
    "area_registered": 0.8
}
reg_resp = requests.post(f"{BASE_URL}/seasons/farmer-register/", json=register_data, headers=headers)
print("Registration:", reg_resp.json())

# 3. HTX login
htx_login = {"username": "htx_manager", "password": "demo123"}
htx_resp = requests.post(f"{BASE_URL}/auth/login/", json=htx_login)
htx_token = htx_resp.json()['token']

# 4. HTX get pending
htx_headers = {"Authorization": f"Token {htx_token}"}
pending = requests.get(f"{BASE_URL}/seasons/pending-registrations/", headers=htx_headers)
print("Pending:", pending.json())

# 5. HTX approve
reg_id = pending.json()['data'][0]['id']
approve = requests.post(f"{BASE_URL}/seasons/registrations/{reg_id}/approve/", headers=htx_headers)
print("Approved:", approve.json())
```

---

## Expected Database State After Tests

```sql
-- Check registrations
SELECT * FROM season_registrations;

-- Check seasons created
SELECT * FROM seasons WHERE id IN (SELECT season_id FROM season_registrations WHERE status='approved');

-- Check daily_tasks generated
SELECT COUNT(*) FROM daily_tasks WHERE season_id IN (...);
```

Should show:
- Registrations table with pending/approved/rejected statuses
- New seasons created for approved registrations
- ~75 tasks per approved season
