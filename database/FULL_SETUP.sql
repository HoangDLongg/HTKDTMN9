-- =====================================================
-- HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG NÔNG SẢN
-- Database Schema Design
-- PostgreSQL 14+
-- =====================================================

-- =====================================================
-- 0. CLEANUP - XÓA DỮ LIỆU CŨ (Để script chạy được nhiều lần)
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_generate_tasks ON seasons;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_crops_updated_at ON crops;
DROP TRIGGER IF EXISTS update_seasons_updated_at ON seasons;

-- Drop functions
DROP FUNCTION IF EXISTS generate_daily_tasks_for_season();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop views
DROP VIEW IF EXISTS active_seasons_summary;
DROP VIEW IF EXISTS latest_market_prices;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS chat_logs CASCADE;
DROP TABLE IF EXISTS planting_recommendations CASCADE;
DROP TABLE IF EXISTS demand_forecasts CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS price_sources CASCADE;
DROP TABLE IF EXISTS farming_logs CASCADE;
DROP TABLE IF EXISTS daily_tasks CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS cooperatives CASCADE;
DROP TABLE IF EXISTS stage_tasks CASCADE;
DROP TABLE IF EXISTS process_stages CASCADE;
DROP TABLE IF EXISTS technical_processes CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =====================================================
-- 1. QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
-- =====================================================

-- Bảng vai trò người dùng
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- =====================================================
-- 2. QUẢN LÝ VÙNG ĐỊA LÝ
-- =====================================================

-- Bảng tỉnh/thành phố
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50) -- Miền Bắc, Trung, Nam
);

-- Bảng huyện/quận
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    province_id INTEGER REFERENCES provinces(id) ON DELETE CASCADE
);

-- Bảng xã/phường
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. QUẢN LÝ CÂY TRỒNG & QUY TRÌNH KỸ THUẬT
-- =====================================================

