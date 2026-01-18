"""
Comprehensive Database Seeding Script
Tạo đầy đủ dữ liệu mẫu cho hệ thống nông nghiệp
Run: python seed_complete_data.py
"""
import os
import django
from datetime import date, timedelta
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import Crops
from apps.seasons.models import Seasons, DailyTasks
from apps.market.models import PlantingRecommendations, DemandForecasts
from apps.chatbot.models import Faqs, Alerts, Notifications
from apps.farms.models import Cooperatives
from apps.core.models import Users

class DatabaseSeeder:
    def __init__(self):
        self.created_counts = {
            'crops': 0,
            'daily_tasks': 0,
            'recommendations': 0,
            'forecasts': 0,
            'faqs': 0,
            'alerts': 0
        }

    def seed_all(self):
        """Run all seeding functions"""
        print("=" * 60)
        print("STARTING DATABASE SEEDING")
        print("=" * 60)
        
        self.seed_extended_crops()
        self.seed_daily_tasks()
        self.seed_recommendations()
        self.seed_demand_forecasts()
        self.seed_faqs()
        self.seed_alerts()
        
        self.print_summary()

    # =========================================================================
    # PART 1: EXTENDED CROPS (15 more crops)
    # =========================================================================
    def seed_extended_crops(self):
        print("\n[1/6] Seeding Extended Crops...")
        
        extended_crops = [
            ('RM001', 'Rau muống', 'Ipomoea aquatica', 'Rau', 'Rau muống Việt Nam'),
            ('CM001', 'Cải ngọt', 'Brassica chinensis', 'Rau', 'Cải ngọt Trung Quốc'),
            ('RM002', 'Rau má', 'Centella asiatica', 'Rau', 'Rau má sạch'),
            ('BC001', 'Bắp cải', 'Brassica oleracea', 'Rau', 'Bắp cải trắng'),
            ('KL001', 'Khoai lang', 'Ipomoea batatas', 'Củ', 'Khoai lang Nhật'),
            ('KT001', 'Khoai tây', 'Solanum tuberosum', 'Củ', 'Khoai tây Đà Lạt'),
            ('CU001', 'Củ cải trắng', 'Raphanus sativus', 'Củ', 'Củ cải trắng'),
            ('DH001', 'Dưa hấu', 'Citrullus lanatus', 'Quả', 'Dưa hấu không hạt'),
            ('OT001', 'Ớt', 'Capsicum annuum', 'Rau', 'Ớt hiểm'),
            ('DG001', 'Dưa gang', 'Cucumis sativus', 'Quả', 'Dưa chuột/gang'),
            ('TP001', 'Thanh long', 'Hylocereus undatus', 'Quả', 'Thanh long ruột đỏ'),
            ('CH001', 'Chanh', 'Citrus limon', 'Quả', 'Chanh không hạt'),
            ('HC001', 'Hành củ', 'Allium cepa', 'Củ', 'Hành tây'),
            ('TL001', 'Tỏi', 'Allium sativum', 'Củ', 'Tỏi Lý Sơn'),
            ('GG001', 'Gừng', 'Zingiber officinale', 'Củ', 'Gừng già'),
        ]
        
        for code, name, scientific_name, category, description in extended_crops:
            crop, created = Crops.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'scientific_name': scientific_name,
                    'category': category,
                    'description': description
                }
            )
            if created:
                self.created_counts['crops'] += 1
                print(f"  ✓ Created: {name} ({code})")
        
        print(f"  → Created {self.created_counts['crops']} new crops")

    # =========================================================================
    # PART 2: DAILY TASKS GENERATION
    # =========================================================================
    def seed_daily_tasks(self):
        print("\n[2/6] Seeding Daily Tasks for Active Seasons...")
        
        # Get all active seasons
        active_seasons = Seasons.objects.filter(status='in_progress')
        
        for season in active_seasons:
            # Check if tasks already exist
            existing_tasks = DailyTasks.objects.filter(season=season).count()
            
            if existing_tasks > 0:
                print(f"  ⊙ Season {season.season_code} already has {existing_tasks} tasks")
                continue
            
            # Generate tasks from process stages (will be done by trigger)
            # But if trigger didn't fire, we need to manually create
            if season.process:
                # This should have been done by SQL trigger
                # If not, call the Django service method
                from apps.seasons.services import SeasonService
                try:
                    created_tasks = SeasonService._generate_daily_tasks(season)
                    self.created_counts['daily_tasks'] += len(created_tasks)
                    print(f"  ✓ Generated {len(created_tasks)} tasks for {season.season_code}")
                except Exception as e:
                    print(f"  ✗ Error generating tasks: {e}")
            else:
                print(f"  ⊙ Season {season.season_code} has no process assigned")
        
        # Mark some tasks as completed (30-40%)
        all_tasks = DailyTasks.objects.filter(is_completed=False, due_date__lt=date.today())
        completed_count = 0
        
        for task in all_tasks:
            if random.random() < 0.35:  # 35% completion rate
                task.is_completed = True
                task.completed_at = task.due_date + timedelta(hours=random.randint(8, 18))
                
                # Assign to farmer user
                season = task.season
                task.completed_by = season.farm.farmer.user
                task.save()
                completed_count += 1
        
        print(f"  → Marked {completed_count} past tasks as completed")

    # =========================================================================
    # PART 3: PLANTING RECOMMENDATIONS
    # =========================================================================
    def seed_recommendations(self):
        print("\n[3/6] Seeding Planting Recommendations...")
        
        # Get cooperatives
        cooperatives = list(Cooperatives.objects.all())
        if not cooperatives:
            print("  ✗ No cooperatives found, skipping...")
            return
        
        # Get crops
        crops = list(Crops.objects.all()[:10])  # Top 10 crops
        
        recommendations_data = [
            {
                'crop': random.choice(crops),
                'cooperative': random.choice(cooperatives),
                'recommended_area': Decimal(str(round(random.uniform(0.5, 3.0), 1))),
                'recommended_start_date': date.today() + timedelta(days=random.randint(5, 15)),
                'expected_price': Decimal(str(random.randint(10000, 50000))),
                'reason': random.choice([
                    'Nhu cầu thị trường tăng cao vào mùa tới, giá tốt.',
                    'Phù hợp luân canh, đang thiếu nguồn cung cục bộ.',
                    'Thời tiết thuận lợi, dự báo giá ổn định.',
                    'Đơn hàng từ doanh nghiệp xuất khẩu, cam kết thu mua.',
                    'Sản lượng vụ trước thấp, giá dự kiến tăng 15%.'
                ]),
                'priority_level': random.randint(1, 3),
                'status': random.choice(['active', 'active', 'active', 'accepted', 'pending'])
            }
            for _ in range(12)
        ]
        
        for rec_data in recommendations_data:
            rec, created = PlantingRecommendations.objects.get_or_create(
                crop=rec_data['crop'],
                cooperative=rec_data['cooperative'],
                recommended_start_date=rec_data['recommended_start_date'],
                defaults=rec_data
            )
            if created:
                self.created_counts['recommendations'] += 1
        
        print(f"  → Created {self.created_counts['recommendations']} recommendations")

    # =========================================================================
    # PART 4: DEMAND FORECASTS (Mock AI)
    # =========================================================================
    def seed_demand_forecasts(self):
        print("\n[4/6] Seeding Demand Forecasts (Mock AI)...")
        
        crops = list(Crops.objects.all())
        
        # Forecast for next 3 months
        for month_offset in range(1, 4):
            forecast_for_month = date.today().replace(day=1) + timedelta(days=30 * month_offset)
            
            for crop in crops:
                # Get current price if available
                base_price = random.randint(10000, 50000)
                
                forecast, created = DemandForecasts.objects.get_or_create(
                    crop=crop,
                    forecast_for_month=forecast_for_month,
                    defaults={
                        'forecast_date': date.today(),
                        'predicted_demand': Decimal(str(round(random.uniform(50, 500), 2))),
                        'predicted_price': Decimal(str(int(base_price * random.uniform(0.9, 1.15)))),
                        'confidence_score': Decimal(str(round(random.uniform(75, 95), 2))),
                        'model_version': 'ARIMA_v1.0_mock'
                    }
                )
                if created:
                    self.created_counts['forecasts'] += 1
        
        print(f"  → Created {self.created_counts['forecasts']} forecasts (3 months × {len(crops)} crops)")

    # =========================================================================
    # PART 5: FAQs (30 items)
    # =========================================================================
    def seed_faqs(self):
        print("\n[5/6] Seeding FAQs...")
        
        faqs_data = [
            # Giá cả (10)
            ('Giá cả', 'Giá cà chua hôm nay bao nhiêu?', 
             'Giá cà chua trung bình hôm nay là 12,000đ/kg tại chợ đầu mối Bình Điền.',
             ['giá', 'cà chua', 'hôm nay']),
            ('Giá cả', 'Giá dưa lưới hiện tại ra sao?',
             'Giá dưa lưới Nhật hiện dao động 40,000-50,000đ/kg tùy loại.',
             ['giá', 'dưa lưới']),
            ('Giá cả', 'Ổi giá bao nhiêu một kg?',
             'Giá ổi Đài Loan loại 1 khoảng 18,000-20,000đ/kg.',
             ['giá', 'ổi']),
            ('Giá cả', 'Giá rau muống hôm nay?',
             'Rau muống nước giá 8,000-10,000đ/kg.',
             ['giá', 'rau muống']),
            ('Giá cả', 'Ớt hiểm giá bao nhiêu?',
             'Ớt hiểm tươi dao động 30,000-40,000đ/kg tùy mùa.',
             ['giá', 'ớt', 'ớt hiểm']),
            
            # Kỹ thuật (15)
            ('Kỹ thuật', 'Cây dưa lưới bị vàng lá phải làm sao?',
             'Nguyên nhân có thể do thiếu đạm hoặc bệnh nấm. Kiểm tra độ ẩm đất và bón phân đạm bổ sung. Nếu có đốm vàng lan rộng, phun thuốc chống nấm.',
             ['vàng lá', 'dưa lưới', 'bệnh']),
            ('Kỹ thuật', 'Bón phân cho cà chua như thế nào?',
             'Giai đoạn sinh trưởng: NPK 16-16-8, giai đoạn ra hoa: tăng kali (NPK 10-20-20). Bón 2-3 lần/tuần, pha loãng.',
             ['bón phân', 'cà chua', 'NPK']),
            ('Kỹ thuật', 'Làm sao để phòng sâu bệnh cho rau?',
             'Sử dụng thuốc sinh học, luân canh cây trồng, giữ vườn sạch, tưới đúng lúc. Kiểm tra lá thường xuyên.',
             ['sâu bệnh', 'phòng trừ', 'rau']),
            ('Kỹ thuật', 'Thời gian thu hoạch dưa lưới?',
             'Dưa lưới Nhật thu hoạch sau 70-80 ngày kể từ gieo hạt. Kiểm tra độ ngọt đạt 13-15 Brix.',
             ['thu hoạch', 'dưa lưới', 'thời gian']),
            ('Kỹ thuật', 'Cách trồng rau sạch VietGAP?',
             'Sử dụng giống chứng nhận, phân hữu cơ, thuốc sinh học, ghi nhật ký canh tác. Cần chứng nhận từ cơ quan có thẩm quyền.',
             ['VietGAP', 'rau sạch', 'trồng']),
            ('Kỹ thuật', 'Tưới nước cho cây như thế nào?',
             'Tưới nhỏ giọt hoặc phun sương 2 lần/ngày (sáng-chiều). Tránh tưới giữa trưa. Đảm bảo đất ẩm nhưng không úng.',
             ['tưới nước', 'chăm sóc']),
            ('Kỹ thuật', 'Cách phòng bệnh thối rễ?',
             'Đất tơi xốp, thoát nước tốt. Không tưới quá nhiều. Sử dụng vi sinh vật bảo vệ rễ.',
             ['bệnh', 'thối rễ']),
            ('Kỹ thuật', 'Khi nào nên thu hoạch ổi?',
             'Ổi chín khi có màu vàng nhạt, khi gõ có tiếng kêu rỗng. Thường 100-120 ngày sau ra hoa.',
             ['thu hoạch', 'ổi']),
            
            # Quy trình (5)
            ('Quy trình', 'Quy trình trồng dưa lưới mất bao lâu?',
             'Quy trình chuẩn 75 ngày từ gieo hạt đến thu hoạch.',
             ['quy trình', 'dưa lưới', 'thời gian']),
            ('Quy trình', 'Trồng ổi cần chuẩn bị gì?',
             'Đất tơi xốp, phân hữu cơ, giống cây chất lượng, hệ thống tưới. Diện tích tối thiểu 0.5ha.',
             ['trồng', 'ổi', 'chuẩn bị']),
            
        ]
        
        for category, question, answer, keywords in faqs_data:
            # Convert keywords list to PostgreSQL array format
            keywords_array = '{' + ','.join([f'"{k}"' for k in keywords]) + '}'
            
            faq, created = Faqs.objects.get_or_create(
                question=question,
                defaults={
                    'category': category,
                    'answer': answer,
                    'keywords': keywords_array,
                    'is_active': True
                }
            )
            if created:
                self.created_counts['faqs'] += 1
        
        print(f"  → Created {self.created_counts['faqs']} FAQs")

    # =========================================================================
    # PART 6: ALERTS & NOTIFICATIONS
    # =========================================================================
    def seed_alerts(self):
        print("\n[6/6] Seeding Alerts...")
        
        alerts_data = [
            ('weather', 'high', 'Cảnh báo mưa lớn khu vực miền Nam',
             'Dự báo mưa lớn trong 2 ngày tới. Nông dân cần che chắn cây trồng, thoát nước.'),
            ('pest', 'medium', 'Phát hiện sâu đục thân tại Củ Chi',
             'Xuất hiện sâu đục thân trên cây dưa. Khuyến cáo phun thuốc sinh học.'),
            ('price_drop', 'low', 'Giá cà chua giảm nhẹ',
             'Giá cà chua giảm 5% so với tuần trước do nguồn cung tăng.'),
            ('weather', 'critical', 'Bão số 5 đang tiến vào',
             'Bão số 5 sức gió cấp 10, ảnh hưởng vùng ven biển. Khẩn trương thu hoạch và gia cố.'),
            ('disease', 'high', 'Bệnh héo xanh lan rộng',
             'Bệnh héo xanh vi khuẩn xuất hiện tại vài vùng. Cần cách ly và xử lý cây bệnh.'),
        ]
        
        for alert_type, severity, title, message in alerts_data:
            # Convert affected_area_ids to PostgreSQL array format
            area_ids_array = '{1,2,3}'
            
            alert, created = Alerts.objects.get_or_create(
                title=title,
                defaults={
                    'alert_type': alert_type,
                    'severity': severity,
                    'message': message,
                    'valid_from': date.today(),
                    'valid_until': date.today() + timedelta(days=7),
                    'is_active': True,
                    'affected_area_ids': area_ids_array
                }
            )
            if created:
                self.created_counts['alerts'] += 1
        
        print(f"  → Created {self.created_counts['alerts']} alerts")

    # =========================================================================
    # SUMMARY
    # =========================================================================
    def print_summary(self):
        print("\n" + "=" * 60)
        print("SEEDING COMPLETED!")
        print("=" * 60)
        print("\nCreated:")
        for key, count in self.created_counts.items():
            print(f"  • {key.capitalize()}: {count}")
        print("\n" + "=" * 60)

# =============================================================================
# MAIN
# =============================================================================
if __name__ == '__main__':
    seeder = DatabaseSeeder()
    seeder.seed_all()
    print("\n✓ Run 'python test_api_data.py' to verify!")
