# 🤖 Hướng Dẫn Setup Chatbot với N8N

## 📋 Tổng Quan

Chatbot AgriSupply sử dụng workflow N8N để:
- Phân loại ý định người dùng (intent classification)
- Truy vấn database PostgreSQL
- Format câu trả lời theo ngữ cảnh
- Lưu lịch sử chat vào ChatLogs

## 🏗️ Kiến Trúc

```
Frontend (React)
    ↓ POST /api/chatbot/chat/
Django API (Backend)
    ↓ POST http://localhost:5678/webhook/agri-chat
N8N Workflow
    ↓ Query PostgreSQL
    ↓ Format Response
    ↓ Return JSON
Backend → Frontend
```

## 🚀 Các Bước Setup

### Bước 1: Cài Đặt N8N

```bash
# Sử dụng npm (recommended)
npm install -g n8n

# Hoặc sử dụng Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Bước 2: Khởi Động N8N

```bash
# Chạy n8n
n8n start

# Hoặc với custom port
n8n start --tunnel
```

Mở trình duyệt: http://localhost:5678

### Bước 3: Import Workflow

1. Đăng nhập N8N (tạo tài khoản nếu chưa có)
2. Click **"+"** → **"Import from File"**
3. Copy nội dung từ file JSON workflow (đã gửi)
4. Paste vào hoặc upload file
5. Click **"Import"**

### Bước 4: Cấu Hình PostgreSQL Connection

1. Trong workflow, click vào node **"Query: Prices"**
2. Click **"Create New Credential"**
3. Điền thông tin:
   - **Host**: `localhost` hoặc `127.0.0.1`
   - **Database**: `agrisupply_db` (tên database của bạn)
   - **User**: `postgres` (username PostgreSQL)
   - **Password**: mật khẩu PostgreSQL của bạn
   - **Port**: `5432` (default)
   - **SSL**: `disable` (hoặc `allow`)

4. Click **"Save"**
5. **Áp dụng credential này cho TẤT CẢ các Query nodes**:
   - Query: Prices
   - Query: Tasks
   - Query: Recommendations
   - Query: Seasons
   - Query: Alerts
   - Query: Farms
   - Query: FAQ

### Bước 5: Test Webhook

1. Click vào node **"Webhook"**
2. Xem **Webhook URL**: `http://localhost:5678/webhook/agri-chat`
3. Click **"Execute Workflow"** (nút Play ở góc trên)
4. Workflow chuyển sang chế độ **"Listening"**

Test bằng curl:

```bash
curl -X POST http://localhost:5678/webhook/agri-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "giá thị trường hôm nay", "user_id": 1}'
```

Kết quả mong đợi:

```json
{
  "answer": "📊 **Giá thị trường hôm nay:**\n\n1. **Cà chua**: 25,000 đ/kg\n   📍 Chợ Bình Điền\n\n..."
}
```

### Bước 6: Active Workflow

1. Sau khi test thành công, click **"Active"** (toggle ở góc trên)
2. Workflow sẽ chạy liên tục ngay cả khi đóng browser
3. Webhook sẽ luôn lắng nghe request

### Bước 7: Chạy Backend Django

```bash
cd backend
python manage.py runserver
```

Backend API sẽ call n8n webhook khi user gửi message.

### Bước 8: Chạy Frontend

```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000/farmer/support

## 🎯 Intent Classification

Workflow phân loại 8 loại câu hỏi:

| Intent | Keywords | Response |
|--------|----------|----------|
| **market_price** | giá, price, bao nhiêu | Query MarketPrices → Format giá |
| **daily_tasks** | hôm nay, công việc, làm gì | Query DailyTasks → Format task list |
| **recommendations** | trồng, khuyến nghị, nên, gợi ý | Query PlantingRecommendations |
| **seasons** | vụ mùa, mùa vụ, tiến độ | Query Seasons → Format season info |
| **alerts** | cảnh báo, alert, thời tiết | Query Alerts → Format cảnh báo |
| **farms** | trang trại, farm, đất | Query Farms → Format farm info |
| **help** | help, trợ giúp, hướng dẫn | Hiển thị menu hướng dẫn |
| **faq** | (default) | Query FAQs → Top 5 câu hỏi |

## 📊 Query Examples

### 1. Market Prices

```sql
SELECT c.name AS crop_name, mp.price_avg, mp.market_location, mp.price_date 
FROM market_prices mp 
JOIN crops c ON mp.crop_id = c.id 
ORDER BY mp.price_date DESC 
LIMIT 5;
```

### 2. Daily Tasks (User-specific)

```sql
SELECT dt.task_name, dt.description, c.name as crop_name, dt.due_date 
FROM daily_tasks dt 
JOIN seasons s ON dt.season_id = s.id 
JOIN crops c ON s.crop_id = c.id 
JOIN farms f ON s.farm_id = f.id 
JOIN farmers fr ON f.farmer_id = fr.id 
WHERE fr.user_id = {{ $json.user_id }} AND dt.is_completed = false 
ORDER BY dt.due_date ASC 
LIMIT 10;
```

### 3. Recommendations

```sql
SELECT c.name AS crop_name, pr.expected_price, pr.reason, 
       pr.recommended_start_date, pr.priority_level 
