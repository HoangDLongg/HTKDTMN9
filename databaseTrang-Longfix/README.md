# Database Setup Guide

## 📁 Cấu trúc Files

```
database/
├── 00_setup_master.sql              # Script chính - Chạy file này
├── schema.sql                       # Tạo bảng, triggers, views
├── vietnam_locations.sql            # 63 tỉnh/thành Việt Nam
├── seed_data.sql                    # Dữ liệu mẫu cơ bản
├── extended_products_processes.sql  # Thêm sản phẩm & quy trình
└── README.md                        # File này
```

## 🚀 Cách Setup Database

### Phương pháp 1: Chạy Master Script (Khuyến nghị)

**Trong pgAdmin 4:**

1. Tạo database mới:
   ```sql
   CREATE DATABASE agri_supply_chain;
   ```

2. Kết nối vào database `agri_supply_chain`

3. Mở Query Tool

4. Chạy file `00_setup_master.sql`

**Hoặc dùng psql command line:**

```bash
# Tạo database
createdb agri_supply_chain

# Chạy master script
psql -d agri_supply_chain -f "E:/HTKDTMN9/database/00_setup_master.sql"
```

### Phương pháp 2: Chạy từng file theo thứ tự

**Thứ tự QUAN TRỌNG:**

1. `schema.sql` - Tạo cấu trúc bảng
2. `vietnam_locations.sql` - Import địa điểm
3. `seed_data.sql` - Dữ liệu mẫu cơ bản (users, crops, processes...)
4. `extended_products_processes.sql` - Thêm sản phẩm

**⚠️ LƯU Ý:** Phải chạy đúng thứ tự để tránh lỗi foreign key constraint!

## ✅ Kiểm tra sau khi setup

```sql
-- Kiểm tra số lượng dữ liệu
SELECT 'Provinces' as table_name, COUNT(*) FROM provinces
UNION ALL
SELECT 'Crops', COUNT(*) FROM crops
UNION ALL
SELECT 'Technical Processes', COUNT(*) FROM technical_processes
UNION ALL
SELECT 'Seasons', COUNT(*) FROM seasons
UNION ALL
SELECT 'Market Prices', COUNT(*) FROM market_prices;

-- Xem quy trình chi tiết
SELECT tp.name, tp.total_days, c.name as crop_name
FROM technical_processes tp
JOIN crops c ON tp.crop_id = c.id;

-- Xem giá mới nhất
SELECT * FROM latest_market_prices;

-- Xem vụ mùa đang hoạt động
SELECT * FROM active_seasons_summary;
```

## 📊 Dữ liệu có sẵn sau khi setup

- ✅ **63 tỉnh/thành phố** Việt Nam
- ✅ **20+ loại cây trồng** (Dưa lưới, Ổi, Cà chua, Xà lách, Rau muống, Khoai lang...)
- ✅ **6 quy trình kỹ thuật chi tiết**:
  - Dưa lưới 75 ngày (5 giai đoạn, 20+ công việc)
  - Ổi 120 ngày
  - Cà chua 90 ngày
  - Xà lách 45 ngày
  - Rau muống 25 ngày
  - Khoai lang 120 ngày
- ✅ **30 ngày giá thị trường** cho tất cả cây trồng
- ✅ **5 vụ mùa mẫu** (2 hoàn thành, 3 đang canh tác)
- ✅ **Users, Cooperatives, Farms** mẫu
- ✅ **FAQs, Alerts** mẫu

## 🔧 Troubleshooting

### Lỗi: Foreign key constraint violation

**Nguyên nhân:** Chạy sai thứ tự file

**Giải pháp:** 
1. Drop database và tạo lại
2. Chạy lại từ `00_setup_master.sql`

```sql
DROP DATABASE agri_supply_chain;
CREATE DATABASE agri_supply_chain;
-- Rồi chạy lại master script
```

### Lỗi: File path not found

**Nguyên nhân:** Đường dẫn file không đúng

**Giải pháp:** Sửa đường dẫn trong `00_setup_master.sql` cho phù hợp với máy bạn

## 📝 Notes

- Password mặc định cho tất cả users: `password123` (đã hash)
- Dữ liệu giá thị trường được tạo ngẫu nhiên dựa trên giá cơ bản
- Trigger tự động sinh `daily_tasks` khi tạo season mới
- Views `active_seasons_summary` và `latest_market_prices` sẵn sàng sử dụng
