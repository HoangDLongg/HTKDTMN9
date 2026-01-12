from rest_framework import routers
from .views import ProvincesViewSet, DistrictsViewSet, WardsViewSet

router = routers.DefaultRouter()
router.register(r'provinces', ProvincesViewSet)
router.register(r'districts', DistrictsViewSet)
router.register(r'wards', WardsViewSet)

urlpatterns = router.urls
