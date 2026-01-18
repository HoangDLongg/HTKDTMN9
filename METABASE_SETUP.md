# 📊 Metabase Integration Guide

## 🎯 Tổng quan

Hệ thống đã được tích hợp sẵn **Metabase** để tạo dashboards và báo cáo phân tích dữ liệu.

### ✅ Đã tạo:
- ✅ `MetabaseDashboard` component - Embed Metabase vào app
- ✅ `/farmer/analytics` - Trang analytics cho nông dân (4 dashboards)
- ✅ `/cooperative/analytics` - Trang analytics cho HTX (5 dashboards)

---

## 🚀 Cách setup

### Bước 1: Cài đặt Metabase

```bash
# Option 1: Docker (Khuyến nghị)
docker run -d -p 3001:3000 \
  --name metabase \
  -e "MB_DB_TYPE=postgres" \
  -e "MB_DB_DBNAME=agrisupply" \
  -e "MB_DB_PORT=5432" \
  -e "MB_DB_USER=postgres" \
  -e "MB_DB_PASS=123456" \
  -e "MB_DB_HOST=host.docker.internal" \
  metabase/metabase

# Option 2: JAR file
java -jar metabase.jar
```

### Bước 2: Kết nối Database

1. Mở `http://localhost:3001`
2. Setup tài khoản admin
3. Kết nối PostgreSQL:
   - Host: `localhost`
   - Port: `5432`
   - Database: `agrisupply`
   - Username: `postgres`
   - Password: `123456`

### Bước 3: Tạo Dashboards

#### 📊 Dashboards cho Farmer (4 dashboards)

**Dashboard 1: Farmer Overview (ID: 1)**
- Tổng số vườn
- Tổng diện tích
- Vụ mùa đang trồng
- Biểu đồ năng suất theo thời gian

**SQL Query mẫu:**
```sql
SELECT 
  COUNT(DISTINCT f.id) as total_farms,
  SUM(f.area_hectare) as total_area,
  COUNT(DISTINCT s.id) as active_seasons
FROM farms f
LEFT JOIN seasons s ON f.id = s.farm_id AND s.status = 'in_progress'
WHERE f.farmer_id = {{farmer_id}};
```

**Dashboard 2: Farm Details (ID: 2)**
- Danh sách vườn
- Diện tích từng vườn
- Cây trồng hiện tại

**SQL Query:**
```sql
SELECT 
  f.name as farm_name,
  f.area_hectare,
  w.name as ward_name,
  c.name as current_crop,
  s.status as season_status
FROM farms f
LEFT JOIN wards w ON f.ward_id = w.id
LEFT JOIN seasons s ON f.id = s.farm_id AND s.status = 'in_progress'
LEFT JOIN crops c ON s.crop_id = c.id
WHERE f.farmer_id = {{farmer_id}};
```

**Dashboard 3: Market Prices (ID: 3)**
- Biểu đồ giá 30 ngày
- So sánh giá các cây trồng
- Xu hướng giá

**SQL Query:**
```sql
SELECT 
  mp.price_date,
  c.name as crop_name,
  mp.price_per_kg,
  mp.market_name
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY mp.price_date DESC, c.name;
```

**Dashboard 4: Tasks Progress (ID: 4)**
- Công việc hôm nay
- Tỷ lệ hoàn thành
- Lịch sử công việc

**SQL Query:**
```sql
SELECT 
  dt.task_date,
  dt.task_name,
  dt.is_completed,
  s.season_code,
  c.name as crop_name
FROM daily_tasks dt
JOIN seasons s ON dt.season_id = s.id
JOIN farms f ON s.farm_id = f.id
JOIN crops c ON s.crop_id = c.id
WHERE f.farmer_id = {{farmer_id}}
  AND dt.task_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dt.task_date DESC;
```

---

#### 🏢 Dashboards cho HTX (5 dashboards)

**Dashboard 10: Cooperative Overview (ID: 10)**
- Tổng nông dân
- Tổng vườn
- Tổng sản lượng
- Doanh thu

**SQL Query:**
```sql
SELECT 
  COUNT(DISTINCT fa.id) as total_farmers,
  COUNT(DISTINCT f.id) as total_farms,
  SUM(f.area_hectare) as total_area,
  COUNT(DISTINCT s.id) as active_seasons
FROM cooperatives co
LEFT JOIN farmers fa ON co.id = fa.cooperative_id
LEFT JOIN farms f ON fa.id = f.farmer_id
LEFT JOIN seasons s ON f.id = s.farm_id AND s.status = 'in_progress'
WHERE co.id = {{cooperative_id}};
```

**Dashboard 11: Farmers Management (ID: 11)**
- Danh sách nông dân
- Số vườn/nông dân
- Tiến độ canh tác

