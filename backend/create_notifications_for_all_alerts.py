"""
Script để tạo notifications cho TẤT CẢ alerts hiện có
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.chatbot.models import Notifications, Alerts
from apps.core.models import Users
from django.utils import timezone

print("=" * 60)
print("TẠO NOTIFICATIONS CHO TẤT CẢ ALERTS")
print("=" * 60)

# Lấy tất cả alerts CHƯA có notifications
alerts_without_notifs = []
for alert in Alerts.objects.all():
    if Notifications.objects.filter(alert=alert).count() == 0:
        alerts_without_notifs.append(alert)

print(f"\n📋 Tìm thấy {len(alerts_without_notifs)} alerts chưa có notifications:")
for a in alerts_without_notifs:
    print(f"   [{a.id}] {a.alert_type} - {a.title}")

if len(alerts_without_notifs) == 0:
    print("\n✅ Tất cả alerts đã có notifications!")
    exit(0)

# Lấy tất cả users
users = Users.objects.filter(is_active=True)
print(f"\n👥 Sẽ gửi đến {users.count()} users")

# Tạo notifications
created_count = 0
for alert in alerts_without_notifs:
    for user in users:
        notif = Notifications.objects.create(
            user=user,
            alert=alert,
            channel='system',
            status='sent',
            sent_at=timezone.now()
        )
        created_count += 1
    print(f"   ✅ Alert #{alert.id} → {users.count()} users")

print(f"\n🎉 Đã tạo {created_count} notifications!")
print(f"   ({len(alerts_without_notifs)} alerts × {users.count()} users)")

# Thống kê cuối
print(f"\n📊 Thống kê sau khi tạo:")
for user in users:
    unread = Notifications.objects.filter(user=user, status='sent').count()
    print(f"   - {user.username}: {unread} unread notifications")

print("\n" + "=" * 60)
