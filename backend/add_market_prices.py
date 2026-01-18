"""
Script to add market prices for all crops in database
"""
import psycopg2
from datetime import datetime, timedelta
import random

# Connect to database
conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/agrisupply')
cur = conn.cursor()

# Get all crops
cur.execute('SELECT id, name FROM crops')
crops = cur.fetchall()

print(f"Found {len(crops)} crops")

# Check existing prices
cur.execute('SELECT DISTINCT crop_name FROM market_prices')
existing_prices = {row[0] for row in cur.fetchall()}
print(f"Crops with existing prices: {existing_prices}")

# Add prices for crops without prices
added_count = 0
for crop_id, crop_name in crops:
    if crop_name not in existing_prices:
        print(f"Adding price for: {crop_name}")
        
        # Generate realistic prices based on crop type
        base_price = random.randint(15000, 50000)
        
        # Add prices for last 30 days
        for days_ago in range(30):
            price_date = datetime.now() - timedelta(days=days_ago)
            price_avg = base_price + random.randint(-5000, 5000)
            price_min = price_avg - random.randint(2000, 5000)
            price_max = price_avg + random.randint(2000, 5000)
            
            cur.execute('''
                INSERT INTO market_prices (crop, crop_name, price_date, price_avg, price_min, price_max, market_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (crop_id, crop_name, price_date, price_avg, price_min, price_max, 'Chợ đầu mối Bình Điền'))
        
        added_count += 1

conn.commit()
print(f"\n✅ Added prices for {added_count} crops")
print(f"Total crops with prices: {len(existing_prices) + added_count}")

conn.close()
