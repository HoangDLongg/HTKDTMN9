from rest_framework import routers
from .views import RolesViewSet, UsersViewSet

router = routers.DefaultRouter()
router.register(r'roles', RolesViewSet)
router.register(r'users', UsersViewSet)

urlpatterns = router.urls
