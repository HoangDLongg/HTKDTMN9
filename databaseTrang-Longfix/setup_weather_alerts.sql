-- Weather Alert System - Database Setup
-- Run this SQL to prepare database for weather alerts

-- 1. Add latitude/longitude to wards table
ALTER TABLE wards 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Update sample coordinates for TP.HCM wards
-- Quận 1
UPDATE wards SET latitude = 10.7769, longitude = 106.7009 
WHERE name LIKE '%Tân Định%' OR name LIKE '%Phường 1%';

-- Quận 10  
UPDATE wards SET latitude = 10.7731, longitude = 106.6680
WHERE name LIKE '%Phường 1%' AND district_id = (SELECT id FROM districts WHERE name LIKE '%Quận 10%' LIMIT 1);

-- Bình Thạnh
UPDATE wards SET latitude = 10.8142, longitude = 106.7095
WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Bình Thạnh%' LIMIT 1)
LIMIT 5;

-- Củ Chi (nông thôn)
UPDATE wards SET latitude = 10.9742, longitude = 106.4942
WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Củ Chi%' LIMIT 1)
LIMIT 10;

-- Hóc Môn
UPDATE wards SET latitude = 10.8832, longitude = 106.5928
WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Hóc Môn%' LIMIT 1)
LIMIT 10;

-- Bình Tân
UPDATE wards SET latitude = 10.7403, longitude = 106.6053
WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Bình Tân%' LIMIT 1)
LIMIT 10;

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wards_coordinates ON wards(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- 4. Check sample data
SELECT 
  w.name as ward,
  d.name as district,
  w.latitude,
  w.longitude,
  COUNT(f.id) as farm_count
FROM wards w
JOIN districts d ON w.district_id = d.id
LEFT JOIN farms f ON f.ward_id = w.id
WHERE w.latitude IS NOT NULL
GROUP BY w.id, w.name, d.name, w.latitude, w.longitude
ORDER BY farm_count DESC
LIMIT 20;

-- 5. Test alert creation
INSERT INTO alerts (
  alert_type,
  severity,
  title,
  message,
  valid_from,
  valid_until,
  is_active
) VALUES (
  'test',
  'low',
  '🧪 Test Alert',
  'This is a test alert for weather system.',
  NOW(),
  NOW() + INTERVAL '24 hours',
  true
) RETURNING id;

-- 6. Test notification
INSERT INTO notifications (
  user_id,
  title,
  message,
  notification_type,
  is_read
)
SELECT 
  u.id,
  '🧪 Test Notification',
  'Weather alert system is ready!',
  'alert',
  false
FROM users u
WHERE u.username = 'farmer1'
RETURNING id;

COMMIT;
