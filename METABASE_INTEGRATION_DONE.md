# 🎉 Metabase Integration - HOÀN THÀNH!

## ✅ Đã cấu hình xong

### 📊 Dashboard URL của bạn:
```
http://localhost:3001/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac
```

### 🔗 Đã tích hợp vào:

#### 1. **Farmer Analytics** (`/farmer/analytics`)
- ✅ 4 tabs dashboard (hiện tại tất cả dùng chung 1 dashboard)
- ✅ Tổng quan
- ✅ Vườn của tôi
- ✅ Giá thị trường
- ✅ Công việc

#### 2. **HTX Analytics** (`/cooperative/analytics`)
- ✅ 5 tabs dashboard (hiện tại tất cả dùng chung 1 dashboard)
- ✅ Tổng quan HTX
- ✅ Quản lý nông dân
- ✅ Sản xuất
- ✅ Thị trường
- ✅ Chất lượng

---

## 🚀 Cách sử dụng:

### **Farmer:**
1. Login: `farmer1` / `123456`
2. Click card màu tím "📈 Thống kê & Báo cáo"
3. Hoặc vào: `http://localhost:3000/farmer/analytics`

### **HTX Manager:**
1. Login: `htx_manager` / `123456`
2. Click card màu xanh "📈 Thống kê & Báo cáo"
3. Hoặc vào: `http://localhost:3000/cooperative/analytics`

---

## 📝 Lưu ý:

### Hiện tại:
- ✅ Tất cả tabs đều dùng **CHUNG 1 dashboard** của bạn
- ✅ Dashboard được embed qua iframe
- ✅ Responsive và có thể tương tác

### Để tạo dashboards riêng cho từng tab:

1. **Tạo dashboards mới trong Metabase:**
   - Vào `http://localhost:3001`
   - Tạo dashboard mới
   - Lấy public link (dạng `/public/dashboard/xxx`)

2. **Cập nhật URLs trong code:**
   
   **File:** `frontend/app/farmer/analytics/page.tsx`
   ```typescript
   const dashboards = {
     overview: {
       url: `${METABASE_BASE_URL}/public/dashboard/DASHBOARD_ID_1`,
     },
     farms: {
       url: `${METABASE_BASE_URL}/public/dashboard/DASHBOARD_ID_2`,
     },
     // ...
   }
   ```

   **File:** `frontend/app/cooperative/analytics/page.tsx`
   ```typescript
   const dashboards = {
     overview: {
       url: `${METABASE_BASE_URL}/public/dashboard/DASHBOARD_ID_10`,
     },
     // ...
   }
   ```

---

## 🎨 Tùy chỉnh:

### Thay đổi chiều cao iframe:
```typescript
<MetabaseDashboard
  dashboardUrl={url}
  height={1200}  // Thay đổi từ 900 thành 1200
/>
```

### Thêm parameters:
```typescript
<MetabaseDashboard
  dashboardUrl={url}
  params={{
    user_id: user?.id,
    farmer_id: farmer?.id,
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  }}
/>
```

---

## 📚 SQL Queries mẫu:

Xem file: `database/metabase_queries.sql` để có các SQL queries mẫu cho:
- Farmer Overview
- Farm Details
- Market Prices
- Tasks Progress
- Cooperative Overview
- Farmers Management
- Production Stats
- Market Analysis
- Quality Control

---

## ✨ Tính năng:

- ✅ Embed Metabase dashboard vào app
- ✅ Responsive design
- ✅ Tab switching
- ✅ Loading states
- ✅ Error handling
- ✅ Instructions cho user

---

**Tạo bởi:** Antigravity AI  
**Ngày:** 2026-01-17  
**Status:** ✅ HOÀN THÀNH
