"""
Script to fix ForeignKey references to use proper app.Model notation
"""
import re

# Mapping of model names to their app labels
MODEL_TO_APP = {
    'Users': 'core',
    'Roles': 'core',
    'Provinces': 'locations',
    'Districts': 'locations',
    'Wards': 'locations',
    'Crops': 'crops',
    'TechnicalProcesses': 'crops',
    'ProcessStages': 'crops',
    'StageTasks': 'crops',
    'Cooperatives': 'farms',
    'Farmers': 'farms',
    'Farms': 'farms',
    'Seasons': 'seasons',
    'DailyTasks': 'seasons',
    'FarmingLogs': 'seasons',
    'PriceSources': 'market',
    'MarketPrices': 'market',
    'DemandForecasts': 'market',
    'PlantingRecommendations': 'market',
    'ChatLogs': 'chatbot',
    'Faqs': 'chatbot',
    'Alerts': 'chatbot',
    'Notifications': 'chatbot',
}

def fix_foreign_keys_with_app_label(filepath):
    """Fix ForeignKey references to include app label"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match ForeignKey with simple string reference
    # Example: models.ForeignKey('Users', ...)
    # Should become: models.ForeignKey('core.Users', ...)
    
    for model_name, app_label in MODEL_TO_APP.items():
        # Match both ForeignKey and OneToOneField
        patterns = [
            (rf"models\.ForeignKey\('{model_name}',", f"models.ForeignKey('{app_label}.{model_name}',"),
            (rf"models\.OneToOneField\('{model_name}',", f"models.OneToOneField('{app_label}.{model_name}',"),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix all models.py files
apps = ['core', 'locations', 'crops', 'farms', 'seasons', 'market', 'chatbot']

print("Fixing ForeignKey references with app labels...")
for app in apps:
    filepath = f'apps/{app}/models.py'
    fix_foreign_keys_with_app_label(filepath)
    print(f"✅ Fixed {filepath}")

print("\n✅ All ForeignKey references updated with app labels!")
