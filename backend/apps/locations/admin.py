from django.contrib import admin
from .models import Provinces, Districts, Wards


@admin.register(Provinces)
class ProvincesAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'region')
    search_fields = ('code', 'name')
    list_filter = ('region',)
    ordering = ('code',)


@admin.register(Districts)
class DistrictsAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'province')
    search_fields = ('code', 'name')
    list_filter = ('province',)
    autocomplete_fields = ['province']
    ordering = ('code',)


@admin.register(Wards)
class WardsAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'district')
    search_fields = ('code', 'name')
    list_filter = ('district__province',)
    autocomplete_fields = ['district']
    ordering = ('code',)
