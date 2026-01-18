# 🗓️ SEASON MANAGEMENT WORKFLOW

## 📋 Quy trình quản lý vụ mùa

### 1. HTX tạo vụ mùa mở (Open Season)
**Trang:** `/cooperative/seasons`

HTX Manager tạo vụ mùa với:
- Cây trồng
- Thời gian bắt đầu/kết thúc
- Diện tích dự kiến
- Mô tả
- **Trạng thái:** `open` (Mở đăng ký)

### 2. Nông dân đăng ký tham gia
**Trang:** `/farmer/seasons` (Farmer xem danh sách vụ mùa mở)

Nông dân:
- Xem danh sách vụ mùa đang mở
- Chọn vườn của mình
- Đăng ký tham gia
- **Trạng thái đơn:** `pending` (Chờ duyệt)

### 3. HTX duyệt đơn đăng ký
**Trang:** `/cooperative/season-registrations`

HTX Manager:
- Xem danh sách đơn đăng ký
- Duyệt/Từ chối đơn
- **Sau khi duyệt:** Tạo Season thực tế cho nông dân

---

## 🔄 Workflow chi tiết:

```
┌─────────────────────────────────────────────────────┐
│  1. HTX TẠO VỤ MÙA MỞ                               │
│  (/cooperative/seasons)                             │
│                                                     │
│  - Cây trồng: Cà chua                              │
│  - Thời gian: 01/02/2026 - 01/05/2026             │
│  - Diện tích: 10 ha                                │
│  - Trạng thái: OPEN                                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  2. NÔNG DÂN ĐĂNG KÝ                                │
│  (/farmer/seasons)                                  │
│                                                     │
│  - Chọn vụ mùa: Cà chua VU2026-001                │
│  - Chọn vườn: Vườn A (2 ha)                       │
│  - Gửi đơn đăng ký                                 │
│  - Trạng thái: PENDING                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  3. HTX DUYỆT ĐƠN                                   │
│  (/cooperative/season-registrations)                │
│                                                     │
│  - Xem đơn: Farmer1 - Vườn A - 2 ha               │
│  - Duyệt: ✅ Chấp nhận                             │
│  → Tạo Season thực tế cho Farmer1                  │
│  - Trạng thái: APPROVED → ACTIVE                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  4. NÔNG DÂN THEO DÕI VỤ MÙA                        │
│  (/farmer/my-seasons)                               │
│                                                     │
│  - Xem vụ mùa đã được duyệt                        │
│  - Theo dõi tiến độ                                │
│  - Cập nhật công việc hàng ngày                    │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema:

### Table: `open_seasons` (Vụ mùa mở)
```sql
id
crop_id
cooperative_id
start_date
end_date
target_area
description
status (open, closed)
created_by (HTX Manager)
```

### Table: `season_registrations` (Đơn đăng ký)
```sql
id
open_season_id
farmer_id
farm_id
status (pending, approved, rejected)
notes
created_at
```

### Table: `seasons` (Vụ mùa thực tế)
```sql
id
registration_id (FK)
farm_id
crop_id
start_date
expected_harvest_date
status (planning, in_progress, harvesting, completed)
```

---

## 🎯 Pages cần tạo:

### HTX:
1. ✅ `/cooperative/seasons` - Quản lý vụ mùa mở (Create/List)
2. ⬜ `/cooperative/season-registrations` - Duyệt đơn đăng ký

### Farmer:
1. ⬜ `/farmer/open-seasons` - Xem vụ mùa mở & đăng ký
2. ⬜ `/farmer/my-seasons` - Vụ mùa của tôi

---

## 🚀 Implementation Plan:

**Phase 1:** HTX tạo vụ mùa mở
- Trang HTX Seasons với Create modal
- Form: crop, dates, target_area, description

**Phase 2:** Farmer đăng ký
- Trang Farmer Open Seasons
- Form đăng ký: chọn farm, notes

**Phase 3:** HTX duyệt
- Trang HTX Registrations
- Approve/Reject buttons
- Auto-create Season khi approve

**Bạn muốn tôi implement workflow này không?** 🤔
