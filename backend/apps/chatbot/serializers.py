from rest_framework import serializers
from .models import ChatLogs, Faqs, Alerts, Notifications

class ChatLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatLogs
        fields = '__all__'


class FaqsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faqs
        fields = '__all__'


class AlertsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerts
        fields = '__all__'


class NotificationsSerializer(serializers.ModelSerializer):
    # Bổ sung trường từ bảng alerts để frontend hiển thị ngay
    title = serializers.CharField(source='alert.title', read_only=True)
    message = serializers.CharField(source='alert.message', read_only=True)
    notification_type = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='sent_at', read_only=True)

    def get_notification_type(self, obj):
        # Có thể ánh xạ chi tiết từ alert.alert_type nếu cần
        return 'alert'

    class Meta:
        model = Notifications
        fields = [
            'id', 'title', 'message', 'notification_type', 'created_at',
            'status', 'channel', 'alert_id'
        ]
