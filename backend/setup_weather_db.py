"""
Setup Weather Alert System Database
Run this to prepare database for weather alerts
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("🔗 Connected to database")

# Split SQL statements
sql_statements = [
    # Add columns
    """
    ALTER TABLE wards 
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    """,
    
    # Update coordinates
    """
    UPDATE wards SET latitude = 10.9742, longitude = 106.4942
    WHERE id IN (
        SELECT id FROM wards
        WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Củ Chi%' LIMIT 1)
        AND latitude IS NULL
        LIMIT 10
    );
    """,
    
    """
    UPDATE wards SET latitude = 10.8832, longitude = 106.5928
    WHERE id IN (
        SELECT id FROM wards
        WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Hóc Môn%' LIMIT 1)
        AND latitude IS NULL
        LIMIT 10
    );
    """,
    
    """
    UPDATE wards SET latitude = 10.7403, longitude = 106.6053
    WHERE id IN (
        SELECT id FROM wards
        WHERE district_id = (SELECT id FROM districts WHERE name LIKE '%Bình Tân%' LIMIT 1)
        AND latitude IS NULL
        LIMIT 10
    );
    """,
    
    # Create indexes
    """
    CREATE INDEX IF NOT EXISTS idx_wards_coordinates ON wards(latitude, longitude);
    """,
    
    """
    CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, valid_until);
    """,
    
    """
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at);
    """
]

try:
    with connection.cursor() as cursor:
        for i, stmt in enumerate(sql_statements, 1):
            print(f"Executing statement {i}/{len(sql_statements)}...")
            try:
                cursor.execute(stmt)
            except Exception as e:
                print(f"  ⚠️ Warning: {e}")
                continue
    
    print("✅ Database setup completed!")
    
    # Show results
    with connection.cursor() as cursor:
        cursor.execute("""
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
            LIMIT 10;
        """)
        
        print("\n📍 Wards with coordinates:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}, {row[1]}")
            print(f"    Lat: {row[2]}, Lon: {row[3]}")
            print(f"    Farms: {row[4]}\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
