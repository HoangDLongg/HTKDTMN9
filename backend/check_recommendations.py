import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()

from apps.market.models import PlantingRecommendations

recs = PlantingRecommendations.objects.all()
print(f'Total recommendations: {recs.count()}')

for r in recs[:5]:
    crop_name = r.crop.name if r.crop else "No crop"
    print(f'  - {crop_name}: {r.recommended_start_date} - {r.recommended_end_date}')
    print(f'    Status: {r.status}, Priority: {r.priority_level}')
