import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import Crops, TechnicalProcesses

try:
    crop = Crops.objects.filter(name__icontains='Dưa lưới').first()
    if crop:
        print(f"Crop: {crop.name} (ID: {crop.id})")
        processes = TechnicalProcesses.objects.filter(crop=crop)
        print(f"Processes count: {processes.count()}")
        for p in processes:
            print(f" - {p.name} (Duration: {p.total_duration} days)")
            
        if processes.count() == 0:
            print("WARNING: No technical process found! Tasks won't be generated.")
    else:
        print("Crop 'Dưa lưới' not found.")
except Exception as e:
    print(f"Error: {e}")
