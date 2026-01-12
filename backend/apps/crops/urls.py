from rest_framework import routers
from .views import CropsViewSet, TechnicalProcessesViewSet, ProcessStagesViewSet, StageTasksViewSet

router = routers.DefaultRouter()
router.register(r'crops', CropsViewSet)
router.register(r'technical-processes', TechnicalProcessesViewSet)
router.register(r'process-stages', ProcessStagesViewSet)
router.register(r'stage-tasks', StageTasksViewSet)

urlpatterns = router.urls
