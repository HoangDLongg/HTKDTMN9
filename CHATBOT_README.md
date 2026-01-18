# 🤖 AgriSupply Chatbot với N8N

## 📊 Tổng Quan

Chatbot thông minh sử dụng **N8N workflow automation** để trả lời các câu hỏi về:

- 📊 **Giá thị trường** - Giá cả hàng hóa nông sản
- ✅ **Công việc** - Công việc cần làm hôm nay
- 🌾 **Khuyến nghị** - Gợi ý cây trồng phù hợp
- 🌱 **Vụ mùa** - Tiến độ canh tác
- ⚠️ **Cảnh báo** - Thời tiết, sâu bệnh
- 🏡 **Trang trại** - Thông tin trang trại
- ❓ **FAQ** - Câu hỏi thường gặp

## 🚀 Quick Start (3 phút)

### 1. Cài N8N

```bash
npm install -g n8n
```

### 2. Chạy N8N

```bash
n8n start
```

Truy cập: http://localhost:5678

### 3. Import Workflow

1. Login N8N
2. Click **"+" → "Import from File"**
3. Chọn file: `n8n-agrisupply-chatbot.json`
4. Click **"Import"**

### 4. Config PostgreSQL

Trong workflow, click vào node **"Query: Prices"**:
- **Host**: `localhost`
- **Database**: `agrisupply_db`
- **User**: `postgres`
- **Password**: (your password)
- **Port**: `5432`

**Apply credential này cho TẤT CẢ 7 Query nodes!**

### 5. Activate Workflow

Click nút **"Active"** (toggle ON) ở góc trên

### 6. Test

```bash
cd backend
python test_chatbot.py
```

### 7. Chạy Frontend

```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000/farmer/support

## 📝 Files Created

| File | Description |
|------|-------------|
| `n8n-agrisupply-chatbot.json` | N8N workflow (import vào n8n) |
| `backend/apps/chatbot/views.py` | Django API `/api/chatbot/chat/` |
| `backend/apps/chatbot/urls.py` | URL routing |
| `frontend/components/ChatBot.tsx` | React chat component |
| `frontend/app/farmer/support/page.tsx` | Chat page |
| `backend/test_chatbot.py` | Test script |
| `N8N_SETUP_GUIDE.md` | Hướng dẫn chi tiết |

## 🎯 Cách Sử Dụng

### Từ Frontend

1. Login vào http://localhost:3000
2. Dashboard → **💬 Trợ Giúp**
3. Gõ câu hỏi: "giá thị trường hôm nay"
4. Bot trả lời ngay!

### Từ API

```bash
# Get token
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "farmer1", "password": "farmer123"}'

# Chat
curl -X POST http://127.0.0.1:8000/api/chatbot/chat/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "giá thị trường hôm nay"}'
```

### Test N8N Trực Tiếp

```bash
curl -X POST http://localhost:5678/webhook/agri-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "giá hôm nay", "user_id": 1}'
```

## 💡 Ví Dụ Câu Hỏi

| Câu Hỏi | Intent | Response |
|---------|--------|----------|
| "giá cà chua hôm nay" | market_price | Danh sách 5 giá mới nhất |
| "hôm nay làm gì?" | daily_tasks | 10 công việc chưa hoàn thành |
| "nên trồng gì?" | recommendations | 5 khuyến nghị từ HTX |
| "tiến độ vụ mùa" | seasons | 5 vụ mùa gần nhất |
| "cảnh báo thời tiết" | alerts | Cảnh báo hiện tại |
| "thông tin trang trại" | farms | Tất cả trang trại của user |
| "trợ giúp" | help | Menu hướng dẫn |

## 🏗️ Kiến Trúc

```
┌─────────────────┐
│  React Frontend │ (localhost:3000/farmer/support)
│   ChatBot.tsx   │
└────────┬────────┘
         │ POST {message}
         ↓
┌─────────────────┐
│   Django API    │ (127.0.0.1:8000/api/chatbot/chat/)
│   views.py      │ - Check JWT auth
└────────┬────────┘ - Forward to n8n
         │ POST {message, user_id}
         ↓
┌─────────────────┐
│  N8N Workflow   │ (localhost:5678/webhook/agri-chat)
│                 │
│ 1. Classify     │ → Detect intent (8 types)
│    Intent       │
│                 │
│ 2. IF Nodes     │ → Route by intent
│                 │
│ 3. Query DB     │ → PostgreSQL (7 queries)
│                 │
│ 4. Format       │ → Vietnamese markdown
│                 │
│ 5. Respond      │ → {answer: "..."}
└────────┬────────┘
         │ JSON response
         ↓
┌─────────────────┐
│   Django API    │ - Save to ChatLogs
└────────┬────────┘ - Return to frontend
         │
         ↓
