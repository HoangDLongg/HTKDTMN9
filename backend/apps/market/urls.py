from rest_framework import routers
from .views import PriceSourcesViewSet, MarketPricesViewSet, DemandForecastsViewSet, PlantingRecommendationsViewSet

router = routers.DefaultRouter()
router.register(r'price-sources', PriceSourcesViewSet)
router.register(r'market-prices', MarketPricesViewSet)
router.register(r'demand-forecasts', DemandForecastsViewSet)
router.register(r'planting-recommendations', PlantingRecommendationsViewSet)

urlpatterns = router.urls
