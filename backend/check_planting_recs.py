import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()

from apps.market.models import PlantingRecommendations
from apps.market.serializers import PlantingRecommendationsSerializer
import json

recs = PlantingRecommendations.objects.all()
print(f'Total: {recs.count()}')

for r in recs[:3]:
    s = PlantingRecommendationsSerializer(r)
    print(f'\nID: {r.id}, Crop ID: {r.crop_id}')
    print('Fields:', list(s.data.keys()))
    print('Serialized data:')
    print(json.dumps(s.data, indent=2, default=str))
