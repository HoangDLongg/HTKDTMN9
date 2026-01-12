"""
Script to auto-generate serializers, viewsets, and URLs for all apps
"""

# App configurations with their models
APP_CONFIGS = {
    'locations': ['Provinces', 'Districts', 'Wards'],
    'crops': ['Crops', 'TechnicalProcesses', 'ProcessStages', 'StageTasks'],
    'farms': ['Cooperatives', 'Farmers', 'Farms'],
    'seasons': ['Seasons', 'DailyTasks', 'FarmingLogs'],
    'market': ['PriceSources', 'MarketPrices', 'DemandForecasts', 'PlantingRecommendations'],
    'chatbot': ['ChatLogs', 'Faqs', 'Alerts', 'Notifications'],
}

def generate_serializers(app_name, models):
    """Generate serializers.py for an app"""
    imports = f"from rest_framework import serializers\nfrom .models import {', '.join(models)}\n\n"
    
    serializers_code = []
    for model in models:
        code = f"""class {model}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {model}
        fields = '__all__'
"""
        serializers_code.append(code)
    
    return imports + '\n\n'.join(serializers_code)

def generate_viewsets(app_name, models):
    """Generate views.py for an app"""
    imports = f"""from rest_framework import viewsets, permissions
from .models import {', '.join(models)}
from .serializers import {', '.join([f'{m}Serializer' for m in models])}

"""
    
    viewsets_code = []
    for model in models:
        code = f"""class {model}ViewSet(viewsets.ModelViewSet):
    \"\"\"API endpoint for {model}\"\"\"
    queryset = {model}.objects.all()
    serializer_class = {model}Serializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
"""
        viewsets_code.append(code)
    
    return imports + '\n\n'.join(viewsets_code)

def generate_urls(app_name, models):
    """Generate urls.py for an app"""
    imports = f"""from rest_framework import routers
from .views import {', '.join([f'{m}ViewSet' for m in models])}

router = routers.DefaultRouter()
"""
    
    registrations = []
    for model in models:
        # Convert CamelCase to kebab-case for URL
        url_name = ''.join(['-' + c.lower() if c.isupper() else c for c in model]).lstrip('-')
        registrations.append(f"router.register(r'{url_name}', {model}ViewSet)")
    
    return imports + '\n'.join(registrations) + "\n\nurlpatterns = router.urls\n"

# Generate files for each app
for app_name, models in APP_CONFIGS.items():
    print(f"\n{'='*50}")
    print(f"Generating files for app: {app_name}")
    print(f"{'='*50}")
    
    # Generate serializers
    serializers_content = generate_serializers(app_name, models)
    with open(f'apps/{app_name}/serializers.py', 'w', encoding='utf-8') as f:
        f.write(serializers_content)
    print(f"✅ Created apps/{app_name}/serializers.py")
    
    # Generate viewsets
    viewsets_content = generate_viewsets(app_name, models)
    with open(f'apps/{app_name}/views.py', 'w', encoding='utf-8') as f:
        f.write(viewsets_content)
    print(f"✅ Created apps/{app_name}/views.py")
    
    # Generate URLs
    urls_content = generate_urls(app_name, models)
    with open(f'apps/{app_name}/urls.py', 'w', encoding='utf-8') as f:
        f.write(urls_content)
    print(f"✅ Created apps/{app_name}/urls.py")

print(f"\n{'='*50}")
print("✅ All API files generated successfully!")
print(f"{'='*50}")