-- Bảng danh mục cây trồng
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100), -- Rau, Củ, Quả, Hoa...
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng quy trình kỹ thuật chuẩn (Template)
CREATE TABLE technical_processes (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- VD: "Quy trình trồng Dưa lưới 75 ngày"
    total_days INTEGER NOT NULL, -- Tổng số ngày của quy trình
    standard_type VARCHAR(50), -- VietGAP, GlobalGAP, Organic...
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng các giai đoạn trong quy trình
CREATE TABLE process_stages (
    id SERIAL PRIMARY KEY,
    process_id INTEGER REFERENCES technical_processes(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL, -- Thứ tự giai đoạn: 1, 2, 3...
    name VARCHAR(255) NOT NULL, -- VD: "Chuẩn bị đất", "Gieo hạt", "Chăm sóc"
    day_start INTEGER NOT NULL, -- Ngày bắt đầu (từ ngày 1)
    day_end INTEGER NOT NULL, -- Ngày kết thúc
    description TEXT,
    CONSTRAINT check_day_range CHECK (day_end >= day_start)
);

-- Bảng công việc chi tiết trong từng giai đoạn
CREATE TABLE stage_tasks (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER REFERENCES process_stages(id) ON DELETE CASCADE,
    task_order INTEGER NOT NULL,
    day_number INTEGER NOT NULL, -- Ngày thực hiện (trong khoảng day_start -> day_end)
    task_name VARCHAR(255) NOT NULL, -- VD: "Bón phân NPK"
    description TEXT,
    materials_needed TEXT, -- Vật tư cần thiết
    quantity_per_hectare VARCHAR(100), -- Liều lượng/ha
    notes TEXT
);

-- Index cho query nhanh
CREATE INDEX idx_process_stages_process ON process_stages(process_id);
CREATE INDEX idx_stage_tasks_stage ON stage_tasks(stage_id);

-- =====================================================
-- 4. QUẢN LÝ NÔNG HỘ & VÙNG TRỒNG
-- =====================================================

-- Bảng hợp tác xã / doanh nghiệp
CREATE TABLE cooperatives (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50),
    address TEXT,
    ward_id INTEGER REFERENCES wards(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nông hộ
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farmer_code VARCHAR(50) UNIQUE NOT NULL,
    cooperative_id INTEGER REFERENCES cooperatives(id),
    address TEXT,
    ward_id INTEGER REFERENCES wards(id),
    id_card VARCHAR(20),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng vùng trồng (Farm/Field)
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- VD: "Vườn A", "Lô 1"
    area_hectare DECIMAL(10, 2) NOT NULL, -- Diện tích (ha)
    location_lat DECIMAL(10, 8), -- Tọa độ GPS
    location_lng DECIMAL(11, 8),
    ward_id INTEGER REFERENCES wards(id),
    soil_type VARCHAR(100), -- Loại đất
    water_source VARCHAR(100), -- Nguồn nước
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. QUẢN LÝ VỤ MÙA & CANH TÁC
-- =====================================================

-- Bảng vụ mùa (Season)
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    season_code VARCHAR(50) UNIQUE NOT NULL,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id),
    process_id INTEGER REFERENCES technical_processes(id), -- Quy trình áp dụng
    start_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    area_planted DECIMAL(10, 2), -- Diện tích trồng thực tế
    status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, harvesting, completed, cancelled
    expected_yield DECIMAL(10, 2), -- Sản lượng dự kiến (tấn)
    actual_yield DECIMAL(10, 2), -- Sản lượng thực tế
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng công việc hàng ngày (Timeline tự động sinh)
CREATE TABLE daily_tasks (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    stage_task_id INTEGER REFERENCES stage_tasks(id), -- Liên kết với template
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    completed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhật ký canh tác (Farmer's log)
CREATE TABLE farming_logs (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    daily_task_id INTEGER REFERENCES daily_tasks(id),
    log_date DATE NOT NULL,
    activity_type VARCHAR(100), -- Bón phân, Tưới nước, Phun thuốc...
    description TEXT,
    materials_used TEXT,
    quantity_used VARCHAR(100),
    cost DECIMAL(12, 2),
    weather_condition VARCHAR(100),
    images TEXT[], -- Array các URL ảnh
    logged_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_seasons_farm ON seasons(farm_id);
CREATE INDEX idx_seasons_status ON seasons(status);
CREATE INDEX idx_daily_tasks_season ON daily_tasks(season_id);
CREATE INDEX idx_daily_tasks_due_date ON daily_tasks(due_date);

-- =====================================================
-- 6. QUẢN LÝ GIÁ CẢ THỊ TRƯỜNG
-- =====================================================

-- Bảng nguồn dữ liệu giá
CREATE TABLE price_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50), -- API, Manual, Crawler
    url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);

-- Bảng giá thị trường
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    price_min DECIMAL(12, 2), -- Giá thấp nhất (VNĐ/kg)
    price_max DECIMAL(12, 2), -- Giá cao nhất
    price_avg DECIMAL(12, 2), -- Giá trung bình
    market_location VARCHAR(255), -- Chợ đầu mối, vùng...
    source_id INTEGER REFERENCES price_sources(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_price_entry UNIQUE (crop_id, price_date, market_location)
);

-- Index cho query theo thời gian
CREATE INDEX idx_market_prices_crop_date ON market_prices(crop_id, price_date DESC);

-- =====================================================
-- 7. QUẢN LÝ DỰ BÁO & AI
-- =====================================================

-- Bảng dự báo nhu cầu thị trường
CREATE TABLE demand_forecasts (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id),
    forecast_date DATE NOT NULL, -- Ngày dự báo
    forecast_for_month DATE NOT NULL, -- Dự báo cho tháng nào
    predicted_demand DECIMAL(12, 2), -- Nhu cầu dự kiến (tấn)
    predicted_price DECIMAL(12, 2), -- Giá dự kiến
    confidence_score DECIMAL(5, 2), -- Độ tin cậy (0-100)
    model_version VARCHAR(50), -- Phiên bản model AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng khuyến nghị trồng trọt
CREATE TABLE planting_recommendations (
    id SERIAL PRIMARY KEY,
    cooperative_id INTEGER REFERENCES cooperatives(id),
    crop_id INTEGER REFERENCES crops(id),
    recommended_area DECIMAL(10, 2), -- Diện tích khuyến nghị (ha)
    recommended_start_date DATE,
    expected_price DECIMAL(12, 2),
    reason TEXT, -- Lý do khuyến nghị
    priority_level INTEGER, -- 1: Cao, 2: Trung bình, 3: Thấp
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. QUẢN LÝ CHATBOT & TƯƠNG TÁC
-- =====================================================

-- Bảng lịch sử chat
CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(50), -- Telegram, Web, Mobile
    platform_user_id VARCHAR(255), -- Telegram chat_id
    message_type VARCHAR(50), -- text, image, location
    user_message TEXT,
    bot_response TEXT,
    intent VARCHAR(100), -- price_inquiry, technical_question, weather...
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng câu hỏi thường gặp (FAQ)
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[], -- Array keywords để search
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. QUẢN LÝ CẢNH BÁO & THÔNG BÁO
-- =====================================================

-- Bảng cảnh báo
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50), -- weather, pest, disease, price_drop
    severity VARCHAR(20), -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    affected_area_ids INTEGER[], -- Array ward_id hoặc district_id
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thông báo đã gửi
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    alert_id INTEGER REFERENCES alerts(id),
    channel VARCHAR(50), -- telegram, email, sms, push
    status VARCHAR(50), -- sent, delivered, failed
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. DỮ LIỆU MẪU (SEED DATA)
-- =====================================================

-- Insert roles
INSERT INTO roles (name, description) VALUES
('admin', 'Quản trị viên hệ thống'),
('cooperative_manager', 'Quản lý HTX/Doanh nghiệp'),
('farmer', 'Nông dân'),
('staff', 'Nhân viên');

-- Insert sample crops
INSERT INTO crops (code, name, scientific_name, category, description) VALUES
('DL001', 'Dưa lưới', 'Cucumis melo', 'Quả', 'Dưa lưới Nhật Bản, giá trị kinh tế cao'),
('OI001', 'Ổi', 'Psidium guajava', 'Quả', 'Ổi ta, ổi Đài Loan'),
('CT001', 'Cà chua', 'Solanum lycopersicum', 'Quả', 'Cà chua bi, cà chua thường'),
('XL001', 'Xà lách', 'Lactuca sativa', 'Rau', 'Xà lách xoong, xà lách Mỹ'),
('BN001', 'Bí ngô', 'Cucurbita moschata', 'Quả', 'Bí ngô Nhật');

-- Insert price sources
INSERT INTO price_sources (name, source_type, url, is_active) VALUES
('Chợ đầu mối Bình Điền', 'Manual', NULL, TRUE),
('Agro Market API', 'API', 'https://api.agromarket.vn', TRUE),
('Crawler Nông nghiệp VN', 'Crawler', 'https://nongnghiep.vn', TRUE);

-- =====================================================
-- 11. VIEWS & FUNCTIONS HỮU ÍCH
-- =====================================================

-- View: Thống kê vụ mùa đang hoạt động
CREATE OR REPLACE VIEW active_seasons_summary AS
SELECT 
    s.id,
    s.season_code,
    f.name AS farm_name,
    u.full_name AS farmer_name,
    c.name AS crop_name,
    s.start_date,
    s.expected_harvest_date,
    s.area_planted,
    s.status,
    CURRENT_DATE - s.start_date AS days_elapsed
FROM seasons s
JOIN farms f ON s.farm_id = f.id
JOIN farmers fr ON f.farmer_id = fr.id
JOIN users u ON fr.user_id = u.id
JOIN crops c ON s.crop_id = c.id
WHERE s.status IN ('planning', 'in_progress', 'harvesting');

-- View: Giá thị trường mới nhất
CREATE OR REPLACE VIEW latest_market_prices AS
SELECT DISTINCT ON (crop_id)
    crop_id,
    c.name AS crop_name,
    price_date,
    price_avg,
    price_min,
    price_max,
    market_location
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
ORDER BY crop_id, price_date DESC;

-- Function: Tự động tạo daily_tasks khi tạo season mới
CREATE OR REPLACE FUNCTION generate_daily_tasks_for_season()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_tasks (season_id, stage_task_id, task_name, description, due_date)
    SELECT 
        NEW.id,
        st.id,
        st.task_name,
        st.description,
        NEW.start_date + (st.day_number - 1)
    FROM stage_tasks st
    JOIN process_stages ps ON st.stage_id = ps.id
    WHERE ps.process_id = NEW.process_id
    ORDER BY st.day_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động sinh tasks khi insert season
CREATE TRIGGER trigger_generate_tasks
AFTER INSERT ON seasons
FOR EACH ROW
EXECUTE FUNCTION generate_daily_tasks_for_season();

-- Function: Cập nhật updated_at tự động
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger cho các bảng cần track update time
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- KẾT THÚC SCHEMA
-- =====================================================

-- Ghi chú:
-- 1. Chạy script này trên PostgreSQL 14+
-- 2. Đảm bảo đã tạo database trước: CREATE DATABASE agri_supply_chain;
-- 3. Có thể mở rộng thêm bảng: weather_data, soil_analysis, pest_reports...
-- 4. Cân nhắc partitioning cho bảng lớn như market_prices, chat_logs theo thời gian
-- =====================================================
-- DỮ LIỆU ĐỊA ĐIỂM TOÀN BỘ VIỆT NAM
-- 63 Tỉnh/Thành phố
-- =====================================================

-- =====================================================
-- 63 TỈNH/THÀNH PHỐ VIỆT NAM
-- =====================================================

INSERT INTO provinces (code, name, region) VALUES
-- MIỀN BẮC
('01', 'Thành phố Hà Nội', 'Miền Bắc'),
('02', 'Tỉnh Hà Giang', 'Miền Bắc'),
('04', 'Tỉnh Cao Bằng', 'Miền Bắc'),
('06', 'Tỉnh Bắc Kạn', 'Miền Bắc'),
('08', 'Tỉnh Tuyên Quang', 'Miền Bắc'),
('10', 'Tỉnh Lào Cai', 'Miền Bắc'),
('11', 'Tỉnh Điện Biên', 'Miền Bắc'),
('12', 'Tỉnh Lai Châu', 'Miền Bắc'),
('14', 'Tỉnh Sơn La', 'Miền Bắc'),
('15', 'Tỉnh Yên Bái', 'Miền Bắc'),
('17', 'Tỉnh Hoà Bình', 'Miền Bắc'),
('19', 'Tỉnh Thái Nguyên', 'Miền Bắc'),
('20', 'Tỉnh Lạng Sơn', 'Miền Bắc'),
('22', 'Tỉnh Quảng Ninh', 'Miền Bắc'),
('24', 'Tỉnh Bắc Giang', 'Miền Bắc'),
('25', 'Tỉnh Phú Thọ', 'Miền Bắc'),
('26', 'Tỉnh Vĩnh Phúc', 'Miền Bắc'),
('27', 'Tỉnh Bắc Ninh', 'Miền Bắc'),
('30', 'Tỉnh Hải Dương', 'Miền Bắc'),
('31', 'Thành phố Hải Phòng', 'Miền Bắc'),
('33', 'Tỉnh Hưng Yên', 'Miền Bắc'),
('34', 'Tỉnh Thái Bình', 'Miền Bắc'),
('35', 'Tỉnh Hà Nam', 'Miền Bắc'),
('36', 'Tỉnh Nam Định', 'Miền Bắc'),
('37', 'Tỉnh Ninh Bình', 'Miền Bắc'),

-- MIỀN TRUNG
('38', 'Tỉnh Thanh Hóa', 'Miền Trung'),
('40', 'Tỉnh Nghệ An', 'Miền Trung'),
('42', 'Tỉnh Hà Tĩnh', 'Miền Trung'),
('44', 'Tỉnh Quảng Bình', 'Miền Trung'),
('45', 'Tỉnh Quảng Trị', 'Miền Trung'),
('46', 'Tỉnh Thừa Thiên Huế', 'Miền Trung'),
('48', 'Thành phố Đà Nẵng', 'Miền Trung'),
('49', 'Tỉnh Quảng Nam', 'Miền Trung'),
('51', 'Tỉnh Quảng Ngãi', 'Miền Trung'),
('52', 'Tỉnh Bình Định', 'Miền Trung'),
('54', 'Tỉnh Phú Yên', 'Miền Trung'),
('56', 'Tỉnh Khánh Hòa', 'Miền Trung'),
('58', 'Tỉnh Ninh Thuận', 'Miền Trung'),
('60', 'Tỉnh Bình Thuận', 'Miền Trung'),

-- TÂY NGUYÊN
('62', 'Tỉnh Kon Tum', 'Tây Nguyên'),
('64', 'Tỉnh Gia Lai', 'Tây Nguyên'),
('66', 'Tỉnh Đắk Lắk', 'Tây Nguyên'),
('67', 'Tỉnh Đắk Nông', 'Tây Nguyên'),
('68', 'Tỉnh Lâm Đồng', 'Tây Nguyên'),

-- MIỀN NAM
('70', 'Tỉnh Bình Phước', 'Miền Nam'),
('72', 'Tỉnh Tây Ninh', 'Miền Nam'),
('74', 'Tỉnh Bình Dương', 'Miền Nam'),
('75', 'Tỉnh Đồng Nai', 'Miền Nam'),
('77', 'Tỉnh Bà Rịa - Vũng Tàu', 'Miền Nam'),
('79', 'Thành phố Hồ Chí Minh', 'Miền Nam'),
('80', 'Tỉnh Long An', 'Miền Nam'),
('82', 'Tỉnh Tiền Giang', 'Miền Nam'),
('83', 'Tỉnh Bến Tre', 'Miền Nam'),
('84', 'Tỉnh Trà Vinh', 'Miền Nam'),
('86', 'Tỉnh Vĩnh Long', 'Miền Nam'),
('87', 'Tỉnh Đồng Tháp', 'Miền Nam'),
('89', 'Tỉnh An Giang', 'Miền Nam'),
('91', 'Tỉnh Kiên Giang', 'Miền Nam'),
('92', 'Thành phố Cần Thơ', 'Miền Nam'),
('93', 'Tỉnh Hậu Giang', 'Miền Nam'),
('94', 'Tỉnh Sóc Trăng', 'Miền Nam'),
('95', 'Tỉnh Bạc Liêu', 'Miền Nam'),
('96', 'Tỉnh Cà Mau', 'Miền Nam');

-- =====================================================
-- KẾT THÚC - Tổng cộng 63 tỉnh/thành phố
-- =====================================================

-- Ghi chú: 
-- Để thêm quận/huyện và xã/phường chi tiết, cần file riêng do dữ liệu rất lớn (700+ huyện, 11000+ xã)
-- Có thể import từ API hoặc file JSON của Tổng cục Thống kê
-- =====================================================
-- SEED DATA - DỮ LIỆU MẪU CHI TIẾT
-- Chạy sau khi đã chạy schema.sql
-- =====================================================

-- =====================================================
-- 1. USERS & ROLES
-- =====================================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, phone, role_id) VALUES
('admin', 'admin@agrisupply.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Bs8Vw6', 'Nguyễn Văn Admin', '0901234567', 1),
('htx_manager', 'manager@htxbinhtan.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Bs8Vw6', 'Trần Thị Lan', '0912345678', 2),
('farmer1', 'farmer1@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Bs8Vw6', 'Lê Văn Nông', '0923456789', 3),
('farmer2', 'farmer2@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Bs8Vw6', 'Phạm Thị Hoa', '0934567890', 3),
('farmer3', 'farmer3@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Bs8Vw6', 'Hoàng Văn Tám', '0945678901', 3);

-- =====================================================
-- 2. ĐỊA ĐIỂM (Mở rộng)
-- =====================================================

-- Districts (Code format: ProvinceCode + DistrictNumber)
INSERT INTO districts (code, name, province_id) VALUES
('79001', 'Quận 1', 1),
('79007', 'Quận 7', 1),
('79012', 'Huyện Củ Chi', 1),
('83001', 'Thành phố Bến Tre', 2),
('83002', 'Huyện Châu Thành', 2),
('87001', 'Thành phố Cao Lãnh', 3),
('87002', 'Huyện Tháp Mười', 3);

-- Wards (Code format: DistrictCode + WardNumber)
INSERT INTO wards (code, name, district_id) VALUES
('79001001', 'Phường Bến Nghé', 1),
('79001002', 'Phường Bến Thành', 1),
('79007001', 'Phường Tân Phú', 2),
('79012001', 'Xã Phú Mỹ Hưng', 3),
('79012002', 'Xã Tân An Hội', 3),
('83001001', 'Phường 1', 4),
('83002001', 'Xã Sơn Hòa', 5);

-- =====================================================
-- 3. COOPERATIVES & FARMERS
-- =====================================================

INSERT INTO cooperatives (code, name, tax_code, address, ward_id, phone, email, manager_id) VALUES
('HTX001', 'HTX Nông nghiệp Bình Tân', '0123456789', '123 Đường Tân Kỳ Tân Quý', 4, '0281234567', 'htxbinhtan@gmail.com', 2),
('HTX002', 'HTX Rau sạch Củ Chi', '0987654321', '456 Tỉnh lộ 8', 5, '0287654321', 'htxcuchi@gmail.com', 2);

INSERT INTO farmers (user_id, farmer_code, cooperative_id, address, ward_id, id_card, bank_account, bank_name) VALUES
(3, 'ND001', 1, '789 Ấp 3', 4, '079123456789', '1234567890', 'Vietcombank'),
(4, 'ND002', 1, '456 Ấp 2', 4, '079987654321', '0987654321', 'Agribank'),
(5, 'ND003', 2, '123 Ấp 1', 5, '079456789123', '4567891230', 'Sacombank');

-- =====================================================
-- 4. FARMS (Vùng trồng)
-- =====================================================

INSERT INTO farms (farmer_id, name, area_hectare, location_lat, location_lng, ward_id, soil_type, water_source) VALUES
(1, 'Vườn A - Dưa lưới', 0.5, 10.8231, 106.6297, 4, 'Đất phù sa', 'Giếng khoan'),
(1, 'Vườn B - Rau xanh', 0.3, 10.8235, 106.6301, 4, 'Đất phù sa', 'Kênh tưới'),
(2, 'Lô 1 - Ổi', 1.2, 10.8240, 106.6310, 4, 'Đất xám', 'Ao'),
(3, 'Vườn Củ Chi 1', 2.0, 10.9745, 106.4978, 5, 'Đất đỏ bazan', 'Sông Sài Gòn');

-- =====================================================
-- 5. QUY TRÌNH KỸ THUẬT CHI TIẾT
-- =====================================================

-- Quy trình 1: Dưa lưới 75 ngày
INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) VALUES
(1, 'Quy trình trồng Dưa lưới Nhật 75 ngày - VietGAP', 75, 'VietGAP', 'Quy trình chuẩn cho dưa lưới trong nhà lưới', TRUE, 1);

-- Giai đoạn 1: Chuẩn bị (Ngày 1-7)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(1, 1, 'Chuẩn bị đất và gieo hạt', 1, 7, 'Làm đất, khử trùng, gieo hạt trong khay');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare, notes) VALUES
(1, 1, 1, 'Làm đất và phơi', 'Cày xới đất sâu 30cm, phơi 3-5 ngày', 'Máy cày, xẻng', NULL, 'Chọn ngày nắng'),
(1, 2, 3, 'Bón phân lót', 'Bón phân hữu cơ hoai mục', 'Phân chuồng hoai mục', '5 tấn/ha', 'Trộn đều với đất'),
(1, 3, 5, 'Làm luống và phủ nilon', 'Làm luống cao 30cm, rộng 1.2m', 'Nilon phủ đen', '1000m²/ha', 'Khoảng cách luống 1.5m'),
(1, 4, 7, 'Gieo hạt vào khay', 'Gieo hạt vào khay 50 lỗ', 'Hạt giống F1, khay nhựa, phân trùn', '200g hạt/ha', 'Giữ ẩm 80%');

