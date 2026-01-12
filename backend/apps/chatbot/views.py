from rest_framework import viewsets, permissions
from .models import ChatLogs, Faqs, Alerts, Notifications
from .serializers import ChatLogsSerializer, FaqsSerializer, AlertsSerializer, NotificationsSerializer

class ChatLogsViewSet(viewsets.ModelViewSet):
    """API endpoint for ChatLogs"""
    queryset = ChatLogs.objects.all()
    serializer_class = ChatLogsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FaqsViewSet(viewsets.ModelViewSet):
    """API endpoint for Faqs"""
    queryset = Faqs.objects.all()
    serializer_class = FaqsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AlertsViewSet(viewsets.ModelViewSet):
    """API endpoint for Alerts"""
    queryset = Alerts.objects.all()
    serializer_class = AlertsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class NotificationsViewSet(viewsets.ModelViewSet):
    """API endpoint for Notifications"""
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
