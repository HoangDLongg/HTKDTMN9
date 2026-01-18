"""
URL Configuration for Agricultural Supply Chain API
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenRefreshView
from apps.chatbot.views import chat
from apps.core.views import CustomTokenObtainPairView
from .api_router import router


def home(request):
    return JsonResponse({"message": "AgriSupply Chain API"})


urlpatterns = [
    # Main routes
    path('', home),
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include(router.urls)),
    path('api/chat/', chat, name='chat'),  # AI Chat endpoint
    
    # Authentication
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
