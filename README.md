# 📋 PHÂN TÍCH THIẾT KẾ HỆ THỐNG - QUẢN LÝ CHUỖI CUNG ỨNG NÔNG SẢN

**Tài liệu phân tích:** Kiến trúc hệ thống & Luồng hoạt động  
**Ngày tạo:** 18/01/2026  
**Phiên bản:** 1.0

---

## 📚 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Cơ Sở Dữ Liệu](#3-cơ-sở-dữ-liệu)
4. [Luồng Hoạt Động Chính](#4-luồng-hoạt-động-chính)
5. [Các Module Chức Năng](#5-các-module-chức-năng)
6. [Tích Hợp Bên Thứ 3](#6-tích-hợp-bên-thứ-3)
7. [Bảo Mật & Phân Quyền](#7-bảo-mật--phân-quyền)
8. [Hiệu Năng & Mở Rộng](#8-hiệu-năng--mở-rộng)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Giới Thiệu

**Tên hệ thống:** Agricultural Supply Chain Management System  
**Mục đích:** Quản lý toàn bộ chuỗi cung ứng nông sản từ sản xuất đến thị trường

### 1.2. Các Bên Liên Quan

```
┌─────────────────────────────────────────────────────────┐
│                    STAKEHOLDERS                         │
├─────────────────────────────────────────────────────────┤
│  👨‍🌾 Nông dân (Farmers)                                  │
│  🏢 Hợp tác xã (Cooperatives)                           │
│  👨‍💼 Quản trị viên (Administrators)                      │
│  📊 Nhà phân tích (Analysts)                            │
│  🤖 Hệ thống tự động (Automation Systems)               │
└─────────────────────────────────────────────────────────┘
```

### 1.3. Công Nghệ Sử Dụng

| Thành Phần | Công Nghệ | Phiên Bản |
|------------|-----------|-----------|
| **Frontend** | Next.js + TypeScript | 14.x |
| **Backend** | Django + Django REST Framework | 5.0+ |
| **Database** | PostgreSQL | 14+ |
| **BI Tool** | Metabase | Latest |
| **Automation** | n8n (Workflow) | Latest |
| **AI Integration** | Google Gemini API | v1 |
| **Containerization** | Docker + Docker Compose | Latest |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                       │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Farmer   │  │ HTX User │  │  Admin   │  │ Analytics│      │
│  │   UI      │  │    UI    │  │    UI    │  │    UI    │      │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                           │
                   HTTP/HTTPS (Port 3000)
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   FRONTEND SERVER                                │
│              Next.js (SSR + CSR) - Port 3000                     │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  • Server Components   • API Routes                  │       │
│  │  • Client Components   • Authentication              │       │
│  │  • Static Generation   • State Management            │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    REST API (Port 8000)
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    BACKEND SERVER                                │
│              Django + DRF - Port 8000                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  APPS STRUCTURE:                                      │       │
│  │  • core/         (Users, Auth, Roles)                │       │
│  │  • locations/    (Provinces, Districts, Wards)       │       │
│  │  • crops/        (Crops, Technical Processes)        │       │
│  │  • farms/        (Cooperatives, Farmers, Farms)      │       │
│  │  • seasons/      (Seasons, Daily Tasks, Logs)        │       │
│  │  • market/       (Prices, Forecasts)                 │       │
│  │  • chatbot/      (Chat Logs, FAQs, Alerts)           │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                   PostgreSQL Protocol
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   DATABASE LAYER                                 │
│                PostgreSQL - Port 5432                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  29 TABLES:                                           │       │
│  │  • users, roles, cooperatives, farmers, farms        │       │
│  │  • crops, technical_processes, seasons                │       │
│  │  • daily_tasks, farming_logs, market_prices          │       │
│  │  • alerts, notifications, chat_logs                   │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                   AUXILIARY SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Metabase    │  │     n8n      │  │ Google Gemini│          │
│  │  (Port 3001) │  │  (Port 5678) │  │   API        │          │
│  │  BI & Charts │  │  Workflows   │  │   AI Chat    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Luồng Dữ Liệu (Data Flow)

```
User Input → Frontend (Next.js) → Backend API (Django) → Database (PostgreSQL)
     ↓                                  ↑                        ↓
     ↓                            n8n Workflows            Metabase Query
     ↓                                  ↑                        ↓
     ↓                          Automation Tasks          Analytics Data
     ↓                                  ↑                        ↓
     └──────────────────────────────────┴────────────────────────┘
                              Response to User
```

---

## 3. CƠ SỞ DỮ LIỆU

### 3.1. Schema Tổng Quan

**Tổng số bảng:** 29 tables  
**File schema:** `databaseTrang-Longfix/FULL_SETUP.sql`

### 3.2. Các Nhóm Bảng Chính

#### 📊 **Group 1: User Management (Quản lý người dùng)**
```sql
roles                    -- Vai trò (Admin, HTX, Farmer)
users                    -- Người dùng
```

#### 🌍 **Group 2: Location Management (Quản lý địa lý)**
```sql
provinces               -- Tỉnh/Thành phố
districts               -- Quận/Huyện
wards                   -- Xã/Phường
```

#### 🌱 **Group 3: Crop & Process Management**
```sql
crops                   -- Cây trồng
technical_processes     -- Quy trình kỹ thuật
process_stages          -- Các giai đoạn
stage_tasks             -- Công việc theo giai đoạn
```

#### 🏢 **Group 4: Farm Management**
```sql
cooperatives           -- Hợp tác xã
farmers                -- Nông dân
farms                  -- Vùng trồng
```

#### 🌾 **Group 5: Season & Task Management**
```sql
seasons                -- Vụ mùa
daily_tasks            -- Công việc hàng ngày
farming_logs           -- Nhật ký canh tác
season_registrations   -- Đăng ký vụ mùa
```

#### 💰 **Group 6: Market & Forecast**
```sql
market_prices          -- Giá thị trường
price_sources          -- Nguồn giá
demand_forecasts       -- Dự báo nhu cầu
planting_recommendations -- Khuyến nghị trồng trọt
```

#### 🤖 **Group 7: AI & Automation**
```sql
chat_logs              -- Lịch sử chat
faqs                   -- Câu hỏi thường gặp
alerts                 -- Cảnh báo
notifications          -- Thông báo
```

#### 📈 **Group 8: Views**
```sql
active_seasons_summary  -- View: Tổng hợp vụ mùa đang hoạt động
latest_market_prices    -- View: Giá thị trường mới nhất
```

### 3.3. Quan Hệ Chính

```
users ──┬── farmers ── farms ── seasons ── daily_tasks
        │                                      │
        └── cooperatives ──────────────────────┤
                                               │
crops ── technical_processes ──────────────────┤
                                               │
market_prices ─────────────────────────────────┤
                                               │
alerts ──── notifications ─────────────────────┘
```

---

## 4. LUỒNG HOẠT ĐỘNG CHÍNH

### 4.1. User Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└──────────────────────────────────────────────────────────────┘

1. User Access System
   │
   ├─→ Login Page (/login)
   │   │
   │   ├─→ Input: username + password
   │   │
   │   ├─→ POST /api/auth/login/
   │   │   │
   │   │   ├─→ Django validates credentials
   │   │   ├─→ Check user.is_active = TRUE
   │   │   ├─→ Get user.role_id
   │   │   │
   │   │   ├─→ Success:
   │   │   │   ├─→ Create session
   │   │   │   ├─→ Set cookies (httpOnly, secure)
   │   │   │   ├─→ Return user data + role
   │   │   │   └─→ Redirect to dashboard
   │   │   │
   │   │   └─→ Failure:
   │   │       └─→ Return 401 Unauthorized
   │   │
   │   └─→ Client stores session
   │       └─→ Navigate to appropriate dashboard
   │
   └─→ Protected Routes
       │
       ├─→ Middleware checks session
       ├─→ GET /api/auth/me/
       │   │
       │   ├─→ Valid session: Return user + role
       │   └─→ Invalid: Redirect to /login
       │
       └─→ Role-based routing:
           ├─→ Admin → /admin/*
           ├─→ HTX → /cooperative/*
           └─→ Farmer → /farmer/*
```

### 4.2. Season Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  SEASON LIFECYCLE FLOW                        │
└──────────────────────────────────────────────────────────────┘

Step 1: CREATE SEASON (Tạo vụ mùa)
────────────────────────────────────
Farmer/HTX → Select Farm
          → Select Crop
          → Select Technical Process
          → Set Start Date
          → POST /api/seasons/

Backend:
  ├─→ Generate season_code (unique)
  ├─→ Calculate expected_harvest_date
  ├─→ Set status = 'planning'
  ├─→ INSERT INTO seasons
  └─→ TRIGGER: generate_daily_tasks_for_season()
      │
      └─→ Read technical_process → process_stages → stage_tasks
          └─→ For each stage_task:
              ├─→ Calculate task_date = start_date + day_number
              └─→ INSERT INTO daily_tasks

Result: Season created with all daily tasks scheduled

────────────────────────────────────
Step 2: START SEASON (Bắt đầu canh tác)
────────────────────────────────────
User → Click "Bắt đầu vụ mùa"
    → PUT /api/seasons/{id}/

Backend:
  └─→ UPDATE seasons SET status = 'in_progress'

Result: Tasks become active

────────────────────────────────────
Step 3: DAILY TASK EXECUTION
────────────────────────────────────
System (Daily):
  └─→ n8n Workflow triggers every morning
      └─→ Query tasks with due_date = TODAY
          └─→ Send notifications to farmers

Farmer:
  ├─→ View today's tasks
  ├─→ Mark task as complete
  └─→ POST /api/daily-tasks/{id}/complete/
      │
      └─→ UPDATE daily_tasks SET 
            is_completed = TRUE,
            completed_at = NOW()

────────────────────────────────────
Step 4: LOGGING ACTIVITIES
────────────────────────────────────
Farmer → Add farming log
      → POST /api/farming-logs/

Data: {
  season_id,
  daily_task_id (optional),
  log_date,
  activity_type,
  description,
  materials_used,
  cost,
  images[]
}

Result: Activity recorded with evidence

────────────────────────────────────
Step 5: HARVEST & COMPLETION
────────────────────────────────────
Farmer → Input harvest data
      → PUT /api/seasons/{id}/

Data: {
  status: 'completed',
  actual_harvest_date,
  actual_yield (kg)
}

Backend:
  ├─→ UPDATE seasons
  ├─→ Calculate yield per hectare
  └─→ Generate harvest report

Result: Season completed, data for analytics
```

### 4.3. Market Price Flow

```
┌──────────────────────────────────────────────────────────────┐
│              MARKET PRICE MANAGEMENT FLOW                     │
└──────────────────────────────────────────────────────────────┘

Method 1: MANUAL INPUT
───────────────────────
Admin/HTX → Enter market prices
          → POST /api/market-prices/

Data: {
  crop_id,
  price_date,
  price_min,
  price_max,
  price_avg,
  market_location,
  source_id
}

Method 2: AUTOMATED CRAWLING
──────────────────────────────
n8n Workflow:
  └─→ Schedule: Daily 6:00 AM
      └─→ Crawl price websites
          └─→ Parse price data
              └─→ POST /api/market-prices/bulk/

Method 3: API INTEGRATION
───────────────────────────
External System → Webhook /api/market-prices/webhook/
                → Validate & store data

DATA FLOW TO ANALYTICS:
────────────────────────
market_prices → Metabase queries → Charts
                                    │
                                    └─→ Display on dashboards
```

### 4.4. Chatbot Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   CHATBOT FLOW (n8n + Gemini)                │
└──────────────────────────────────────────────────────────────┘

User Input → Frontend Chat Widget
          → POST /api/chatbot/message/

Backend:
  ├─→ Log to chat_logs table
  ├─→ Extract intent & entities
  │
  ├─→ Check FAQs database
  │   ├─→ Match found: Return FAQ answer
  │   └─→ No match: Forward to Gemini API
  │
  └─→ Call Google Gemini API:
      ├─→ Context: User's farm, crops, seasons
      ├─→ History: Previous chat messages
      └─→ Generate response
          │
          ├─→ Store response in chat_logs
          └─→ Return to frontend

Frontend:
  └─→ Display bot response
      └─→ Show suggested actions

Workflow Integration (n8n):
  └─→ If intent = "create_alert":
      └─→ Trigger workflow
          └─→ Create notification
              └─→ Send to relevant users
```

### 4.5. Alert & Notification Flow

```
┌──────────────────────────────────────────────────────────────┐
│              ALERT & NOTIFICATION SYSTEM                      │
└──────────────────────────────────────────────────────────────┘

TRIGGER SOURCES:
────────────────
1. System Events:
   ├─→ Task overdue
   ├─→ Season milestone
   └─→ Weather alert

2. Manual Creation:
   └─→ Admin/HTX creates alert

3. AI Detection:
   └─→ Gemini detects issue
       └─→ Create alert

ALERT CREATION:
────────────────
Source → POST /api/alerts/

Data: {
  alert_type,
  severity,
  title,
  message,
  affected_area,
  target_crops[]
}

Backend:
  ├─→ INSERT INTO alerts
  └─→ Get affected farmers/HTX
      └─→ For each user:
          └─→ INSERT INTO notifications
              └─→ Trigger n8n workflow
                  └─→ Send notification:
                      ├─→ In-app notification
                      ├─→ Email (optional)
                      └─→ SMS (optional)

USER RECEIVES:
───────────────
Frontend:
  ├─→ Notification badge appears
  ├─→ Real-time update (WebSocket/Polling)
  └─→ User clicks notification
      └─→ View alert details
          └─→ Mark as read
              └─→ PUT /api/notifications/{id}/read/
```

---

## 5. CÁC MODULE CHỨC NĂNG

### 5.1. Admin Module

**Route:** `/admin/*`  
**Quyền:** Chỉ Quản trị viên

#### Chức năng:
```
📊 Dashboard
  └─→ Tổng quan toàn hệ thống
  └─→ Thống kê theo thời gian thực

👥 User Management (/admin/users)
  └─→ CRUD users
  └─→ Quản lý roles
  └─→ Kích hoạt/Vô hiệu hóa tài khoản

🏢 Cooperative Management (/admin/cooperatives)
  └─→ CRUD cooperatives
  └─→ Gán manager
  └─→ Xem thành viên

🌱 Crop Management (/admin/crops)
  └─→ CRUD crops
  └─→ Quản lý danh mục

⚙️ Technical Process (/admin/technical-processes)
  └─→ Tạo quy trình kỹ thuật
  └─→ Định nghĩa stages & tasks

💰 Market Management (/admin/market)
  └─→ Nhập giá thị trường
  └─→ Quản lý nguồn dữ liệu

📈 Analytics (/admin/analytics)
  └─→ Metabase dashboard
  └─→ Báo cáo tổng hợp

📋 Reports (/admin/reports)
  └─→ Xuất báo cáo
  └─→ Tùy chỉnh filters
```

### 5.2. Cooperative (HTX) Module

**Route:** `/cooperative/*`  
**Quyền:** Quản lý HTX

#### Chức năng:
```
📊 Dashboard
  └─→ Tổng quan HTX
  └─→ KPIs của thành viên

👨‍🌾 Farmer Management
  └─→ Danh sách nông dân
  └─→ Thêm/Xóa thành viên
  └─→ Xem hoạt động

🌾 Season Management
  └─→ Xem tất cả vụ mùa của HTX
  └─→ Giám sát tiến độ
  └─→ Phê duyệt kế hoạch

📈 Analytics
  └─→ Dashboard HTX trên Metabase
  └─→ So sánh hiệu suất

💬 Communication
  └─→ Gửi thông báo đến nông dân
  └─→ Tạo cảnh báo
  └─→ Hỗ trợ qua chat

📊 Production Reports
  └─→ Báo cáo sản lượng
  └─→ Dự báo thu hoạch
```

### 5.3. Farmer Module

**Route:** `/farmer/*`  
**Quyền:** Nông dân

#### Chức năng:
```
📊 Dashboard
  └─→ Tổng quan vùng trồng
  └─→ Công việc hôm nay

🌾 My Farms
  └─→ Danh sách vùng trồng
  └─→ Chi tiết từng vùng
  └─→ Thêm vùng mới

🌱 Seasons
  └─→ Vụ mùa hiện tại
  └─→ Lịch sử vụ mùa
  └─→ Tạo vụ mùa mới

✅ Daily Tasks
  └─→ Công việc hôm nay
  └─→ Đánh dấu hoàn thành
  └─→ Xem lịch công việc

📝 Farming Logs
  └─→ Ghi nhật ký
  └─→ Upload hình ảnh
  └─→ Ghi chú chi tiết

💰 Market Prices
  └─→ Xem giá hiện tại
  └─→ So sánh giá
  └─→ Dự báo xu hướng

🤖 Chatbot
  └─→ Hỏi đáp kỹ thuật
  └─→ Khuyến nghị
  └─→ Cảnh báo

📊 My Reports
  └─→ Báo cáo cá nhân
  └─→ Hiệu quả sản xuất
```

---

## 6. TÍCH HỢP BÊN THỨ 3

### 6.1. Metabase Integration

```
┌─────────────────────────────────────────┐
│         METABASE ARCHITECTURE           │
└─────────────────────────────────────────┘

Setup:
  ├─→ Docker container: Port 3001
  ├─→ Connect to PostgreSQL
  └─→ Create public dashboards

Queries (18 charts total):
  ├─→ Production Charts (1.1 - 1.5)
  ├─→ Market Price Charts (2.1 - 2.6)
  └─→ Task Progress Charts (3.1 - 3.6)

Public URLs:
  ├─→ Admin Dashboard:
  │   └─→ /public/dashboard/7c1bcf24-...
  └─→ HTX Dashboard:
      └─→ /public/dashboard/0a895c3d-...

Embedding:
  └─→ <iframe src="metabase_url" />
      └─→ Displayed in frontend pages
```

**File queries:** `databaseTrang-Longfix/metabase_charts.sql`

### 6.2. n8n Workflow Integration

```
┌─────────────────────────────────────────┐
│          N8N WORKFLOWS                  │
└─────────────────────────────────────────┘

Workflow 1: Daily Task Reminder
────────────────────────────────
Trigger: Schedule (Daily 6:00 AM)
  └─→ Query tasks with due_date = TODAY
      └─→ Group by farmer
          └─→ For each farmer:
              └─→ Send notification
                  └─→ In-app + Email

Workflow 2: Weather Alert System
─────────────────────────────────
Trigger: Webhook from weather API
  └─→ Parse weather data
      └─→ Check affected areas
          └─→ Create alerts
              └─→ Notify farmers

Workflow 3: Market Price Crawler
──────────────────────────────────
Trigger: Schedule (Daily 8:00 AM)
  └─→ HTTP Request to price websites
      └─→ Parse HTML/JSON
          └─→ Extract prices
              └─→ POST to Django API

Workflow 4: Chatbot Integration
─────────────────────────────────
Trigger: Webhook from Django
  └─→ Process message
      └─→ Call Gemini API
          └─→ Return response
```

**Files:**
- `n8n-agrisupply-chatbot.json`
- `n8n-weather-alert-system.json`

### 6.3. Google Gemini AI

```
┌─────────────────────────────────────────┐
│        GEMINI API INTEGRATION           │
└─────────────────────────────────────────┘

Use Cases:
  ├─→ Agricultural Q&A
  ├─→ Pest/Disease diagnosis
  ├─→ Planting recommendations
  └─→ Market insights

Implementation:
  Backend → chatbot/views.py
  └─→ def gemini_chat(request):
      ├─→ Get user message
      ├─→ Fetch user context (farm, crops)
      ├─→ Build prompt with context
      ├─→ Call Gemini API
      └─→ Return AI response

Context Provided:
  ├─→ User's crops
  ├─→ Current seasons
  ├─→ Recent tasks
  ├─→ Weather data
  └─→ Market prices
```

---

## 7. BẢO MẬT & PHÂN QUYỀN

### 7.1. Authentication

```
Method: Session-based authentication
  └─→ Django sessions + HTTP-only cookies
      └─→ Secure in production (HTTPS)

Login Process:
  ├─→ Username + Password
  ├─→ Django authenticate()
  ├─→ Create session
  └─→ Set cookies

Session Storage:
  └─→ Database-backed sessions
      └─→ Table: django_session
```

### 7.2. Authorization (Role-Based Access Control)

```
┌─────────────────────────────────────────┐
│           RBAC MATRIX                   │
├─────────────────┬───────────────────────┤
│ Resource        │ Admin │ HTX │ Farmer │
├─────────────────┼───────┼─────┼────────┤
│ Users           │  CRUD │  R  │   -    │
│ Cooperatives    │  CRUD │  R  │   R    │
│ Farmers         │  CRUD │ CRUD│   R    │
│ Farms           │   R   │  R  │  CRUD  │
│ Seasons         │   R   │  R  │  CRUD  │
│ Daily Tasks     │   R   │  R  │  CRU   │
│ Market Prices   │  CRUD │ CR  │   R    │
│ Tech Processes  │  CRUD │  R  │   R    │
│ Analytics       │   R   │  R  │   R    │
│ Alerts          │  CRUD │ CRU │   R    │
└─────────────────┴───────┴─────┴────────┘

Implementation:
  Backend:
    └─→ Django decorators:
        ├─→ @login_required
        ├─→ @permission_required
        └─→ Custom: @role_required('Admin')

  Frontend:
    └─→ Route guards:
        └─→ useEffect → check auth → redirect
```

### 7.3. Data Security

```
1. Database Level:
   ├─→ Row-level security (RLS)
   ├─→ Farmers only see their data
   └─→ HTX sees member data only

2. API Level:
   ├─→ Django permissions
   ├─→ Query filters by user
   └─→ ViewSet permissions

3. Network Level:
   ├─→ HTTPS in production
   ├─→ CORS configuration
   └─→ Rate limiting

4. Password Security:
   └─→ Django password hashers
       └─→ PBKDF2 with SHA256
```

---

## 8. HIỆU NĂNG & MỞ RỘNG

### 8.1. Database Optimization

```
Indexes Created:
  ├─→ idx_users_email
  ├─→ idx_users_role
  ├─→ idx_seasons_farm
  ├─→ idx_seasons_status
  ├─→ idx_daily_tasks_season
  ├─→ idx_daily_tasks_due_date
  └─→ idx_market_prices_crop_date

Views for Performance:
  ├─→ active_seasons_summary
  └─→ latest_market_prices

Query Optimization:
  ├─→ SELECT only needed columns
  ├─→ Use JOINs efficiently
  ├─→ Limit results with pagination
  └─→ Cache frequently accessed data
```

### 8.2. Caching Strategy

```
Levels:
  1. Browser Cache:
     └─→ Static assets (CSS, JS, images)

  2. Application Cache:
     └─→ Django cache framework
         ├─→ Redis (recommended)
         └─→ Memcached

  3. Database Query Cache:
     └─→ PostgreSQL query cache

Cache Keys:
  ├─→ user_dashboard_{user_id}
  ├─→ market_prices_latest
  ├─→ crops_list
  └─→ faqs_all
```

### 8.3. Scalability

```
Horizontal Scaling:
  ├─→ Multiple frontend servers
  │   └─→ Load balancer (Nginx)
  │
  ├─→ Multiple backend servers
  │   └─→ Gunicorn workers
  │
  └─→ Database replication
      ├─→ Primary (Write)
      └─→ Replicas (Read)

Vertical Scaling:
  ├─→ Increase server resources
  │   ├─→ CPU
  │   ├─→ RAM
  │   └─→ Disk I/O
  │
  └─→ Database optimization
      └─→ Connection pooling

Microservices Potential:
  ├─→ Split by domain:
  │   ├─→ User Service
  │   ├─→ Farm Service
  │   ├─→ Market Service
  │   └─→ Notification Service
  │
  └─→ Communication: REST/gRPC
```

### 8.4. Monitoring & Logging

```
Application Logs:
  └─→ Django logging framework
      ├─→ INFO: Normal operations
      ├─→ WARNING: Issues detected
      └─→ ERROR: Failures

Database Logs:
  └─→ PostgreSQL logs
      ├─→ Slow queries
      └─→ Connection issues

System Monitoring:
  ├─→ CPU, Memory, Disk usage
  ├─→ Network traffic
  └─→ Response times

Tools (Recommended):
  ├─→ Prometheus + Grafana
  ├─→ ELK Stack (Elasticsearch)
  └─→ Sentry (Error tracking)
```

---

## 9. DEPLOYMENT

### 9.1. Development Environment

```bash
# Clone repository
git clone <repo_url>

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm run dev

# Database setup
psql -U postgres -f databaseTrang-Longfix/FULL_SETUP.sql

# Metabase
docker run -d -p 3001:3000 --name metabase metabase/metabase

# n8n
docker run -d -p 5678:5678 --name n8n n8nio/n8n
```

### 9.2. Production Deployment

```
Architecture:
  ├─→ Frontend: Vercel / AWS S3 + CloudFront
  ├─→ Backend: AWS EC2 / Digital Ocean
  ├─→ Database: AWS RDS / Managed PostgreSQL
  ├─→ Metabase: Docker on separate server
  └─→ n8n: Docker on separate server

Docker Compose:
  └─→ Multi-container deployment
      ├─→ nginx (Reverse proxy)
      ├─→ django (Backend)
      ├─→ postgres (Database)
      ├─→ metabase (BI)
      └─→ n8n (Workflows)

CI/CD Pipeline:
  └─→ GitHub Actions / GitLab CI
      ├─→ Run tests
      ├─→ Build containers
      ├─→ Deploy to production
      └─→ Health checks
```

---

## 10. KẾT LUẬN

### 10.1. Ưu Điểm Của Hệ Thống

✅ **Kiến trúc rõ ràng:** Frontend-Backend tách biệt  
✅ **Dễ bảo trì:** Django apps modular  
✅ **Mở rộng tốt:** Có thể scale horizontal/vertical  
✅ **Tích hợp AI:** Chatbot thông minh với Gemini  
✅ **Phân tích mạnh:** Metabase cho BI  
✅ **Tự động hóa:** n8n workflows  
✅ **Bảo mật:** RBAC + Session auth  

### 10.2. Điểm Cần Cải Thiện

🔄 **Caching:** Thêm Redis cho performance  
🔄 **Real-time:** WebSocket cho notifications  
🔄 **Testing:** Tăng test coverage  
🔄 **Monitoring:** Thêm APM tools  
🔄 **Mobile:** Phát triển mobile app  
🔄 **Offline:** PWA cho offline support  

### 10.3. Roadmap Phát Triển

**Phase 1:** ✅ Core features (Completed)  
**Phase 2:** 🚀 Analytics & BI (Current)  
**Phase 3:** 🔮 AI/ML enhancements  
**Phase 4:** 📱 Mobile application  
**Phase 5:** 🌐 Multi-tenant support  

---

## 📞 LIÊN HỆ & HỖ TRỢ

**Tài liệu liên quan:**
- `README.md` - Hướng dẫn cài đặt
- `API_DOCUMENTATION.md` - Tài liệu API
- `FULL_SETUP.sql` - Database schema
- `metabase_charts.sql` - Metabase queries

**Technical Stack:**
- Frontend: Next.js 14 + TypeScript
- Backend: Django 5.0 + DRF
- Database: PostgreSQL 14
- BI: Metabase
- Automation: n8n
- AI: Google Gemini API

---

**End of Document**
