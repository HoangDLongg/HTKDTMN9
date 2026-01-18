import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.farms.models import Cooperatives, Farmers, Farms
from apps.seasons.models import Seasons, DailyTasks
from apps.crops.models import Crops, TechnicalProcesses
from apps.market.models import PlantingRecommendations
from apps.chatbot.models import Alerts, Notifications

print("=" * 80)
print("📊 HỆ THỐNG HỢP TÁC XÃ - DATABASE ANALYSIS")
print("=" * 80)

# Get all cooperatives
coops = Cooperatives.objects.all()
print(f"\n🏢 TỔNG SỐ HỢP TÁC XÃ: {coops.count()}")

for coop in coops:
    print("\n" + "=" * 80)
    print(f"🏢 HỢP TÁC XÃ: {coop.name}")
    print("=" * 80)
    
    # Basic info
    print(f"\n📋 THÔNG TIN CƠ BẢN:")
    print(f"  - Mã HTX: {coop.code}")
    print(f"  - Mã số thuế: {coop.tax_code or 'Chưa có'}")
    print(f"  - Địa chỉ: {coop.address or 'Chưa có'}")
    print(f"  - Email: {coop.email or 'Chưa có'}")
    print(f"  - Điện thoại: {coop.phone or 'Chưa có'}")
    print(f"  - Quản lý: {coop.manager.full_name if coop.manager else 'Chưa có'}")
    
    # Farmers
    farmers = Farmers.objects.filter(cooperative=coop)
    print(f"\n👨‍🌾 NÔNG DÂN LIÊN KẾT: {farmers.count()}")
    for farmer in farmers:
        print(f"  - {farmer.user.full_name} ({farmer.farmer_code})")
        print(f"    + Địa chỉ: {farmer.address or 'Chưa có'}")
        print(f"    + SĐT: {farmer.user.phone or 'Chưa có'}")
        print(f"    + Email: {farmer.user.email}")
    
    # Farms
    total_farms = 0
    total_area = 0
    for farmer in farmers:
        farms = Farms.objects.filter(farmer=farmer)
        total_farms += farms.count()
        for farm in farms:
            total_area += float(farm.area_hectare)
    
    print(f"\n🏡 TRANG TRẠI:")
    print(f"  - Tổng số: {total_farms}")
    print(f"  - Tổng diện tích: {total_area:.2f} ha")
    
    for farmer in farmers:
        farms = Farms.objects.filter(farmer=farmer)
        if farms.exists():
            print(f"\n  {farmer.user.full_name}:")
            for farm in farms:
                print(f"    + {farm.name}: {farm.area_hectare} ha")
                if farm.soil_type:
                    print(f"      Loại đất: {farm.soil_type}")
                if farm.water_source:
                    print(f"      Nguồn nước: {farm.water_source}")
    
    # Seasons
    seasons = Seasons.objects.filter(farm__farmer__cooperative=coop)
    print(f"\n🗓️ VỤ MÙA:")
    print(f"  - Tổng số: {seasons.count()}")
    print(f"  - Đang hoạt động: {seasons.exclude(status='completed').count()}")
    print(f"  - Đã hoàn thành: {seasons.filter(status='completed').count()}")
    
    # Group by crop
    from django.db.models import Count
    crops_summary = seasons.values('crop__name').annotate(count=Count('id')).order_by('-count')
    if crops_summary:
        print(f"\n  Theo cây trồng:")
        for item in crops_summary[:5]:
            print(f"    - {item['crop__name']}: {item['count']} vụ")
    
    # Production
    completed_seasons = seasons.filter(status='completed', actual_yield__isnull=False)
    total_production = sum([float(s.actual_yield) for s in completed_seasons])
    print(f"\n📦 SẢN LƯỢNG:")
    print(f"  - Tổng sản lượng đã thu hoạch: {total_production:.2f} tấn")
    print(f"  - Trung bình/vụ: {total_production/completed_seasons.count():.2f} tấn" if completed_seasons.count() > 0 else "  - Chưa có dữ liệu")
    
    # Daily Tasks
    all_tasks = DailyTasks.objects.filter(season__farm__farmer__cooperative=coop)
    completed_tasks = all_tasks.filter(is_completed=True)
    print(f"\n✅ CÔNG VIỆC:")
    print(f"  - Tổng số công việc: {all_tasks.count()}")
    print(f"  - Đã hoàn thành: {completed_tasks.count()}")
    print(f"  - Đang chờ: {all_tasks.count() - completed_tasks.count()}")
    print(f"  - Tiến độ: {completed_tasks.count()/all_tasks.count()*100:.1f}%" if all_tasks.count() > 0 else "  - Chưa có công việc")

# Global statistics
print("\n\n" + "=" * 80)
print("📊 THỐNG KÊ TOÀN HỆ THỐNG")
print("=" * 80)

print(f"\n🌱 CÂY TRỒNG:")
print(f"  - Tổng số loại: {Crops.objects.count()}")
crops_with_processes = Crops.objects.filter(technicalprocesses__isnull=False).distinct()
print(f"  - Có quy trình kỹ thuật: {crops_with_processes.count()}")

print(f"\n⚙️ QUY TRÌNH KỸ THUẬT:")
processes = TechnicalProcesses.objects.all()
print(f"  - Tổng số quy trình: {processes.count()}")
print(f"  - Đang hoạt động: {processes.filter(is_active=True).count()}")

print(f"\n🔔 CẢNH BÁO & THÔNG BÁO:")
alerts = Alerts.objects.all()
print(f"  - Tổng cảnh báo: {alerts.count()}")
print(f"  - Đang hoạt động: {alerts.filter(is_active=True).count()}")
notifications = Notifications.objects.all()
print(f"  - Thông báo đã gửi: {notifications.count()}")

print(f"\n💡 KHUYẾN NGHỊ TRỒNG TRỌT:")
recommendations = PlantingRecommendations.objects.all()
print(f"  - Tổng khuyến nghị: {recommendations.count()}")
print(f"  - Đang chờ: {recommendations.filter(status='pending').count()}")
print(f"  - Đã chấp nhận: {recommendations.filter(status='accepted').count()}")

print("\n" + "=" * 80)
print("✅ PHÂN TÍCH HOÀN TẤT")
print("=" * 80)