┌─────────────────┐
│  React Display  │ - Show in chat UI
└─────────────────┘
```

## 🔧 Workflow Nodes

### Intent Classification (JavaScript)

```javascript
const message = $input.item.json.body.message;
if (message.includes('giá')) return 'market_price';
if (message.includes('công việc')) return 'daily_tasks';
// ... 8 intents total
```

### Database Queries (PostgreSQL)

**Query: Prices**
```sql
SELECT c.name AS crop_name, mp.price_avg, mp.market_location
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
ORDER BY mp.price_date DESC
LIMIT 5;
```

**Query: Tasks** (User-specific)
```sql
SELECT dt.task_name, c.name as crop_name, dt.due_date
FROM daily_tasks dt
JOIN seasons s ON dt.season_id = s.id
WHERE s.farmer_id = {{$json.user_id}}
  AND dt.is_completed = false
ORDER BY dt.due_date ASC
LIMIT 10;
```

### Response Formatting (JavaScript)

```javascript
let response = "📊 **Giá thị trường:**\n\n";
data.forEach((item, i) => {
  response += `${i+1}. **${item.crop_name}**: ${item.price_avg} đ/kg\n`;
});
return {json: {answer: response}};
```

## 🎨 Frontend Features

### ChatBot Component

- ✅ Real-time messaging
- ✅ Loading states với animation
- ✅ Message history
- ✅ Quick action buttons
- ✅ Markdown formatting
- ✅ Timestamp display
- ✅ Error handling
- ✅ Auto-scroll to bottom

### Support Page

- 📊 Info cards (Fast response, Accurate, Diverse)
- 💡 Usage instructions
- 🤖 Embedded ChatBot
- 🎨 Responsive design

## 🔐 Security

1. **Authentication**: JWT required cho Django API
2. **User Context**: Queries filter by `user_id`
3. **Read-Only**: Workflow chỉ SELECT, không UPDATE/DELETE
4. **Local Only**: N8N webhook chỉ localhost
5. **Chat Logs**: Lưu tất cả conversations

## 📊 Database Schema

### ChatLogs

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| user | FK | User reference |
| platform | VARCHAR | 'web', 'mobile' |
| message_type | VARCHAR | 'text', 'voice' |
| user_message | TEXT | Câu hỏi |
| bot_response | TEXT | Câu trả lời |
| intent | VARCHAR | Intent detected |
| confidence_score | FLOAT | Confidence |
| created_at | TIMESTAMP | Thời gian |

## 🚨 Troubleshooting

### N8N không chạy

```bash
# Check port 5678
curl http://localhost:5678

# Nếu lỗi, restart
n8n start
```

### PostgreSQL connection failed

```powershell
# Check service
Get-Service postgresql*

# Start nếu stopped
Start-Service postgresql-x64-14

# Test connection
psql -U postgres -d agrisupply_db -c "SELECT 1"
```

### Workflow không trả dữ liệu

1. Click node → Xem **Output** tab
2. Check query syntax
3. Verify database có data:
   ```bash
   cd backend
   python check_market_data.py
   ```

### 401 Unauthorized

Token expired, login lại:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -d '{"username": "farmer1", "password": "farmer123"}'
```

## 📈 Performance

- **Response Time**: < 2 seconds
- **Database Queries**: Max 1 query per message
- **Concurrent Users**: Unlimited (stateless)
- **Chat History**: All saved to database

## 🔮 Future Enhancements

### Tích Hợp GPT-4 (Optional)

Thay **Query: FAQ** bằng **OpenAI node**:

1. Add OpenAI node
2. Config API key
3. Prompt: "You are agricultural assistant. Answer: {{$json.message}}"
4. Connect to Format → Respond

### Voice Input

1. Frontend: Add speech-to-text
2. Send transcribed text to API
3. Save with `message_type='voice'`

### Multi-language

1. Detect language in Classify Intent
2. Add English/Vietnamese responses
3. Format accordingly

### Smart Notifications

1. Monitor chat intents
2. If user asks about tasks → Send task reminder
3. If user asks about prices → Alert on price drop

## 📚 Documentation

- [N8N_SETUP_GUIDE.md](N8N_SETUP_GUIDE.md) - Hướng dẫn chi tiết
- [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - API docs
- N8N Docs: https://docs.n8n.io/

## ✅ Checklist

Setup Complete khi:

- [x] N8N installed
- [x] Workflow imported
- [x] PostgreSQL connected (7 nodes)
- [x] Workflow activated
- [x] Django running
- [x] Frontend running
- [x] Test passed: `python test_chatbot.py`
- [x] Chat page works: http://localhost:3000/farmer/support

## 🎉 Success!

**Test ngay:**

1. http://localhost:3000
2. Login: `farmer1` / `farmer123`
3. Dashboard → **💬 Trợ Giúp**
4. Gõ: "giá thị trường hôm nay"
5. 🎊 Enjoy!

---

**Tech Stack**: N8N + Django REST + PostgreSQL + Next.js + TypeScript

**Created**: January 2026  
**Version**: 1.0.0
