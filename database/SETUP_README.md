# 🚀 FULL_SETUP.sql - Database Setup Hoàn Chỉnh

## 📋 Tổng quan

File **FULL_SETUP.sql** là file SQL hoàn chỉnh gộp tất cả các thành phần:
- ✅ Schema (30+ bảng, triggers, views, functions)
- ✅ 63 tỉnh/thành phố Việt Nam
- ✅ Dữ liệu mẫu cơ bản (users, cooperatives, farms, seasons...)
- ✅ 20+ cây trồng với 6 quy trình kỹ thuật chi tiết
- ✅ 30 ngày giá thị trường
- ✅ FAQs, Alerts mẫu

**Kích thước:** ~53KB  
**Thời gian chạy:** ~5-10 giây  
**✨ Đặc biệt:** Script có thể chạy **nhiều lần** mà không bị lỗi (idempotent) - tự động xóa dữ liệu cũ trước khi tạo mới

---

## 🎯 Cách sử dụng

### Phương pháp 1: pgAdmin 4 (Khuyến nghị)

1. **Tạo database mới:**
   ```sql
   CREATE DATABASE agri_supply_chain;
   ```

2. **Kết nối vào database** `agri_supply_chain`

3. **Mở Query Tool** (Tools → Query Tool hoặc Alt+Shift+Q)

4. **Mở file FULL_SETUP.sql:**
   - Click icon **Open File** (📁)
   - Chọn file `E:\HTKDTMN9\database\FULL_SETUP.sql`

5. **Execute:**
   - Click **Execute/Run** (▶️) hoặc nhấn **F5**
   - Đợi ~5-10 giây để hoàn thành

6. **Kiểm tra kết quả:**
   - Refresh database tree (F5)
   - Mở **Schemas → public → Tables**
   - Bạn sẽ thấy 30+ bảng

### Phương pháp 2: psql Command Line

```bash
# Tạo database
createdb agri_supply_chain

# Chạy script
psql -d agri_supply_chain -f "E:/HTKDTMN9/database/FULL_SETUP.sql"
```

### Phương pháp 3: Docker PostgreSQL

```bash
# Copy file vào container
docker cp E:/HTKDTMN9/database/FULL_SETUP.sql postgres_container:/tmp/

# Chạy trong container
docker exec -it postgres_container psql -U postgres -d agri_supply_chain -f /tmp/FULL_SETUP.sql
```

---

## ✅ Kiểm tra sau khi setup

```sql
-- 1. Kiểm tra số lượng dữ liệu
SELECT 'Provinces' as table_name, COUNT(*) as count FROM provinces
UNION ALL
SELECT 'Crops', COUNT(*) FROM crops
UNION ALL
SELECT 'Technical Processes', COUNT(*) FROM technical_processes
UNION ALL
SELECT 'Process Stages', COUNT(*) FROM process_stages
UNION ALL
SELECT 'Stage Tasks', COUNT(*) FROM stage_tasks
UNION ALL
SELECT 'Seasons', COUNT(*) FROM seasons
UNION ALL
SELECT 'Market Prices', COUNT(*) FROM market_prices
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Farmers', COUNT(*) FROM farmers
UNION ALL
SELECT 'Farms', COUNT(*) FROM farms;

-- 2. Xem quy trình chi tiết
SELECT 
    tp.name as process_name,
    tp.total_days,
    c.name as crop_name,
    COUNT(DISTINCT ps.id) as num_stages,
    COUNT(st.id) as num_tasks
FROM technical_processes tp
JOIN crops c ON tp.crop_id = c.id
LEFT JOIN process_stages ps ON tp.id = ps.process_id
LEFT JOIN stage_tasks st ON ps.id = st.stage_id
GROUP BY tp.id, tp.name, tp.total_days, c.name
ORDER BY tp.id;

-- 3. Xem giá mới nhất
SELECT * FROM latest_market_prices ORDER BY crop_name;

-- 4. Xem vụ mùa đang hoạt động
SELECT * FROM active_seasons_summary;

-- 5. Test trigger tự động tạo daily_tasks
SELECT 
    s.season_code,
    COUNT(dt.id) as total_tasks,
    SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) as completed_tasks
FROM seasons s
LEFT JOIN daily_tasks dt ON s.id = dt.season_id
GROUP BY s.id, s.season_code;
```

