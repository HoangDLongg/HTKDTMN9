from django.contrib import admin
from .models import Seasons, DailyTasks, FarmingLogs


@admin.register(Seasons)
class SeasonsAdmin(admin.ModelAdmin):
    list_display = ('id', 'season_code', 'farm', 'crop', 'status', 'start_date', 'expected_harvest_date', 'area_planted')
    search_fields = ('season_code', 'farm__name', 'crop__name')
    list_filter = ('status', 'crop', 'start_date', 'created_at')
    autocomplete_fields = ['farm', 'crop', 'process']
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('season_code', 'farm', 'crop', 'process', 'status')
        }),
        ('Dates', {
            'fields': ('start_date', 'expected_harvest_date', 'actual_harvest_date')
        }),
        ('Area & Yield', {
            'fields': ('area_planted', 'expected_yield', 'actual_yield')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DailyTasks)
class DailyTasksAdmin(admin.ModelAdmin):
    list_display = ('id', 'season', 'task_name', 'due_date', 'is_completed', 'completed_at', 'completed_by')
    search_fields = ('task_name', 'description', 'season__season_code')
    list_filter = ('is_completed', 'due_date', 'created_at')
    autocomplete_fields = ['season', 'stage_task', 'completed_by']
    readonly_fields = ('created_at',)
    date_hierarchy = 'due_date'


@admin.register(FarmingLogs)
class FarmingLogsAdmin(admin.ModelAdmin):
    list_display = ('id', 'season', 'log_date', 'activity_type', 'cost', 'weather_condition', 'logged_by')
    search_fields = ('season__season_code', 'activity_type', 'description')
    list_filter = ('activity_type', 'weather_condition', 'log_date', 'created_at')
    autocomplete_fields = ['season', 'daily_task', 'logged_by']
    readonly_fields = ('created_at',)
    date_hierarchy = 'log_date'