FROM planting_recommendations pr 
JOIN crops c ON pr.crop_id = c.id 
WHERE pr.status = 'active' 
ORDER BY pr.priority_level ASC 
LIMIT 5;
```

## 🔧 Troubleshooting

### Lỗi: Cannot connect to n8n

```bash
# Kiểm tra n8n đang chạy
curl http://localhost:5678

# Nếu không chạy, start lại
n8n start
```

### Lỗi: PostgreSQL connection failed

1. Check PostgreSQL service:

```bash
# Windows
Get-Service postgresql*

# Nếu stopped, start lại
Start-Service postgresql-x64-14
```

2. Check credentials trong N8N workflow

3. Test connection:

```bash
psql -U postgres -d agrisupply_db -c "SELECT 1"
```

### Lỗi: 404 Not Found /api/chatbot/chat/

```bash
# Kiểm tra Django server
curl http://127.0.0.1:8000/api/chatbot/chat/ -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### Workflow không trả về data

1. Click vào từng node và xem **"Output"**
2. Check query có lỗi syntax không
3. Đảm bảo database có dữ liệu (run `python check_market_data.py`)

## 📝 Test Cases

### Test 1: Giá Thị Trường

```
Input: "giá cà chua hôm nay"
Expected: Danh sách giá 5 loại rau với location và date
```

### Test 2: Công Việc

```
Input: "hôm nay tôi phải làm gì?"
Expected: 10 công việc chưa hoàn thành của user
```

### Test 3: Khuyến Nghị

```
Input: "nên trồng cây gì?"
Expected: 5 khuyến nghị từ HTX với giá dự kiến
```

### Test 4: Vụ Mùa

```
Input: "tiến độ vụ mùa của tôi"
Expected: 5 vụ mùa gần nhất với status và ngày thu hoạch
```

### Test 5: Help

```
Input: "trợ giúp"
Expected: Menu hướng dẫn các loại câu hỏi
```

## 🎨 Customization

### Thêm Intent Mới

1. **Update Classify Intent node**:

```javascript
else if (messageLower.includes('keyword')) {
  intent = 'new_intent';
}
```

2. **Thêm IF node** mới cho intent

3. **Thêm Query node** để lấy data

4. **Thêm Format node** để format response

5. **Connect** tất cả nodes và test

### Thay Đổi Response Format

Edit **Format nodes** (ví dụ: Format: Prices):

```javascript
const data = $input.all();
let response = "🎉 Custom format:\n\n";
data.forEach((item, i) => {
  const d = item.json;
  response += `✨ ${d.crop_name}: ${d.price_avg}\n`;
});
return { json: { answer: response } };
```

### Thêm AI (GPT-4) cho FAQ Fallback

1. Thay **Query: FAQ** bằng **OpenAI node**
2. Configure với API key
3. Prompt: "You are an agricultural assistant. Answer: {{$json.message}}"
4. Format response và return

## 🔐 Security Notes

1. **Authentication**: Backend yêu cầu JWT token
2. **User Context**: Query chỉ trả dữ liệu của user hiện tại (filter by user_id)
3. **N8N Access**: Chỉ localhost, không expose public
4. **Database**: Read-only queries, không update/delete

## 📚 Resources

- N8N Docs: https://docs.n8n.io/
- PostgreSQL Nodes: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/
- Webhook Trigger: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## ✅ Checklist

- [ ] N8N installed và running tại :5678
- [ ] Workflow imported thành công
- [ ] PostgreSQL credentials configured
- [ ] All Query nodes có credential
- [ ] Workflow tested với curl
- [ ] Workflow activated (toggle ON)
- [ ] Django backend running tại :8000
- [ ] Frontend running tại :3000
- [ ] Test chat tại /farmer/support
- [ ] Chat logs saved vào database

## 🎉 Success!

Khi hoàn thành:
1. Login vào http://localhost:3000
2. Vào **Dashboard** → **💬 Trợ Giúp**
3. Gõ: "giá thị trường hôm nay"
4. Bot sẽ trả lời với dữ liệu thực từ database!

---

**Powered by N8N + Django + PostgreSQL + Next.js**
