# 📋 PHÂN TÍCH CHỨC NĂNG - ADMIN & HTX

## 🎯 Tổng quan

Hệ thống có 3 vai trò chính:
1. **Admin** - Quản trị viên hệ thống
2. **HTX Manager** - Quản lý hợp tác xã
3. **Farmer** - Nông dân (đã làm xong)

---

## 👨‍💼 ADMIN - Quản trị viên hệ thống

### 📊 Chức năng chính:

#### 1. **Quản lý người dùng** (`/admin/users`)
- [ ] Danh sách tất cả users (admin, HTX, farmer)
- [ ] Tạo user mới
- [ ] Sửa thông tin user
- [ ] Vô hiệu hóa/kích hoạt user
- [ ] Phân quyền (roles)
- [ ] Reset password

#### 2. **Quản lý hợp tác xã** (`/admin/cooperatives`)
- [ ] Danh sách HTX
- [ ] Tạo HTX mới
- [ ] Sửa thông tin HTX
- [ ] Xem chi tiết HTX (nông dân, vườn, sản lượng)
- [ ] Thống kê theo HTX

#### 3. **Quản lý cây trồng** (`/admin/crops`)
- [ ] Danh sách cây trồng
- [ ] Thêm cây trồng mới
- [ ] Sửa thông tin cây trồng
- [ ] Quản lý quy trình kỹ thuật
- [ ] Quản lý giai đoạn và công việc

#### 4. **Quản lý vụ mùa (tổng quan)** (`/admin/seasons`)
- [ ] Xem tất cả vụ mùa trong hệ thống
- [ ] Lọc theo HTX, cây trồng, trạng thái
- [ ] Thống kê tổng hợp
- [ ] Export báo cáo

#### 5. **Quản lý thị trường** (`/admin/market`)
- [ ] Nhập giá thị trường
- [ ] Xem lịch sử giá
- [ ] Phân tích xu hướng
- [ ] Quản lý nguồn giá (chợ đầu mối)

#### 6. **Báo cáo & Thống kê** (`/admin/reports`)
- [ ] Dashboard tổng quan toàn hệ thống
- [ ] Báo cáo sản lượng
- [ ] Báo cáo doanh thu
- [ ] Báo cáo theo khu vực
- [ ] Export Excel/PDF

#### 7. **Cấu hình hệ thống** (`/admin/settings`)
- [ ] Cài đặt chung
- [ ] Quản lý địa điểm (tỉnh, huyện, xã)
- [ ] Cấu hình thông báo
- [ ] Logs hệ thống

---

## 🏢 HTX MANAGER - Quản lý hợp tác xã

### 📊 Chức năng chính:

#### 1. **Quản lý nông dân** (`/cooperative/farmers`)
- [ ] Danh sách nông dân trong HTX
- [ ] Thêm nông dân mới
- [ ] Sửa thông tin nông dân
- [ ] Xem chi tiết nông dân (vườn, vụ mùa, sản lượng)
- [ ] Đánh giá nông dân

#### 2. **Quản lý vườn/ruộng** (`/cooperative/farms`)
- [ ] Danh sách tất cả vườn trong HTX
- [ ] Thêm vườn mới
- [ ] Sửa thông tin vườn
- [ ] Xem chi tiết vườn
- [ ] Phân bổ vườn cho nông dân

#### 3. **Quản lý vụ mùa** (`/cooperative/seasons`)
- [ ] Danh sách vụ mùa
- [ ] Tạo vụ mùa mới (wizard)
- [ ] Theo dõi tiến độ
- [ ] Cập nhật trạng thái
- [ ] Ghi nhận sản lượng

#### 4. **Quản lý sản lượng** (`/cooperative/production`)
- [ ] Thống kê sản lượng theo cây trồng
- [ ] Thống kê theo nông dân
- [ ] Lịch sử thu hoạch
- [ ] Dự báo sản lượng

#### 5. **Giá thị trường** (`/cooperative/market`)
- [ ] Xem giá thị trường
- [ ] Cập nhật giá bán
- [ ] So sánh giá
- [ ] Khuyến nghị cây trồng

#### 6. **Đề xuất cây trồng** (`/cooperative/recommendations`)
- [ ] Tạo đề xuất cho nông dân
- [ ] Quản lý đề xuất
- [ ] Theo dõi phản hồi

#### 7. **Hỗ trợ nông dân** (`/cooperative/support`)
- [ ] Chatbot AI
- [ ] FAQ
- [ ] Thông báo/cảnh báo
- [ ] Tin nhắn trực tiếp

#### 8. **Báo cáo HTX** (`/cooperative/reports`)
- [ ] Dashboard HTX
- [ ] Báo cáo tháng/quý/năm
- [ ] Phân tích hiệu quả
- [ ] Export báo cáo

---

## 📅 KẾ HOẠCH THỰC HIỆN

### 🎯 Ưu tiên cao (Làm trước)

