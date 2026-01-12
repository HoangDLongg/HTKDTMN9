from django.contrib import admin
from .models import Roles, Users


@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'full_name', 'role', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'full_name', 'phone')
    list_filter = ('role', 'is_active', 'created_at')
    readonly_fields = ('password_hash', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('username', 'email', 'full_name', 'phone')
        }),
        ('Role & Status', {
            'fields': ('role', 'is_active')
        }),
        ('Password', {
            'fields': ('password_hash',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
