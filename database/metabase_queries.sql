-- ============================================
-- METABASE SQL QUERIES
-- Các query mẫu để tạo dashboards trong Metabase
-- ============================================

-- ============================================
-- FARMER DASHBOARDS
-- ============================================

-- Dashboard 1: Farmer Overview
-- Tổng quan về vườn và vụ mùa của nông dân
-- Parameters: farmer_id (Number)
SELECT 
  COUNT(DISTINCT f.id) as total_farms,
  COALESCE(SUM(f.area_hectare), 0) as total_area,
  COUNT(DISTINCT CASE WHEN s.status = 'in_progress' THEN s.id END) as active_seasons,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_seasons
FROM farms f
LEFT JOIN seasons s ON f.id = s.farm_id
WHERE f.farmer_id = {{farmer_id}};

-- Dashboard 2: Farm Details
-- Chi tiết từng vườn
-- Parameters: farmer_id (Number)
SELECT 
  f.id,
  f.name as farm_name,
  f.area_hectare,
  f.soil_type,
  w.name as ward_name,
  d.name as district_name,
  p.name as province_name,
  c.name as current_crop,
  s.status as season_status,
  s.start_date,
  s.expected_harvest_date
FROM farms f
LEFT JOIN wards w ON f.ward_id = w.id
LEFT JOIN districts d ON w.district_id = d.id
LEFT JOIN provinces p ON d.province_id = p.id
LEFT JOIN seasons s ON f.id = s.farm_id AND s.status = 'in_progress'
LEFT JOIN crops c ON s.crop_id = c.id
WHERE f.farmer_id = {{farmer_id}}
ORDER BY f.created_at DESC;

-- Dashboard 3: Market Prices Trend
-- Xu hướng giá thị trường 30 ngày
-- Parameters: None (hoặc crop_id nếu muốn filter)
SELECT 
  mp.price_date,
  c.name as crop_name,
  c.category as crop_category,
  mp.price_per_kg,
  mp.market_name,
  mp.quality_grade
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY mp.price_date DESC, c.name;

-- Dashboard 3B: Average Price by Crop
-- Giá trung bình theo cây trồng
SELECT 
  c.name as crop_name,
  AVG(mp.price_per_kg) as avg_price,
  MIN(mp.price_per_kg) as min_price,
  MAX(mp.price_per_kg) as max_price,
  COUNT(*) as data_points
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name
ORDER BY avg_price DESC;

-- Dashboard 4: Tasks Progress
-- Tiến độ công việc
-- Parameters: farmer_id (Number)
SELECT 
  dt.task_date,
  dt.task_name,
  dt.description,
  dt.is_completed,
  dt.completed_at,
  s.season_code,
  c.name as crop_name,
  f.name as farm_name
FROM daily_tasks dt
JOIN seasons s ON dt.season_id = s.id
JOIN farms f ON s.farm_id = f.id
JOIN crops c ON s.crop_id = c.id
WHERE f.farmer_id = {{farmer_id}}
  AND dt.task_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dt.task_date DESC, dt.is_completed ASC;

-- Dashboard 4B: Task Completion Rate
-- Tỷ lệ hoàn thành công việc
-- Parameters: farmer_id (Number)
SELECT 
  s.season_code,
  c.name as crop_name,
  COUNT(dt.id) as total_tasks,
  SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(100.0 * SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) / NULLIF(COUNT(dt.id), 0), 2) as completion_rate
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
LEFT JOIN daily_tasks dt ON s.id = dt.season_id
WHERE f.farmer_id = {{farmer_id}}
  AND s.status = 'in_progress'
GROUP BY s.id, s.season_code, c.name
ORDER BY completion_rate DESC;

-- ============================================
-- COOPERATIVE (HTX) DASHBOARDS
-- ============================================

-- Dashboard 10: Cooperative Overview
-- Tổng quan HTX
-- Parameters: cooperative_id (Number)
SELECT 
  COUNT(DISTINCT fa.id) as total_farmers,
  COUNT(DISTINCT f.id) as total_farms,
  COALESCE(SUM(f.area_hectare), 0) as total_area,
  COUNT(DISTINCT CASE WHEN s.status = 'in_progress' THEN s.id END) as active_seasons,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_seasons,
  COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.actual_yield ELSE 0 END), 0) as total_yield
FROM cooperatives co
LEFT JOIN farmers fa ON co.id = fa.cooperative_id
LEFT JOIN farms f ON fa.id = f.farmer_id
LEFT JOIN seasons s ON f.id = s.farm_id
WHERE co.id = {{cooperative_id}};

-- Dashboard 11: Farmers Management
-- Quản lý nông dân
-- Parameters: cooperative_id (Number)
SELECT 
  fa.id as farmer_id,
  fa.farmer_code,
  u.full_name,
  u.phone,
  u.email,
  COUNT(DISTINCT f.id) as num_farms,
  COALESCE(SUM(f.area_hectare), 0) as total_area,
  COUNT(DISTINCT CASE WHEN s.status = 'in_progress' THEN s.id END) as active_seasons,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_seasons