#### **Phase 1: Admin Core** (Quan trọng nhất)
1. ✅ **Admin Dashboard** - Tổng quan hệ thống
2. ⬜ **Quản lý Users** - CRUD users, phân quyền
3. ⬜ **Quản lý HTX** - CRUD cooperatives
4. ⬜ **Quản lý Crops** - CRUD crops + technical processes

#### **Phase 2: HTX Core** (Chức năng chính)
1. ✅ **HTX Dashboard** - Tổng quan HTX
2. ⬜ **Quản lý Farmers** - CRUD farmers
3. ⬜ **Quản lý Farms** - CRUD farms
4. ⬜ **Quản lý Seasons** - CRUD seasons + wizard

#### **Phase 3: Tính năng nâng cao**
1. ⬜ **Market Management** - Quản lý giá thị trường
2. ⬜ **Production Stats** - Thống kê sản lượng
3. ⬜ **Recommendations** - Đề xuất cây trồng
4. ⬜ **Reports** - Báo cáo và export

#### **Phase 4: Hoàn thiện**
1. ⬜ **Settings & Config** - Cấu hình hệ thống
2. ⬜ **Notifications** - Hệ thống thông báo
3. ⬜ **Logs & Audit** - Theo dõi hoạt động
4. ⬜ **Mobile Responsive** - Tối ưu mobile

---

## 🚀 TASKS CỤ THỂ

### 📋 Task List - Admin

#### Task 1: Admin Users Management
- [ ] Backend: API endpoints (list, create, update, delete, roles)
- [ ] Frontend: Users list page với table
- [ ] Frontend: Create/Edit user form
- [ ] Frontend: Role assignment
- [ ] Frontend: User detail page

#### Task 2: Admin Cooperatives Management
- [ ] Backend: API endpoints
- [ ] Frontend: Cooperatives list
- [ ] Frontend: Create/Edit cooperative form
- [ ] Frontend: Cooperative detail page với stats

#### Task 3: Admin Crops Management
- [ ] Backend: API endpoints
- [ ] Frontend: Crops list
- [ ] Frontend: Create/Edit crop form
- [ ] Frontend: Technical process management
- [ ] Frontend: Stages & tasks management

#### Task 4: Admin Market Management
- [ ] Backend: API endpoints
- [ ] Frontend: Market prices input form
- [ ] Frontend: Price history chart
- [ ] Frontend: Market sources management

#### Task 5: Admin Reports
- [ ] Backend: Aggregation queries
- [ ] Frontend: Dashboard với charts
- [ ] Frontend: Export Excel/PDF
- [ ] Frontend: Date range filters

---

### 📋 Task List - HTX

#### Task 6: HTX Farmers Management
- [ ] Backend: API endpoints (filter by cooperative)
- [ ] Frontend: Farmers list
- [ ] Frontend: Create/Edit farmer form
- [ ] Frontend: Farmer detail page
- [ ] Frontend: Farmer stats

#### Task 7: HTX Farms Management
- [ ] Backend: API endpoints
- [ ] Frontend: Farms list
- [ ] Frontend: Create/Edit farm form
- [ ] Frontend: Farm detail page
- [ ] Frontend: Assign farm to farmer

#### Task 8: HTX Seasons Management
- [ ] Backend: API endpoints
- [ ] Frontend: Seasons list
- [ ] Frontend: Season creation wizard
- [ ] Frontend: Season detail & progress
- [ ] Frontend: Update status & yield

#### Task 9: HTX Production Stats
- [ ] Backend: Aggregation queries
- [ ] Frontend: Production dashboard
- [ ] Frontend: Charts by crop/farmer
- [ ] Frontend: Harvest history

#### Task 10: HTX Recommendations
- [ ] Backend: API endpoints
- [ ] Frontend: Create recommendation form
- [ ] Frontend: Recommendations list
- [ ] Frontend: Send to farmers
- [ ] Frontend: Track responses

---

## 🎯 ĐỀ XUẤT THỰC HIỆN

### Tuần 1: Admin Foundation
- Task 1: Admin Users Management
- Task 2: Admin Cooperatives Management

### Tuần 2: Admin Content
- Task 3: Admin Crops Management
- Task 4: Admin Market Management

### Tuần 3: HTX Core
- Task 6: HTX Farmers Management
- Task 7: HTX Farms Management

### Tuần 4: HTX Advanced
- Task 8: HTX Seasons Management
- Task 9: HTX Production Stats

### Tuần 5: Finishing
- Task 5: Admin Reports
- Task 10: HTX Recommendations
- Polish & Testing

---

## 💡 GỢI Ý BẮT ĐẦU

**Bắt đầu với Task nào?**

1. **Nếu ưu tiên Admin:** Bắt đầu với **Task 1 - Admin Users Management**
2. **Nếu ưu tiên HTX:** Bắt đầu với **Task 6 - HTX Farmers Management**
3. **Nếu muốn quick win:** Bắt đầu với **Task 4 - Admin Market Management** (đơn giản nhất)

**Tôi khuyến nghị:** Làm theo thứ tự Task 1 → Task 2 → Task 6 → Task 7 → Task 8

---

**Bạn muốn bắt đầu với Task nào?** 🚀
