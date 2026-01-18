import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import Crops
from apps.market.models import PlantingRecommendations

print("\n" + "="*60)
print("CROPS DATA")
print("="*60)
crops = Crops.objects.all()[:10]
for c in crops:
    print(f"ID: {c.id:2d} | Code: {c.code:8s} | Name: {c.name}")

print("\n" + "="*60)
print("PLANTING RECOMMENDATIONS")
print("="*60)
recs = PlantingRecommendations.objects.select_related('crop', 'cooperative').all()[:10]
if recs:
    for r in recs:
        crop_name = r.crop.name if r.crop else "N/A"
        coop_name = r.cooperative.name if r.cooperative else "N/A"
        print(f"ID: {r.id:2d} | Crop: {crop_name:15s} | HTX: {coop_name:20s}")
        print(f"       Area: {r.recommended_area} ha | Start: {r.recommended_start_date} | Price: {r.expected_price:,.0f} VND")
        print(f"       Reason: {r.reason[:80] if r.reason else 'N/A'}...")
        print()
else:
    print("Chưa có recommendations nào trong database!")
