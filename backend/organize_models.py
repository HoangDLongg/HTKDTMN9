"""
Script to organize generated models into appropriate Django apps
"""

# Model distribution mapping
MODEL_DISTRIBUTION = {
    'apps.core': [
        'Roles',
        'Users',
    ],
    'apps.locations': [
        'Provinces',
        'Districts',
        'Wards',
    ],
    'apps.crops': [
        'Crops',
        'TechnicalProcesses',
        'ProcessStages',
        'StageTasks',
    ],
    'apps.farms': [
        'Cooperatives',
        'Farmers',
        'Farms',
    ],
    'apps.seasons': [
        'Seasons',
        'DailyTasks',
        'FarmingLogs',
    ],
    'apps.market': [
        'PriceSources',
        'MarketPrices',
        'DemandForecasts',
        'PlantingRecommendations',
    ],
    'apps.chatbot': [
        'ChatLogs',
        'Faqs',
        'Alerts',
        'Notifications',
    ],
}

def extract_models_from_file(filename='models_generated.py'):
    """Extract individual model classes from generated file"""
    with open(filename, 'r', encoding='utf-16le') as f:
        content = f.read()
    
    models = {}
    current_model = None
    current_lines = []
    
    lines = content.split('\n')
    
    for line in lines:
        # Detect start of new model class
        if line.startswith('class ') and '(models.Model)' in line:
            # Save previous model if exists
            if current_model:
                models[current_model] = '\n'.join(current_lines)
            
            # Start new model
            current_model = line.split('(')[0].replace('class ', '').strip()
            current_lines = [line]
        elif current_model:
            current_lines.append(line)
            
            # Check if class ended (empty line after Meta)
            if line.strip() == '' and len(current_lines) > 5:
                # Check if previous lines had Meta class
                for prev_line in current_lines[-5:]:
                    if 'db_table' in prev_line:
                        # End of model
                        models[current_model] = '\n'.join(current_lines)
                        current_model = None
                        current_lines = []
                        break
    
    # Save last model
    if current_model:
        models[current_model] = '\n'.join(current_lines)
    
    return models

def create_models_files():
    """Create models.py files for each app"""
    print("Extracting models from generated file...")
    models = extract_models_from_file()
    
    print(f"Found {len(models)} models")
    
    # Header for models.py
    header = """from django.db import models


"""
    
    # Distribute models to apps
    for app_path, model_names in MODEL_DISTRIBUTION.items():
        app_name = app_path.split('.')[-1]
        models_path = f'apps/{app_name}/models.py'
        
        print(f"\nCreating {models_path}...")
        
        app_models = []
        for model_name in model_names:
            if model_name in models:
                app_models.append(models[model_name])
                print(f"  - Added {model_name}")
            else:
                print(f"  ⚠️  Warning: {model_name} not found in generated models")
        
        if app_models:
            with open(models_path, 'w', encoding='utf-8') as f:
                f.write(header)
                f.write('\n\n'.join(app_models))
            print(f"✅ Created {models_path} with {len(app_models)} models")

if __name__ == '__main__':
    create_models_files()
    print("\n✅ All models distributed successfully!")
