"""
Script để tạo notifications test cho USER hiện tại
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.chatbot.models import Notifications, Alerts
from apps.core.models import Users
from django.utils import timezone

print("=" * 60)
print("TẠO NOTIFICATIONS TEST")
print("=" * 60)

# Lấy tất cả users
users = Users.objects.filter(is_active=True)
print(f"\n📋 Danh sách users:")
for u in users:
    notif_count = Notifications.objects.filter(user=u, status='sent').count()
    print(f"   {u.id}. {u.username} - {u.full_name} (Role: {u.role.name if u.role else 'N/A'}) - {notif_count} unread")

# Tạo alert test
alert = Alerts.objects.create(
    alert_type='system_test',
    severity='low',
    title='🧪 TEST NOTIFICATION',
    message='Đây là thông báo test. Nếu bạn thấy được thì hệ thống đang hoạt động!',
    valid_from=timezone.now(),
    valid_until=timezone.now() + timezone.timedelta(hours=1),
    is_active=True,
    created_at=timezone.now()
)
print(f"\n✅ Đã tạo Alert ID: {alert.id}")

# Tạo notification cho TẤT CẢ users
created_count = 0
for user in users:
    notif = Notifications.objects.create(
        user=user,
        alert=alert,
        channel='system',
        status='sent',
        sent_at=timezone.now()
    )
    created_count += 1
    print(f"   ✅ Notification #{notif.id} → {user.username}")

print(f"\n🎉 Đã tạo {created_count} notifications cho {users.count()} users!")
print("\n💡 Bây giờ:")
print("   1. Login vào app với BẤT KỲ user nào")
print("   2. Xem icon chuông 🔔 ở góc phải header")
print("   3. Nếu vẫn không thấy, F5 refresh lại trang")
print("\n" + "=" * 60)