**SQL Query:**
```sql
SELECT 
  fa.farmer_code,
  u.full_name,
  u.phone,
  COUNT(DISTINCT f.id) as num_farms,
  SUM(f.area_hectare) as total_area,
  COUNT(DISTINCT s.id) as active_seasons
FROM farmers fa
JOIN users u ON fa.user_id = u.id
LEFT JOIN farms f ON fa.id = f.farmer_id
LEFT JOIN seasons s ON f.id = s.farm_id AND s.status = 'in_progress'
WHERE fa.cooperative_id = {{cooperative_id}}
GROUP BY fa.id, fa.farmer_code, u.full_name, u.phone;
```

**Dashboard 12: Production Stats (ID: 12)**
- Sản lượng theo cây trồng
- Năng suất trung bình
- Diện tích canh tác

**SQL Query:**
```sql
SELECT 
  c.name as crop_name,
  COUNT(s.id) as num_seasons,
  SUM(s.actual_yield) as total_yield,
  AVG(s.actual_yield / f.area_hectare) as avg_yield_per_ha
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND s.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_yield DESC;
```

**Dashboard 13: Market Analysis (ID: 13)**
- Giá trung bình theo cây trồng
- Xu hướng giá
- Dự báo giá

**SQL Query:**
```sql
SELECT 
  mp.price_date,
  c.name as crop_name,
  AVG(mp.price_per_kg) as avg_price,
  MIN(mp.price_per_kg) as min_price,
  MAX(mp.price_per_kg) as max_price
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY mp.price_date, c.id, c.name
ORDER BY mp.price_date DESC;
```

**Dashboard 14: Quality Control (ID: 14)**
- Đánh giá chất lượng sản phẩm
- Tuân thủ quy trình
- Sự cố/vấn đề

**SQL Query:**
```sql
SELECT 
  s.season_code,
  c.name as crop_name,
  COUNT(dt.id) as total_tasks,
  SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(100.0 * SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) / COUNT(dt.id), 2) as completion_rate
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
LEFT JOIN daily_tasks dt ON s.id = dt.season_id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND s.status IN ('in_progress', 'completed')
GROUP BY s.id, s.season_code, c.name
ORDER BY completion_rate DESC;
```

---

## 🔧 Cấu hình Frontend

### 1. Tạo file `.env.local`

```bash
cd frontend
cp METABASE_CONFIG.md .env.local
```

Sửa nội dung:
```env
NEXT_PUBLIC_METABASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. Restart Next.js

```bash
npm run dev
```

---

## 📱 Sử dụng

### Farmer:
1. Login với tài khoản farmer
2. Vào `/farmer/analytics`
3. Chọn dashboard muốn xem

### HTX Manager:
1. Login với tài khoản htx_manager
2. Vào `/cooperative/analytics`
3. Chọn dashboard muốn xem

---

## 🎨 Tùy chỉnh

### Thay đổi Dashboard ID

Sửa trong file:
- `frontend/app/farmer/analytics/page.tsx`
- `frontend/app/cooperative/analytics/page.tsx`

```typescript
const dashboards = {
  overview: {
    url: `${METABASE_BASE_URL}/dashboard/YOUR_DASHBOARD_ID`,
    // ...
  }
}
```

### Thêm Parameters

```typescript
<MetabaseDashboard
  dashboardUrl={url}
  params={{
    user_id: user?.id,
    farmer_id: farmer?.id,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  }}
/>
```

---

## 📊 Database Schema Reference

### Bảng chính:
- `users` - Người dùng
- `roles` - Vai trò
- `farmers` - Nông dân
- `cooperatives` - Hợp tác xã
- `farms` - Vườn
- `seasons` - Vụ mùa
- `crops` - Cây trồng
- `daily_tasks` - Công việc hàng ngày
- `market_prices` - Giá thị trường
- `provinces`, `districts`, `wards` - Địa điểm

### Views có sẵn:
- `active_seasons_summary` - Tổng hợp vụ mùa đang hoạt động
- `latest_market_prices` - Giá thị trường mới nhất

---

## 🐛 Troubleshooting

### Lỗi: Cannot connect to Metabase
```bash
# Kiểm tra Metabase đang chạy
docker ps | grep metabase

# Kiểm tra URL
curl http://localhost:3001
```

### Lỗi: Dashboard không hiển thị
- Kiểm tra Dashboard ID đúng chưa
- Kiểm tra quyền truy cập dashboard trong Metabase
- Kiểm tra CORS settings

### Lỗi: Parameters không hoạt động
- Đảm bảo dashboard có field variables
- Kiểm tra tên parameters khớp với field variables

---

## 📚 Tài liệu tham khảo

- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [Embedding Metabase](https://www.metabase.com/docs/latest/embedding/introduction)
- [SQL Queries](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql)

---

**Tạo bởi:** Antigravity AI  
**Ngày:** 2026-01-17