---

## 📊 Dữ liệu có sẵn

### 🌍 Địa điểm
- **63 tỉnh/thành phố** Việt Nam (đầy đủ)
- **7 quận/huyện** mẫu (TP.HCM, Bến Tre, Đồng Tháp)
- **7 xã/phường** mẫu

### 🌱 Cây trồng (20+ loại)
**Quả:** Dưa lưới, Ổi, Cà chua, Dưa hấu, Dưa gang, Thanh long, Chanh, Ớt, Bí ngô  
**Rau:** Xà lách, Rau muống, Cải ngọt, Rau má, Bắp cải  
**Củ:** Khoai lang, Khoai tây, Củ cải trắng  
**Gia vị:** Hành củ, Tỏi, Gừng

### 📋 Quy trình kỹ thuật (6 quy trình chi tiết)

| Cây trồng | Thời gian | Giai đoạn | Công việc |
|-----------|-----------|-----------|-----------|
| Dưa lưới | 75 ngày | 5 | 20+ |
| Ổi | 120 ngày | 4 | 15+ |
| Cà chua | 90 ngày | 4 | 15+ |
| Xà lách | 45 ngày | 3 | 8+ |
| Rau muống | 25 ngày | 3 | 7+ |
| Khoai lang | 120 ngày | 3 | 10+ |

### 👥 Users & Farms
- **5 users:** 1 admin, 1 manager HTX, 3 nông dân
- **2 HTX:** HTX Bình Tân, HTX Củ Chi
- **3 nông hộ**
- **4 vùng trồng**
- **5 vụ mùa:** 2 hoàn thành, 3 đang canh tác

### 💰 Giá thị trường
- **30 ngày** dữ liệu giá cho tất cả cây trồng
- Nguồn: Chợ đầu mối Bình Điền

### 💬 FAQs & Alerts
- **9 câu hỏi thường gặp** về kỹ thuật & giá cả
- **2 cảnh báo** mẫu (thời tiết, sâu bệnh)

---

## 🔧 Troubleshooting

### ❌ Lỗi: Database already exists

```sql
-- Không cần lo lắng! Script tự động xóa dữ liệu cũ
-- Chỉ cần chạy lại FULL_SETUP.sql trực tiếp
-- Hoặc nếu muốn xóa hoàn toàn database:
DROP DATABASE agri_supply_chain;
CREATE DATABASE agri_supply_chain;
-- Rồi chạy lại FULL_SETUP.sql
```

### ❌ Lỗi: Tables already exist

```sql
-- Script đã tự động xử lý! Chỉ cần chạy lại
-- Tất cả bảng cũ sẽ được DROP CASCADE tự động
```

### ❌ Lỗi: Permission denied

```sql
-- Đảm bảo user có quyền tạo database
GRANT ALL PRIVILEGES ON DATABASE agri_supply_chain TO your_username;
```

### ❌ Lỗi: Encoding issues

```sql
-- Tạo database với encoding UTF8
CREATE DATABASE agri_supply_chain
WITH ENCODING 'UTF8'
LC_COLLATE = 'Vietnamese_Vietnam.1258'
LC_CTYPE = 'Vietnamese_Vietnam.1258';
```

---

## 📝 Notes

- **Password mặc định:** Tất cả users có password là `password123` (đã hash với bcrypt)
- **Trigger tự động:** Khi tạo season mới, `daily_tasks` sẽ tự động được sinh ra
- **Views có sẵn:** `active_seasons_summary`, `latest_market_prices`
- **Giá thị trường:** Được tạo ngẫu nhiên dựa trên giá cơ bản ±10-15%

---

## 🚀 Bước tiếp theo

Sau khi setup database xong, bạn có thể:

1. **Tạo Django Models** - Convert sang Python ORM
2. **Setup Django Admin** - Quản lý dữ liệu qua web
3. **Kết nối Metabase** - Tạo dashboard BI
4. **Setup n8n** - Tạo chatbot Telegram
5. **Phát triển API** - Django REST Framework

---

## 📞 Liên hệ & Support

Nếu gặp vấn đề, check:
- PostgreSQL version >= 12
- Encoding: UTF-8
- Timezone: Asia/Ho_Chi_Minh

---

**Tạo bởi:** Antigravity AI  
**Ngày:** 2026-01-12  
**Version:** 1.0