-- Giai đoạn 2: Chăm sóc cây con (Ngày 8-20)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(1, 2, 'Chăm sóc cây con và trồng', 8, 20, 'Chăm sóc cây con trong khay, trồng ra luống');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare, notes) VALUES
(2, 1, 8, 'Tưới nước cho khay gieo', 'Tưới phun sương 2 lần/ngày', 'Vòi phun sương', NULL, 'Sáng và chiều'),
(2, 2, 12, 'Bón phân thúc lần 1 cho cây con', 'Phun phân NPK 20-20-20', 'NPK 20-20-20', '5g/lít nước', 'Pha loãng'),
(2, 3, 15, 'Trồng cây con ra luống', 'Trồng khi cây có 3-4 lá thật', NULL, '3500 cây/ha', 'Khoảng cách 50x60cm'),
(2, 4, 17, 'Tưới nước định kỳ', 'Tưới nhỏ giọt 2 lần/ngày', 'Hệ thống tưới nhỏ giọt', NULL, 'Buổi sáng và chiều');

-- Giai đoạn 3: Sinh trưởng và ra hoa (Ngày 21-35)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(1, 3, 'Sinh trưởng thân lá', 21, 35, 'Cây phát triển thân lá, chuẩn bị ra hoa');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare, notes) VALUES
(3, 1, 21, 'Dẫn dây leo', 'Dựng giàn và dẫn dây cho cây leo', 'Dây nilon, cọc tre', NULL, 'Chiều cao 2m'),
(3, 2, 25, 'Bón phân thúc lần 2', 'Bón NPK 16-16-8', 'NPK 16-16-8', '150kg/ha', 'Bón cách gốc 15cm'),
(3, 3, 28, 'Tỉa cành', 'Tỉa bỏ cành nhánh phụ', 'Kéo cắt cành', NULL, 'Để 1 thân chính'),
(3, 4, 30, 'Phun thuốc phòng bệnh', 'Phun thuốc phòng sâu đục thân', 'Thuốc sinh học', '500ml/ha', 'Phun buổi chiều');

