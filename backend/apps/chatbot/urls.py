from django.urls import path
from rest_framework import routers
from .views import ChatLogsViewSet, FaqsViewSet, AlertsViewSet, NotificationsViewSet, chat

router = routers.DefaultRouter()
router.register(r'chat-logs', ChatLogsViewSet)
router.register(r'faqs', FaqsViewSet)
router.register(r'alerts', AlertsViewSet)
router.register(r'notifications', NotificationsViewSet)

urlpatterns = [
    path('chat/', chat, name='chat'),
] + router.urls
