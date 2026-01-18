from rest_framework import routers
from .views import CooperativesViewSet, FarmersViewSet, FarmsViewSet

router = routers.DefaultRouter()
router.register(r'cooperatives', CooperativesViewSet)
router.register(r'farmers', FarmersViewSet)
router.register(r'farms', FarmsViewSet, basename='farms')

urlpatterns = router.urls
