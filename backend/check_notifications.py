"""
Script để kiểm tra notifications trong database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.chatbot.models import Notifications, Alerts
from apps.core.models import Users

print("=" * 60)
print("KIỂM TRA NOTIFICATIONS & ALERTS")
print("=" * 60)

# 1. Kiểm tra tổng số
total_notifs = Notifications.objects.count()
total_alerts = Alerts.objects.count()
print(f"\n📊 Tổng quan:")
print(f"   - Notifications: {total_notifs}")
print(f"   - Alerts: {total_alerts}")

# 2. Kiểm tra TẤT CẢ alerts
print(f"\n🚨 Danh sách TẤT CẢ {total_alerts} alerts:")
all_alerts = Alerts.objects.all().order_by('-id')
for a in all_alerts:
    notif_count = Notifications.objects.filter(alert=a).count()
    print(f"   [{a.id}] {a.alert_type} - {a.title}")
    print(f"       → {notif_count} notifications")
    print(f"       → Created: {a.created_at}")
    print()

# 3. Kiểm tra notifications gần nhất
print(f"\n🔔 Notifications gần nhất (10 records):")
recent = Notifications.objects.select_related('user', 'alert').order_by('-sent_at')[:10]
for n in recent:
    alert_title = n.alert.title if n.alert else 'N/A'
    print(f"   [{n.id}] {n.user.username if n.user else 'NULL'} → {alert_title}")
    print(f"       Status: {n.status} | Sent: {n.sent_at}")

# 4. Kiểm tra notifications theo user
print(f"\n👥 Notifications theo user:")
users = Users.objects.filter(is_active=True)
for user in users:
    count = Notifications.objects.filter(user=user).count()
    unread = Notifications.objects.filter(user=user, status='sent').count()
    print(f"   - {user.username} (ID: {user.id}): {count} total, {unread} unread")
    
    # Show chi tiết notifications của user này
    if unread > 0:
        user_notifs = Notifications.objects.filter(user=user, status='sent').select_related('alert')[:3]
        for n in user_notifs:
            alert_title = n.alert.title if n.alert else 'N/A'
            print(f"      • {alert_title}")

print("\n" + "=" * 60)
