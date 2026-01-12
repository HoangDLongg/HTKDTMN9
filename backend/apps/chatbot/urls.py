from rest_framework import routers
from .views import ChatLogsViewSet, FaqsViewSet, AlertsViewSet, NotificationsViewSet

router = routers.DefaultRouter()
router.register(r'chat-logs', ChatLogsViewSet)
router.register(r'faqs', FaqsViewSet)
router.register(r'alerts', AlertsViewSet)
router.register(r'notifications', NotificationsViewSet)

urlpatterns = router.urls
