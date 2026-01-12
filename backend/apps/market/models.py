from django.db import models


class PriceSources(models.Model):
    name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50, blank=True, null=True)
    url = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'price_sources'


class MarketPrices(models.Model):
    crop = models.ForeignKey('crops.Crops', models.DO_NOTHING, blank=True, null=True)
    price_date = models.DateField()
    price_min = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    price_max = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    price_avg = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    market_location = models.CharField(max_length=255, blank=True, null=True)
    source = models.ForeignKey('market.PriceSources', models.DO_NOTHING, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'market_prices'
        unique_together = (('crop', 'price_date', 'market_location'),)


class DemandForecasts(models.Model):
    crop = models.ForeignKey('crops.Crops', models.DO_NOTHING, blank=True, null=True)
    forecast_date = models.DateField()
    forecast_for_month = models.DateField()
    predicted_demand = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    predicted_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    model_version = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'demand_forecasts'


class PlantingRecommendations(models.Model):
    cooperative = models.ForeignKey('farms.Cooperatives', models.DO_NOTHING, blank=True, null=True)
    crop = models.ForeignKey('crops.Crops', models.DO_NOTHING, blank=True, null=True)
    recommended_area = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    recommended_start_date = models.DateField(blank=True, null=True)
    expected_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    priority_level = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'planting_recommendations'
