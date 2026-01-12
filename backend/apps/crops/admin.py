from django.contrib import admin
from .models import Crops, TechnicalProcesses, ProcessStages, StageTasks


@admin.register(Crops)
class CropsAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'category', 'created_at')
    search_fields = ('code', 'name', 'scientific_name')
    list_filter = ('category', 'created_at')
    readonly_fields = ('created_at', 'updated_at')


class ProcessStagesInline(admin.TabularInline):
    model = ProcessStages
    extra = 0
    fields = ('stage_order', 'name', 'day_start', 'day_end', 'description')


@admin.register(TechnicalProcesses)
class TechnicalProcessesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'crop', 'total_days', 'standard_type', 'is_active')
    search_fields = ('name', 'crop__name')
    list_filter = ('standard_type', 'is_active', 'created_at')
    autocomplete_fields = ['crop', 'created_by']
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ProcessStagesInline]


class StageTasksInline(admin.TabularInline):
    model = StageTasks
    extra = 0
    fields = ('task_order', 'day_number', 'task_name', 'quantity_per_hectare')


@admin.register(ProcessStages)
class ProcessStagesAdmin(admin.ModelAdmin):
    list_display = ('id', 'process', 'stage_order', 'name', 'day_start', 'day_end')
    search_fields = ('name', 'process__name')
    list_filter = ('process',)
    autocomplete_fields = ['process']
    inlines = [StageTasksInline]


@admin.register(StageTasks)
class StageTasksAdmin(admin.ModelAdmin):
    list_display = ('id', 'stage', 'task_order', 'day_number', 'task_name', 'quantity_per_hectare')
    search_fields = ('task_name', 'description')
    list_filter = ('stage__process',)
    autocomplete_fields = ['stage']