-- Giai đoạn 4: Thụ phấn và đậu quả (Ngày 36-50)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(1, 4, 'Ra hoa và thụ phấn', 36, 50, 'Cây ra hoa, thụ phấn nhân tạo');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare, notes) VALUES
(4, 1, 36, 'Thụ phấn nhân tạo', 'Dùng cọ lông thụ phấn', 'Cọ lông mềm', NULL, 'Buổi sáng 6-8h'),
(4, 2, 38, 'Chọn quả', 'Chọn 1-2 quả/cây tốt nhất', NULL, NULL, 'Quả đều, không dị tật'),
(4, 3, 40, 'Bón phân thúc lần 3', 'Bón phân kali tăng độ ngọt', 'K2SO4', '100kg/ha', 'Giai đoạn quả non'),
(4, 4, 45, 'Đặt lưới đỡ quả', 'Đặt lưới hoặc giỏ đỡ quả', 'Lưới nhựa', '3500 cái/ha', 'Tránh quả chạm đất');

-- Giai đoạn 5: Chăm sóc quả và thu hoạch (Ngày 51-75)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(1, 5, 'Chăm sóc quả và thu hoạch', 51, 75, 'Quả phát triển, chăm sóc đến khi thu hoạch');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare, notes) VALUES
(5, 1, 51, 'Giảm tưới nước', 'Giảm lượng nước tưới 30%', NULL, NULL, 'Tăng độ ngọt'),
(5, 2, 55, 'Bón phân lá', 'Phun phân lá tăng cường dinh dưỡng', 'Phân lá NPK', '1kg/ha', 'Pha 1g/lít'),
(5, 3, 60, 'Kiểm tra độ ngọt', 'Dùng máy đo Brix', 'Máy đo Brix', NULL, 'Đạt 13-15 Brix'),
(5, 4, 70, 'Cắt tỉa lá già', 'Cắt bỏ lá già phía dưới', 'Kéo cắt', NULL, 'Tăng thông thoáng'),
(5, 5, 75, 'Thu hoạch', 'Thu hoạch khi quả chín', 'Thùng nhựa, dao', NULL, 'Sáng sớm hoặc chiều mát');

