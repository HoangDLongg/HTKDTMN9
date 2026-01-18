"""
Test Cooperative Farmers Page Data
Kiểm tra dữ liệu nông dân cho trang HTX
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.farms.models import Farmers, Farms
from apps.seasons.models import Seasons

def test_farmers_data():
    print("\n" + "="*80)
    print("COOPERATIVE FARMERS PAGE - DATA CHECK")
    print("="*80)
    
    # Get all farmers
    farmers = Farmers.objects.select_related(
        'user', 'cooperative', 'ward__district__province'
    ).all()
    
    print(f"\n✓ Total farmers: {farmers.count()}")
    
    # Sample farmers
    for farmer in farmers[:3]:
        print(f"\n{'─'*80}")
        print(f"Farmer: {farmer.farmer_code}")
        print(f"Name: {farmer.user.full_name if farmer.user else 'No user'}")
        print(f"Username: {farmer.user.username if farmer.user else 'N/A'}")
        print(f"Email: {farmer.user.email if farmer.user else 'N/A'}")
        print(f"Phone: {farmer.user.phone if farmer.user else 'N/A'}")
        print(f"ID Card: {farmer.id_card or 'N/A'}")
        print(f"Address: {farmer.address or 'N/A'}")
        
        if farmer.ward:
            print(f"Ward: {farmer.ward.name}, {farmer.ward.district.name}, {farmer.ward.district.province.name}")
        
        print(f"Cooperative: {farmer.cooperative.name if farmer.cooperative else 'None'}")
        print(f"Bank: {farmer.bank_name or 'N/A'} - {farmer.bank_account or 'N/A'}")
        
        # Get farms
        farms = Farms.objects.filter(farmer=farmer)
        print(f"Farms: {farms.count()}")
        for farm in farms:
            print(f"  - {farm.name}: {farm.area_hectare} ha")
        
        # Get seasons
        seasons = Seasons.objects.filter(farm__farmer=farmer)
        print(f"Seasons: {seasons.count()}")
        for season in seasons[:3]:
            print(f"  - {season.season_code}: {season.crop.name if season.crop else 'N/A'} ({season.status})")
    
    print(f"\n{'='*80}")
    print("✓ Test Complete!")
    print("="*80)

if __name__ == '__main__':
    test_farmers_data()
