"""
Main API router configuration
"""
from rest_framework import routers

# Import all viewsets
from apps.core.views import RolesViewSet, UsersViewSet
from apps.locations.views import ProvincesViewSet, DistrictsViewSet, WardsViewSet
from apps.crops.views import CropsViewSet, TechnicalProcessesViewSet, ProcessStagesViewSet, StageTasksViewSet
from apps.farms.views import CooperativesViewSet, FarmersViewSet, FarmsViewSet
from apps.seasons.views import SeasonsViewSet, DailyTasksViewSet, FarmingLogsViewSet
from apps.market.views import PriceSourcesViewSet, MarketPricesViewSet, DemandForecastsViewSet, PlantingRecommendationsViewSet
from apps.chatbot.views import ChatLogsViewSet, FaqsViewSet, AlertsViewSet, NotificationsViewSet

# Create main router
router = routers.DefaultRouter()

# Core
router.register(r'roles', RolesViewSet)
router.register(r'users', UsersViewSet)

# Locations
router.register(r'provinces', ProvincesViewSet)
router.register(r'districts', DistrictsViewSet)
router.register(r'wards', WardsViewSet)

# Crops
router.register(r'crops', CropsViewSet)
router.register(r'technical-processes', TechnicalProcessesViewSet)
router.register(r'process-stages', ProcessStagesViewSet)
router.register(r'stage-tasks', StageTasksViewSet)

# Farms
router.register(r'cooperatives', CooperativesViewSet)
router.register(r'farmers', FarmersViewSet)
router.register(r'farms', FarmsViewSet)

# Seasons
router.register(r'seasons', SeasonsViewSet)
router.register(r'daily-tasks', DailyTasksViewSet)
router.register(r'farming-logs', FarmingLogsViewSet)

# Market
router.register(r'price-sources', PriceSourcesViewSet)
router.register(r'market-prices', MarketPricesViewSet)
router.register(r'demand-forecasts', DemandForecastsViewSet)
router.register(r'planting-recommendations', PlantingRecommendationsViewSet)

# Chatbot
router.register(r'chat-logs', ChatLogsViewSet)
router.register(r'faqs', FaqsViewSet)
router.register(r'alerts', AlertsViewSet)
router.register(r'notifications', NotificationsViewSet)