-- Quy trình 2: Ổi 120 ngày (rút gọn)
INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) VALUES
(2, 'Quy trình trồng Ổi Đài Loan 120 ngày', 120, 'VietGAP', 'Quy trình từ cây giống đến thu hoạch đợt đầu', TRUE, 1);

INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(2, 1, 'Trồng và chăm sóc cây con', 1, 30, 'Trồng cây giống và chăm sóc giai đoạn đầu'),
(2, 2, 'Phát triển tán', 31, 60, 'Cây phát triển tán lá'),
(2, 3, 'Ra hoa và đậu quả', 61, 90, 'Cây ra hoa, thụ phấn và đậu quả'),
(2, 4, 'Chăm sóc quả', 91, 120, 'Quả phát triển đến thu hoạch');

-- =====================================================
-- 6. VỤ MÙA (SEASONS)
-- =====================================================

INSERT INTO seasons (season_code, farm_id, crop_id, process_id, start_date, expected_harvest_date, area_planted, status, expected_yield) VALUES
('VM2024001', 1, 1, 1, '2024-01-15', '2024-03-31', 0.5, 'completed', 2.5),
('VM2024002', 2, 4, NULL, '2024-02-01', '2024-04-15', 0.3, 'completed', 1.2),
('VM2024003', 3, 2, 2, '2024-03-01', '2024-06-29', 1.2, 'in_progress', 15.0),
('VM2024004', 1, 1, 1, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '55 days', 0.5, 'in_progress', 2.8),
('VM2024005', 4, 1, 1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '65 days', 1.0, 'in_progress', 5.0);

-- =====================================================
-- 7. GIÁ THỊ TRƯỜNG (30 ngày gần nhất)
-- =====================================================

-- Hàm tạo giá ngẫu nhiên cho 30 ngày - TẤT CẢ CÂY TRỒNG
DO $$
DECLARE
    i INTEGER;
    crop_prices RECORD;
