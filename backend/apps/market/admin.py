from django.contrib import admin
from .models import PriceSources, MarketPrices, DemandForecasts, PlantingRecommendations


@admin.register(PriceSources)
class PriceSourcesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'source_type', 'is_active')
    search_fields = ('name', 'url')
    list_filter = ('source_type', 'is_active')


@admin.register(MarketPrices)
class MarketPricesAdmin(admin.ModelAdmin):
    list_display = ('id', 'crop', 'price_date', 'price_avg', 'price_min', 'price_max', 'market_location', 'source')
    search_fields = ('crop__name', 'market_location')
    list_filter = ('crop', 'source', 'price_date', 'created_at')
    autocomplete_fields = ['crop', 'source']
    readonly_fields = ('created_at',)
    date_hierarchy = 'price_date'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('crop', 'price_date', 'market_location', 'source')
        }),
        ('Prices', {
            'fields': ('price_min', 'price_max', 'price_avg')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )


@admin.register(DemandForecasts)
class DemandForecastsAdmin(admin.ModelAdmin):
    list_display = ('id', 'crop', 'forecast_date', 'forecast_for_month', 'predicted_demand', 'predicted_price', 'confidence_score')
    search_fields = ('crop__name', 'model_version')
    list_filter = ('crop', 'forecast_date', 'created_at')
    autocomplete_fields = ['crop']
    readonly_fields = ('created_at',)
    date_hierarchy = 'forecast_date'


@admin.register(PlantingRecommendations)
class PlantingRecommendationsAdmin(admin.ModelAdmin):
    list_display = ('id', 'cooperative', 'crop', 'recommended_area', 'recommended_start_date', 'expected_price', 'priority_level', 'status')
    search_fields = ('cooperative__name', 'crop__name', 'reason')
    list_filter = ('status', 'priority_level', 'crop', 'created_at')
    autocomplete_fields = ['cooperative', 'crop']
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('cooperative', 'crop', 'status', 'priority_level')
        }),
        ('Recommendation', {
            'fields': ('recommended_area', 'recommended_start_date', 'expected_price')
        }),
        ('Reason', {
            'fields': ('reason',)
        }),
    )
