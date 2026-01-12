from django.contrib import admin
from .models import Cooperatives, Farmers, Farms


@admin.register(Cooperatives)
class CooperativesAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'ward', 'phone', 'email', 'manager')
    search_fields = ('code', 'name', 'tax_code', 'email')
    list_filter = ('ward__district__province', 'created_at')
    autocomplete_fields = ['ward', 'manager']
    readonly_fields = ('created_at',)


@admin.register(Farmers)
class FarmersAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer_code', 'user', 'cooperative', 'ward', 'bank_name')
    search_fields = ('farmer_code', 'user__full_name', 'id_card', 'bank_account')
    list_filter = ('cooperative', 'ward__district__province', 'created_at')
    autocomplete_fields = ['user', 'cooperative', 'ward']
    readonly_fields = ('created_at',)


@admin.register(Farms)
class FarmsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'farmer', 'area_hectare', 'ward', 'soil_type', 'water_source')
    search_fields = ('name', 'farmer__farmer_code', 'farmer__user__full_name')
    list_filter = ('soil_type', 'water_source', 'ward__district__province', 'created_at')
    autocomplete_fields = ['farmer', 'ward']
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('farmer', 'name', 'area_hectare')
        }),
        ('Location', {
            'fields': ('ward', 'location_lat', 'location_lng')
        }),
        ('Farm Details', {
            'fields': ('soil_type', 'water_source')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