BEGIN
    FOR crop_prices IN 
        SELECT id, code,
        CASE 
            -- 5 cây trồng đầu tiên
            WHEN code = 'DL001' THEN 45000  -- Dưa lưới
            WHEN code = 'OI001' THEN 18000  -- Ổi
            WHEN code = 'CT001' THEN 12000  -- Cà chua
            WHEN code = 'XL001' THEN 25000  -- Xà lách
            WHEN code = 'BN001' THEN 8000   -- Bí ngô
            -- Các cây trồng mở rộng
            WHEN code = 'RM001' THEN 8000   -- Rau muống
            WHEN code = 'CM001' THEN 12000  -- Cải ngọt
            WHEN code = 'RM002' THEN 9000   -- Rau má
            WHEN code = 'BC001' THEN 15000  -- Bắp cải
            WHEN code = 'KL001' THEN 18000  -- Khoai lang
            WHEN code = 'KT001' THEN 20000  -- Khoai tây
            WHEN code = 'CU001' THEN 10000  -- Củ cải trắng
            WHEN code = 'DH001' THEN 10000  -- Dưa hấu
            WHEN code = 'OT001' THEN 35000  -- Ớt
            WHEN code = 'DG001' THEN 15000  -- Dưa gang
            WHEN code = 'TP001' THEN 25000  -- Thanh long
            WHEN code = 'CH001' THEN 30000  -- Chanh
            WHEN code = 'HC001' THEN 40000  -- Hành củ
            WHEN code = 'TL001' THEN 80000  -- Tỏi
            WHEN code = 'GG001' THEN 50000  -- Gừng
            ELSE 10000
        END as base_price
        FROM crops
    LOOP
        FOR i IN 0..29 LOOP
            INSERT INTO market_prices (crop_id, price_date, price_min, price_max, price_avg, market_location, source_id)
            VALUES (
                crop_prices.id,
                CURRENT_DATE - i,
                crop_prices.base_price * (0.85 + random() * 0.1),
                crop_prices.base_price * (1.05 + random() * 0.1),
                crop_prices.base_price * (0.95 + random() * 0.1),
                'Chợ đầu mối Bình Điền',
                1
            );
        END LOOP;
    END LOOP;
END $$;


-- =====================================================
-- 8. FAQs (Câu hỏi thường gặp)
-- =====================================================

INSERT INTO faqs (category, question, answer, keywords) VALUES
('Kỹ thuật', 'Dưa lưới bị vàng lá phải làm sao?', 
 'Nguyên nhân có thể do thiếu dinh dưỡng (N, Fe) hoặc úng nước. Giải pháp: 1) Kiểm tra độ ẩm đất, thoát nước nếu cần. 2) Bón phân NPK 20-20-20 hoặc phun phân lá. 3) Kiểm tra sâu bệnh.', 
 ARRAY['vàng lá', 'dưa lưới', 'bệnh']),
 
('Kỹ thuật', 'Khi nào nên thu hoạch dưa lưới?', 
 'Thu hoạch khi: 1) Quả đạt 13-15 độ Brix (đo bằng máy). 2) Cuống quả chuyển màu vàng. 3) Vỏ quả có mùi thơm đặc trưng. Thời gian: 70-80 ngày sau trồng.', 
 ARRAY['thu hoạch', 'dưa lưới', 'thời điểm']),
 
('Giá cả', 'Giá dưa lưới hiện tại như thế nào?', 
 'Giá dưa lưới dao động 35.000-55.000 VNĐ/kg tùy chất lượng. Loại 1 (1.2-1.5kg/quả): 50.000-55.000đ. Loại 2 (0.8-1.2kg): 35.000-45.000đ.', 
 ARRAY['giá', 'dưa lưới', 'thị trường']),
 
('Kỹ thuật', 'Cách phòng sâu đục thân trên dưa?', 
 'Biện pháp phòng trừ: 1) Sử dụng bẫy đèn UV. 2) Phun thuốc sinh học Bt (Bacillus thuringiensis) 7 ngày/lần. 3) Kiểm tra thường xuyên, bắt sâu non. 4) Luân canh cây trồng.', 
 ARRAY['sâu bệnh', 'dưa', 'phòng trừ']),
 
('Thị trường', 'Mùa nào trồng dưa lưới lãi nhất?', 
 'Tết Nguyên Đán (tháng 1-2 âm lịch) giá cao nhất, có thể đạt 60.000-80.000đ/kg. Nên trồng sao cho thu hoạch trước Tết 15-20 ngày.', 
 ARRAY['mùa vụ', 'lãi', 'tết']);

-- =====================================================
-- 9. ALERTS (Cảnh báo mẫu)
-- =====================================================

INSERT INTO alerts (alert_type, severity, title, message, affected_area_ids, valid_from, valid_until, is_active) VALUES
('weather', 'high', 'Cảnh báo mưa lớn', 
 'Dự báo mưa lớn trong 3 ngày tới. Nông dân cần: 1) Kiểm tra hệ thống thoát nước. 2) Che chắn cho cây non. 3) Tạm ngưng phun thuốc.', 
 ARRAY[4, 5], 
 CURRENT_TIMESTAMP, 
 CURRENT_TIMESTAMP + INTERVAL '3 days', 
 TRUE),
 
('pest', 'medium', 'Phát hiện sâu đục thân', 
 'Phát hiện sâu đục thân ở vùng Củ Chi. Khuyến cáo: Kiểm tra vườn, sử dụng bẫy đèn và thuốc sinh học.', 
 ARRAY[5], 
 CURRENT_TIMESTAMP, 
 CURRENT_TIMESTAMP + INTERVAL '7 days', 
 TRUE);

-- =====================================================
-- KẾT THÚC SEED DATA
-- =====================================================
-- =====================================================
-- MỞ RỘNG SẢN PHẨM VÀ QUY TRÌNH KỸ THUẬT
-- Thêm nhiều cây trồng và quy trình chi tiết
-- =====================================================

-- =====================================================
-- THÊM CÂY TRỒNG
-- =====================================================

