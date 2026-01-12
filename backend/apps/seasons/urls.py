from rest_framework import routers
from .views import SeasonsViewSet, DailyTasksViewSet, FarmingLogsViewSet

router = routers.DefaultRouter()
router.register(r'seasons', SeasonsViewSet)
router.register(r'daily-tasks', DailyTasksViewSet)
router.register(r'farming-logs', FarmingLogsViewSet)

urlpatterns = router.urls
