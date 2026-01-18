"""
Seed Market Prices Data
Tạo dữ liệu giá thị trường mẫu
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import Crops
from apps.market.models import MarketPrices

def seed_market_prices():
    """Tạo dữ liệu giá thị trường mẫu"""
    
    print("🌱 Bắt đầu seed market prices...")
    
    # Lấy tất cả crops
    crops = Crops.objects.all()
    
    if not crops.exists():
        print("❌ Không có crops nào! Chạy seed_crops.py trước.")
        return
    
    # Danh sách chợ/thị trường
    markets = [
        "Chợ đầu mối Bình Điền",
        "Chợ đầu mối Hóc Môn",
        "Chợ đầu mối Thủ Đức",
        "Chợ Bến Thành",
        "Siêu thị Co.opmart",
        "Siêu thị BigC",
        "Chợ nông sản sạch"
    ]
    
    # Giá tham khảo cho từng loại cây (VNĐ/kg)
    price_ranges = {
        'vegetable': (5000, 25000),   # Rau
        'fruit': (15000, 50000),      # Quả
        'grain': (8000, 30000),       # Ngũ cốc
        'tuber': (10000, 35000),      # Củ
        'spice': (20000, 100000),     # Gia vị
        'other': (10000, 40000)       # Khác
    }
    
    created_count = 0
    
    # Tạo giá cho 30 ngày gần đây
    for crop in crops:
        category = crop.category or 'other'
        min_price, max_price = price_ranges.get(category, (10000, 40000))
        
        # Base price cho crop này
        base_price = random.randint(min_price, max_price)
        
        # Tạo giá cho 30 ngày
        for days_ago in range(30):
            date = datetime.now().date() - timedelta(days=days_ago)
            
            # Mỗi ngày có 2-4 chợ báo giá
            num_markets = random.randint(2, 4)
            selected_markets = random.sample(markets, num_markets)
            
            for market in selected_markets:
                # Giá dao động ±20% so với base price
                variation = random.uniform(0.8, 1.2)
                avg_price = int(base_price * variation)
                
                # Round to nearest 1000
                avg_price = round(avg_price / 1000) * 1000
                
                # Min/Max prices (±10% from avg)
                min_price_val = int(avg_price * 0.9)
                max_price_val = int(avg_price * 1.1)
                
                # Tạo market price
                MarketPrices.objects.create(
                    crop=crop,
                    price_date=date,
                    price_min=Decimal(str(min_price_val)),
                    price_max=Decimal(str(max_price_val)),
                    price_avg=Decimal(str(avg_price)),
                    market_location=market,
                    notes=f"Giá {crop.name} tại {market}",
                    created_at=datetime.now()
                )
                
                created_count += 1
    
    print(f"✅ Đã tạo {created_count} bản ghi giá thị trường!")
    print(f"📊 Cho {crops.count()} loại cây trồng")
    print(f"🏪 Tại {len(markets)} chợ/thị trường")
    print(f"📅 Trong 30 ngày gần đây")

if __name__ == '__main__':
    # Xóa dữ liệu cũ (nếu có)
    print("🗑️  Xóa dữ liệu market prices cũ...")
    MarketPrices.objects.all().delete()
    
    # Seed dữ liệu mới
    seed_market_prices()
    
    print("\n✅ DONE! Vào http://localhost:3000/admin/market để xem")