INSERT INTO crops (code, name, scientific_name, category, description) VALUES
-- Rau ăn lá
('RM001', 'Rau muống', 'Ipomoea aquatica', 'Rau', 'Rau muống nước, rau muống cạn'),
('CM001', 'Cải ngọt', 'Brassica chinensis', 'Rau', 'Cải ngọt Trung Quốc'),
('RM002', 'Rau má', 'Centella asiatica', 'Rau', 'Rau má nước'),
('BC001', 'Bắp cải', 'Brassica oleracea', 'Rau', 'Bắp cải trắng'),

-- Củ
('KL001', 'Khoai lang', 'Ipomoea batatas', 'Củ', 'Khoai lang tím, vàng'),
('KT001', 'Khoai tây', 'Solanum tuberosum', 'Củ', 'Khoai tây Đà Lạt'),
('CU001', 'Củ cải trắng', 'Raphanus sativus', 'Củ', 'Củ cải trắng Nhật'),

-- Quả
('DH001', 'Dưa hấu', 'Citrullus lanatus', 'Quả', 'Dưa hấu không hạt'),
('OT001', 'Ớt', 'Capsicum annuum', 'Quả', 'Ớt hiểm, ớt chuông'),
('DG001', 'Dưa gang', 'Cucumis melo', 'Quả', 'Dưa gang vàng'),
('TP001', 'Thanh long', 'Hylocereus undatus', 'Quả', 'Thanh long ruột đỏ'),
('CH001', 'Chanh', 'Citrus limon', 'Quả', 'Chanh không hạt'),

-- Cây gia vị
('HC001', 'Hành củ', 'Allium cepa', 'Gia vị', 'Hành tây'),
('TL001', 'Tỏi', 'Allium sativum', 'Gia vị', 'Tỏi ta, tỏi Lý Sơn'),
('GG001', 'Gừng', 'Zingiber officinale', 'Gia vị', 'Gừng già');

-- =====================================================
-- QUY TRÌNH 3: CÀ CHUA 90 NGÀY
-- =====================================================

INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) 
VALUES (3, 'Quy trình trồng Cà chua bi 90 ngày - VietGAP', 90, 'VietGAP', 'Cà chua bi trong nhà lưới', TRUE, 1);

-- Giai đoạn 1: Ươm cây (1-20)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(3, 1, 'Ươm hạt và chăm sóc cây con', 1, 20, 'Gieo hạt, chăm sóc cây con đến khi trồng');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(4, 1, 1, 'Gieo hạt vào khay', 'Gieo hạt vào khay 50 lỗ', 'Hạt F1, khay, phân trùn', '100g/ha'),
(4, 2, 3, 'Tưới phun sương', 'Tưới 2 lần/ngày', 'Vòi phun', NULL),
(4, 3, 10, 'Bón phân lá lần 1', 'Phun NPK 20-20-20', 'NPK 20-20-20', '2kg/ha'),
(4, 4, 15, 'Chuyển sang chậu lớn', 'Chuyển sang túi 10x15cm', 'Túi ni lông', '5000 cái'),
(4, 5, 20, 'Trồng ra luống', 'Trồng khoảng cách 40x50cm', NULL, '5000 cây/ha');

-- Giai đoạn 2: Sinh trưởng (21-40)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(3, 2, 'Sinh trưởng thân lá', 21, 40, 'Cây phát triển thân lá');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(5, 1, 22, 'Dựng giàn', 'Dựng giàn cao 1.8m', 'Cọc tre, dây', NULL),
(5, 2, 25, 'Bón phân thúc 1', 'Bón NPK 16-16-8', 'NPK', '200kg/ha'),
(5, 3, 30, 'Tỉa cành nhánh', 'Để 2-3 thân chính', 'Kéo', NULL),
(5, 4, 35, 'Phun thuốc phòng bệnh', 'Phòng bệnh héo xanh', 'Thuốc sinh học', '500ml/ha');

-- Giai đoạn 3: Ra hoa đậu quả (41-60)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(3, 3, 'Ra hoa và đậu quả', 41, 60, 'Cây ra hoa, đậu quả');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(6, 1, 42, 'Rung cây thụ phấn', 'Rung nhẹ cây buổi sáng', NULL, NULL),
(6, 2, 45, 'Bón phân thúc 2', 'Bón phân kali', 'K2SO4', '150kg/ha'),
(6, 3, 50, 'Tỉa lá già', 'Tỉa lá già phía dưới', 'Kéo', NULL),
(6, 4, 55, 'Phun canxi', 'Phòng nứt quả', 'CaCl2', '1kg/ha');

-- Giai đoạn 4: Thu hoạch (61-90)
INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(3, 4, 'Thu hoạch', 61, 90, 'Thu hoạch nhiều đợt');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(7, 1, 61, 'Thu hoạch đợt 1', 'Hái quả chín đỏ 80%', 'Rổ nhựa', NULL),
(7, 2, 65, 'Bón phân sau thu hoạch', 'Bón NPK', 'NPK 16-16-8', '100kg/ha'),
(7, 3, 70, 'Thu hoạch đợt 2', 'Hái quả tiếp', 'Rổ nhựa', NULL),
(7, 4, 80, 'Thu hoạch đợt 3', 'Hái quả', 'Rổ nhựa', NULL),
(7, 5, 90, 'Thu hoạch cuối', 'Hái hết quả còn lại', 'Rổ nhựa', NULL);

-- =====================================================
-- QUY TRÌNH 4: XÀ LÁCH 45 NGÀY
-- =====================================================

INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) 
VALUES (4, 'Quy trình trồng Xà lách xoong 45 ngày', 45, 'VietGAP', 'Xà lách thủy canh hoặc đất', TRUE, 1);

INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(4, 1, 'Gieo hạt và ươm', 1, 15, 'Gieo hạt, ươm cây con'),
(4, 2, 'Trồng và chăm sóc', 16, 35, 'Trồng ra luống, chăm sóc'),
(4, 3, 'Thu hoạch', 36, 45, 'Thu hoạch');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(8, 1, 1, 'Gieo hạt', 'Gieo vào khay xốp', 'Hạt, khay xốp', '50g/ha'),
(8, 2, 5, 'Tưới phun sương', 'Tưới 3 lần/ngày', NULL, NULL),
(8, 3, 10, 'Bón phân lá', 'Phun NPK', 'NPK 20-20-20', '1kg/ha'),
(8, 4, 15, 'Trồng ra luống', 'Khoảng cách 20x25cm', NULL, '20000 cây/ha'),
(9, 1, 18, 'Tưới nhỏ giọt', 'Tưới 2 lần/ngày', NULL, NULL),
(9, 2, 22, 'Bón phân thúc', 'Bón urê', 'Urê', '50kg/ha'),
(9, 3, 28, 'Phun thuốc phòng sâu', 'Phòng sâu xanh', 'Thuốc sinh học', '300ml/ha'),
(10, 1, 40, 'Thu hoạch', 'Nhổ cả cây', 'Rổ', NULL);

-- =====================================================
-- QUY TRÌNH 5: RAU MUỐNG 25 NGÀY
-- =====================================================

INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) 
VALUES (6, 'Quy trình trồng Rau muống 25 ngày', 25, 'VietGAP', 'Rau muống cạn', TRUE, 1);

INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(5, 1, 'Chuẩn bị và gieo', 1, 5, 'Làm đất, gieo hạt'),
(5, 2, 'Chăm sóc', 6, 20, 'Tưới, bón phân'),
(5, 3, 'Thu hoạch', 21, 25, 'Thu hoạch');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(11, 1, 1, 'Làm đất', 'Cày xới, làm luống', NULL, NULL),
(11, 2, 2, 'Bón phân lót', 'Bón phân chuồng', 'Phân chuồng', '3 tấn/ha'),
(11, 3, 3, 'Gieo hạt', 'Gieo hạt rải đều', 'Hạt giống', '5kg/ha'),
(12, 1, 7, 'Tưới nước', 'Tưới 2 lần/ngày', NULL, NULL),
(12, 2, 12, 'Bón phân thúc', 'Bón urê', 'Urê', '100kg/ha'),
(12, 3, 18, 'Phun thuốc', 'Phòng bệnh', 'Thuốc sinh học', '200ml/ha'),
(13, 1, 23, 'Thu hoạch', 'Cắt ngọn 15cm', 'Dao', NULL);

-- =====================================================
-- QUY TRÌNH 6: KHOAI LANG 120 NGÀY
-- =====================================================

INSERT INTO technical_processes (crop_id, name, total_days, standard_type, description, is_active, created_by) 
VALUES (10, 'Quy trình trồng Khoai lang tím 120 ngày', 120, 'VietGAP', 'Khoai lang tím Nhật', TRUE, 1);

INSERT INTO process_stages (process_id, stage_order, name, day_start, day_end, description) VALUES
(6, 1, 'Chuẩn bị và trồng', 1, 20, 'Làm đất, trồng giống'),
(6, 2, 'Chăm sóc', 21, 100, 'Tưới, bón phân, làm cỏ'),
(6, 3, 'Thu hoạch', 101, 120, 'Thu hoạch củ');

INSERT INTO stage_tasks (stage_id, task_order, day_number, task_name, description, materials_needed, quantity_per_hectare) VALUES
(14, 1, 1, 'Làm đất sâu', 'Cày xới 40cm', NULL, NULL),
(14, 2, 5, 'Làm luống cao', 'Luống cao 30cm', NULL, NULL),
(14, 3, 7, 'Bón phân lót', 'Phân chuồng + NPK', 'Phân chuồng, NPK', '5 tấn + 200kg/ha'),
(14, 4, 10, 'Trồng giống', 'Giâm hom 25cm', 'Hom giống', '40000 hom/ha'),
(15, 1, 25, 'Tưới nước', 'Tưới khi khô hạn', NULL, NULL),
(15, 2, 40, 'Bón phân thúc 1', 'Bón NPK', 'NPK 16-16-8', '150kg/ha'),
(15, 3, 50, 'Lật dây', 'Lật dây về gốc', NULL, NULL),
(15, 4, 70, 'Bón phân thúc 2', 'Bón kali', 'K2SO4', '100kg/ha'),
(15, 5, 90, 'Ngừng tưới', 'Ngừng tưới trước thu hoạch', NULL, NULL),
(16, 1, 110, 'Thu hoạch', 'Đào củ cẩn thận', 'Cuốc, rổ', NULL);

-- =====================================================
-- THÊM FAQs CHO CÁC SẢN PHẨM MỚI
-- =====================================================

INSERT INTO faqs (category, question, answer, keywords) VALUES
('Kỹ thuật', 'Cà chua bị héo xanh phải làm sao?', 
 'Bệnh héo xanh do vi khuẩn Ralstonia. Biện pháp: 1) Nhổ bỏ cây bệnh. 2) Khử trùng đất bằng vôi bột. 3) Luân canh với cây họ đậu. 4) Dùng giống kháng bệnh.', 
 ARRAY['cà chua', 'héo xanh', 'bệnh']),

('Kỹ thuật', 'Xà lách bị đắng phải làm sao?', 
 'Nguyên nhân: Thiếu nước, nhiệt độ cao. Giải pháp: 1) Tưới đủ nước. 2) Che bóng mát. 3) Thu hoạch sớm buổi sáng. 4) Chọn giống ít đắng.', 
 ARRAY['xà lách', 'đắng', 'chất lượng']),

('Kỹ thuật', 'Khoai lang bị sâu đục củ?', 
 'Phòng trừ: 1) Luân canh. 2) Dùng bẫy đèn. 3) Phun thuốc sinh học 30 ngày trước thu hoạch. 4) Lật dây đều đặn.', 
 ARRAY['khoai lang', 'sâu bệnh', 'củ']),

('Thị trường', 'Giá rau muống hiện tại?', 
 'Giá rau muống dao động 6.000-10.000đ/kg. Loại 1 (ngọn non): 8.000-10.000đ. Loại 2: 6.000-8.000đ.', 
 ARRAY['giá', 'rau muống', 'thị trường']);

-- KẾT THÚC
