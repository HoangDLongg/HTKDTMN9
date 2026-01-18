# Weather Alert System - Setup Guide

## 📋 Overview
N8N workflow tự động kiểm tra thời tiết và gửi cảnh báo cho nông dân.

## 🚀 Quick Setup

### 1. Lấy OpenWeather API Key (FREE)
1. Truy cập: https://openweathermap.org/api
2. Click "Sign Up" (miễn phí)
3. Xác nhận email
4. Vào "API keys" tab
5. Copy API key (dạng: `abc123def456...`)

### 2. Configure N8N Environment Variable
**Option A: Docker (Recommended)**
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e OPENWEATHER_API_KEY=YOUR_API_KEY_HERE \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: N8N Settings UI**
1. Mở N8N: http://localhost:5678
2. Click "Settings" (⚙️) → "Environments"
3. Add: `OPENWEATHER_API_KEY` = `your_key_here`
4. Save

### 3. Import Workflow
1. Mở N8N UI: http://localhost:5678
2. Click "+" → "Import from File"
3. Chọn file: `n8n-weather-alert-system.json`
4. Click "Import"

### 4. Configure PostgreSQL Credentials
Workflow có 3 PostgreSQL nodes cần config:
- **Get Farm Locations**
- **Create Alert**
- **Send Notifications**

Cho mỗi node:
1. Click vào node
2. Select PostgreSQL credential (same as chatbot workflow)
   - Host: `host.docker.internal`
   - Database: `agrisupply_db`
   - User: `postgres`
   - Password: (your password)
   - Port: `5432`

### 5. Activate Workflow
1. Click toggle "Active" ở góc trên (màu xanh)
2. Workflow sẽ chạy mỗi ngày 6:00 AM

## 🧪 Manual Test
Test ngay không cần đợi 6:00 AM:

1. Click "Execute Workflow" button
2. Xem kết quả từng node
3. Check database:
```sql
-- Check alerts created
SELECT * FROM alerts 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check notifications sent
SELECT n.*, u.username 
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.created_at > NOW() - INTERVAL '1 hour'
ORDER BY n.created_at DESC;
```

## 📊 How It Works

```
Schedule (6:00 AM)
    ↓
Get Farm Locations (từ database)
    ↓
Loop qua từng location
    ↓
Get Weather Forecast (OpenWeather API)
    ↓
Analyze Weather (check rain/storm/wind)
    ↓
IF Alert Needed?
    ├─ YES → Create Alert in DB
    │         ↓
    │       Send Notifications to Farmers
    │         ↓
    │       Log Success
    │
    └─ NO → Log Skip (weather OK)
```

## ⚠️ Alert Levels

**HIGH (Đỏ)** 🔴
- Dông/bão (thunderstorm)
- Mưa lớn > 7mm/3h
- Gió mạnh > 15 m/s (54 km/h)

**MEDIUM (Vàng)** 🟡
- Mưa thường
- Gió vừa 10-15 m/s

**LOW (Xanh)** 🟢
- Thời tiết bình thường
- Không tạo alert

## 🎯 Features

✅ **Auto-detect severe weather**
- Thunderstorm (id 2xx)
- Heavy rain (id 5xx, >7mm/3h)
- Strong wind (>10 m/s)

✅ **Smart recommendations**
- Gia cố nhà kính khi bão
- Thoát nước khi mưa lớn
- Chằng chống giàn leo khi gió mạnh

✅ **Targeted notifications**
- Chỉ gửi cho farmers ở khu vực ảnh hưởng
- Group by ward/district
- Count affected farms

✅ **24-hour forecast**
- Check 8 intervals (3h mỗi interval)
- Alert valid for next 24h

## 🔧 Customization

**Change schedule time:**
Edit "Schedule Daily 6AM" node:
- Current: `0 6 * * *` (6:00 AM daily)
- Every 3 hours: `0 */3 * * *`
- Twice daily: `0 6,18 * * *` (6 AM & 6 PM)

**Adjust severity thresholds:**
Edit "Analyze Weather" node code:
- Rain threshold: `rain > 7` → change to `rain > 5`
- Wind threshold: `wind > 10` → change to `wind > 8`

**Add email/SMS:**
After "Send Notifications" node, add:
- Email node (SMTP)
- SMS node (Twilio)
- Telegram node

## 📝 Database Schema Required

Make sure you have these tables:
```sql
-- alerts table
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(255),
  message TEXT,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  notification_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- wards need lat/lon for weather
ALTER TABLE wards ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE wards ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
```

## 🌍 Sample Ward Coordinates (TP.HCM)

```sql
-- Update some sample locations
UPDATE wards SET latitude = 10.8231, longitude = 106.6297 WHERE name = 'Phường 1' AND district_id = (SELECT id FROM districts WHERE name = 'Quận 10');
UPDATE wards SET latitude = 10.7769, longitude = 106.7009 WHERE name = 'Phường Tân Định' AND district_id = (SELECT id FROM districts WHERE name = 'Quận 1');
```

## 🐛 Troubleshooting

**Error: "OPENWEATHER_API_KEY not found"**
→ Check environment variable in N8N settings

**Error: "401 Unauthorized"**
→ API key sai hoặc chưa activate (đợi 10 phút sau khi đăng ký)

**Error: "PostgreSQL connection failed"**
→ Check credentials in all 3 PostgreSQL nodes

**No alerts created**
→ Weather is good! Try manual test with different location

**Notifications not sent**
→ Check if farmers exist in affected wards

## 📚 OpenWeather API Info

**Free Tier Limits:**
- 1,000 calls/day
- 60 calls/minute
- 5 day / 3 hour forecast

**Weather Condition IDs:**
- 2xx: Thunderstorm
- 3xx: Drizzle
- 5xx: Rain
- 6xx: Snow
- 7xx: Atmosphere (fog, etc)
- 800: Clear
- 80x: Clouds

## 🎓 Next Steps

1. ✅ Import workflow
2. ✅ Add API key
3. ✅ Configure PostgreSQL
4. ✅ Activate workflow
5. ✅ Test manually
6. ⏳ Wait for next day 6:00 AM
7. 📱 Check notifications!

---

**Need help?** Check n8n execution logs or Django admin panel.