FROM farmers fa
JOIN users u ON fa.user_id = u.id
LEFT JOIN farms f ON fa.id = f.farmer_id
LEFT JOIN seasons s ON f.id = s.farm_id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND u.is_active = true
GROUP BY fa.id, fa.farmer_code, u.full_name, u.phone, u.email
ORDER BY fa.farmer_code;

-- Dashboard 12: Production Statistics
-- Thống kê sản xuất
-- Parameters: cooperative_id (Number)
SELECT 
  c.name as crop_name,
  c.category as crop_category,
  COUNT(DISTINCT s.id) as num_seasons,
  COUNT(DISTINCT f.id) as num_farms,
  COALESCE(SUM(f.area_hectare), 0) as total_area,
  COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.actual_yield ELSE 0 END), 0) as total_yield,
  CASE 
    WHEN SUM(f.area_hectare) > 0 
    THEN ROUND(SUM(CASE WHEN s.status = 'completed' THEN s.actual_yield ELSE 0 END) / SUM(f.area_hectare), 2)
    ELSE 0 
  END as avg_yield_per_ha
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
WHERE fa.cooperative_id = {{cooperative_id}}
GROUP BY c.id, c.name, c.category
ORDER BY total_yield DESC;

-- Dashboard 12B: Production by Month
-- Sản lượng theo tháng
-- Parameters: cooperative_id (Number)
SELECT 
  DATE_TRUNC('month', s.actual_harvest_date) as harvest_month,
  c.name as crop_name,
  COUNT(s.id) as num_harvests,
  COALESCE(SUM(s.actual_yield), 0) as total_yield
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND s.status = 'completed'
  AND s.actual_harvest_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', s.actual_harvest_date), c.id, c.name
ORDER BY harvest_month DESC, total_yield DESC;

-- Dashboard 13: Market Analysis
-- Phân tích thị trường
-- Parameters: None
SELECT 
  mp.price_date,
  c.name as crop_name,
  c.category as crop_category,
  AVG(mp.price_per_kg) as avg_price,
  MIN(mp.price_per_kg) as min_price,
  MAX(mp.price_per_kg) as max_price,
  COUNT(*) as num_markets
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY mp.price_date, c.id, c.name, c.category
ORDER BY mp.price_date DESC, c.name;

-- Dashboard 13B: Price Trend by Crop
-- Xu hướng giá theo cây trồng
-- Parameters: crop_id (Number, optional)
SELECT 
  mp.price_date,
  c.name as crop_name,
  mp.price_per_kg,
  mp.market_name,
  mp.quality_grade,
  -- Calculate 7-day moving average
  AVG(mp.price_per_kg) OVER (
    PARTITION BY c.id 
    ORDER BY mp.price_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as moving_avg_7d
FROM market_prices mp
JOIN crops c ON mp.crop_id = c.id
WHERE mp.price_date >= CURRENT_DATE - INTERVAL '90 days'
  AND ({{crop_id}} IS NULL OR c.id = {{crop_id}})
ORDER BY mp.price_date DESC, c.name;

-- Dashboard 14: Quality Control
-- Kiểm soát chất lượng
-- Parameters: cooperative_id (Number)
SELECT 
  s.season_code,
  c.name as crop_name,
  f.name as farm_name,
  fa.farmer_code,
  u.full_name as farmer_name,
  COUNT(dt.id) as total_tasks,
  SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(100.0 * SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) / NULLIF(COUNT(dt.id), 0), 2) as completion_rate,
  s.status as season_status,
  s.start_date,
  s.expected_harvest_date
FROM seasons s
JOIN crops c ON s.crop_id = c.id
JOIN farms f ON s.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
JOIN users u ON fa.user_id = u.id
LEFT JOIN daily_tasks dt ON s.id = dt.season_id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND s.status IN ('in_progress', 'completed')
GROUP BY s.id, s.season_code, c.name, f.name, fa.farmer_code, u.full_name, s.status, s.start_date, s.expected_harvest_date
ORDER BY completion_rate DESC, s.start_date DESC;

-- Dashboard 14B: Farm Logs Summary
-- Tổng hợp nhật ký vườn
-- Parameters: cooperative_id (Number)
SELECT 
  fl.log_date,
  f.name as farm_name,
  fa.farmer_code,
  fl.activity_type,
  fl.description,
  fl.notes,
  s.season_code
FROM farm_logs fl
JOIN farms f ON fl.farm_id = f.id
JOIN farmers fa ON f.farmer_id = fa.id
LEFT JOIN seasons s ON fl.season_id = s.id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND fl.log_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fl.log_date DESC;

-- ============================================
-- UTILITY QUERIES
-- ============================================

-- Get all active farmers in a cooperative
SELECT 
  fa.id,
  fa.farmer_code,
  u.full_name,
  u.phone
FROM farmers fa
JOIN users u ON fa.user_id = u.id
WHERE fa.cooperative_id = {{cooperative_id}}
  AND u.is_active = true
ORDER BY fa.farmer_code;

-- Get all crops
SELECT 
  id,
  name,
  category,
  scientific_name
FROM crops
ORDER BY category, name;

-- Get location hierarchy
SELECT 
  p.name as province,
  d.name as district,
  w.name as ward
FROM wards w
JOIN districts d ON w.district_id = d.id
JOIN provinces p ON d.province_id = p.id
ORDER BY p.name, d.name, w.name;
