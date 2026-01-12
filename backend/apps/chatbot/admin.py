from django.contrib import admin
from .models import ChatLogs, Faqs, Alerts, Notifications


@admin.register(ChatLogs)
class ChatLogsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'platform', 'message_type', 'intent', 'confidence_score', 'created_at')
    search_fields = ('user__username', 'platform_user_id', 'user_message', 'bot_response', 'intent')
    list_filter = ('platform', 'message_type', 'intent', 'created_at')
    autocomplete_fields = ['user']
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'platform', 'platform_user_id')
        }),
        ('Message', {
            'fields': ('message_type', 'user_message', 'bot_response')
        }),
        ('AI Analysis', {
            'fields': ('intent', 'confidence_score')
        }),
    )


@admin.register(Faqs)
class FaqsAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'question_preview', 'view_count', 'is_active', 'created_at')
    search_fields = ('category', 'question', 'answer', 'keywords')
    list_filter = ('category', 'is_active', 'created_at')
    readonly_fields = ('view_count', 'created_at')
    
    def question_preview(self, obj):
        return obj.question[:50] + '...' if len(obj.question) > 50 else obj.question
    question_preview.short_description = 'Question'


@admin.register(Alerts)
class AlertsAdmin(admin.ModelAdmin):
    list_display = ('id', 'alert_type', 'severity', 'title', 'valid_from', 'valid_until', 'is_active')
    search_fields = ('title', 'message')
    list_filter = ('alert_type', 'severity', 'is_active', 'created_at')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Alert Info', {
            'fields': ('alert_type', 'severity', 'title', 'is_active')
        }),
        ('Message', {
            'fields': ('message',)
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Affected Areas', {
            'fields': ('affected_area_ids',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notifications)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'alert', 'channel', 'status', 'sent_at')
    search_fields = ('user__username', 'alert__title')
    list_filter = ('channel', 'status', 'sent_at')
    autocomplete_fields = ['user', 'alert']
    readonly_fields = ('sent_at',)
    date_hierarchy = 'sent_at'
