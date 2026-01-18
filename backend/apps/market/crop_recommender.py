"""
Crop Recommendation Service - Location-based suggestions
"""
from apps.locations.models import Provinces, Districts, Wards
from apps.crops.models import Crops
from apps.farms.models import Farms, Farmers


class CropRecommendationService:
    """
    Service to recommend crops based on location (Province/District)
    """
    
    # Crop-Region Mapping (Vietnam regions)
    # Format: Province Name → List of suitable crops
    PROVINCE_CROPS = {
        # Northern Vietnam
        'Hà Nội': {
            'crops': ['Rau muống', 'Cải ngọt', 'Xà lách', 'Rau má'],
            'reason': 'Khí hậu ôn đới, phù hợp rau ăn lá quanh năm'
        },
        'Hải Dương': {
            'crops': ['Ổi', 'Nhãn', 'Vải'],
            'reason': 'Vùng trồng cây ăn quả đặc sản nổi tiếng'
        },
        'Bắc Giang': {
            'crops': ['Vải'],
            'reason': 'Vải Bắc Giang là đặc sản nổi tiếng'
        },
        
        # Southern Vietnam
        'Hồ Chí Minh': {
            'crops': ['Rau má', 'Dưa lưới', 'Cà chua', 'Rau muống'],
            'reason': 'Khí hậu nhiệt đới, ẩm ướt, phù hợp rau màu và dưa'
        },
        'Đồng Nai': {
            'crops': ['Dưa lưới', 'Cà chua', 'Bí ngô'],
            'reason': 'Vùng ngoại thành TP.HCM, phát triển nông nghiệp công nghệ cao'
        },
        'Lâm Đồng': {
            'crops': ['Cà chua', 'Xà lách', 'Bắp cải', 'Rau má'],
            'reason': 'Khí hậu cao nguyên mát mẻ, phù hợp rau ôn đới'
        },
        'Cần Thơ': {
            'crops': ['Rau muống', 'Bí ngô', 'Khoai lang'],
            'reason': 'Đồng bằng sông Cửu Long, đất phù sa màu mỡ'
        },
        
        # Central Vietnam
        'Đà Nẵng': {
            'crops': ['Rau muống', 'Cải ngọt', 'Rau má'],
            'reason': 'Ven biển, khí hậu nhiệt đới gió mùa'
        },
        'Quảng Nam': {
            'crops': ['Rau muống', 'Cà chua', 'Ớt'],
            'reason': 'Khí hậu nhiệt đới, phù hợp rau và gia vị'
        },
    }
    
    # Default crops for regions not specifically mapped
    DEFAULT_CROPS = {
        'Bắc Bộ': ['Rau muống', 'Cải ngọt', 'Xà lách'],
        'Trung Bộ': ['Rau muống', 'Cà chua', 'Ớt'],
        'Nam Bộ': ['Rau má', 'Dưa lưới', 'Bí ngô'],
    }
    
    @staticmethod
    def get_recommendations_by_location(province_id=None, district_id=None):
        """
        Get crop recommendations for a specific location
        
        Args:
            province_id: Province ID
            district_id: District ID (optional, for more specific recommendations)
            
        Returns:
            List of recommended crops with details
        """
        recommendations = []
        
        try:
            if province_id:
                province = Provinces.objects.get(id=province_id)
                province_name = province.name
                
                # Get crops for this province
                if province_name in CropRecommendationService.PROVINCE_CROPS:
                    mapping = CropRecommendationService.PROVINCE_CROPS[province_name]
                    crop_names = mapping['crops']
                    reason = mapping['reason']
                else:
                    # Use region default
                    region = province.region or 'Nam Bộ'
                    crop_names = CropRecommendationService.DEFAULT_CROPS.get(region, ['Rau muống', 'Cà chua'])
                    reason = f'Khuyến nghị chung cho vùng {region}'
                
                # Get crop objects from database
                for crop_name in crop_names:
                    try:
                        crop = Crops.objects.filter(name__icontains=crop_name).first()
                        if crop:
                            # Get latest market price for this crop
                            from apps.market.models import MarketPrices
                            latest_price = MarketPrices.objects.filter(
                                crop=crop
                            ).order_by('-price_date').first()
                            
                            avg_price = 0
                            if latest_price:
                                avg_price = float(latest_price.price_avg or latest_price.price_max or 0)
                            
                            # Determine best season based on province/region
                            best_season = CropRecommendationService._get_best_season(province_name, crop_name)
                            
                            recommendations.append({
                                'crop_id': crop.id,
                                'crop_code': crop.code,
                                'crop_name': crop.name,
                                'suitability_score': 90,  # Mock score
                                'reason': reason,
                                'province': province_name,
                                'category': crop.category or 'Rau màu',
                                'avg_price': avg_price,
                                'price_unit': 'VNĐ/kg',
                                'best_season': best_season,
                                'avg_yield': '20-30 tấn/ha',  # Mock data
                            })
                    except Crops.DoesNotExist:
                        continue

                        
        except Provinces.DoesNotExist:
            pass
            
        return recommendations
    
    @staticmethod
    def get_recommendations_for_farmer(farmer_id):
        """
        Get crop recommendations based on farmer's farm location
        
        Args:
            farmer_id: Farmer ID
            
        Returns:
            List of recommended crops
        """
        try:
            # Get farmer
            farmer = Farmers.objects.get(id=farmer_id)
            
            # Get farmer's farm (use first farm if multiple)
            farm = Farms.objects.filter(farmer=farmer).select_related(
                'ward__district__province'
            ).first()
            
            if not farm:
                return {
                    'error': 'Farmer chưa có nông trại. Vui lòng tạo nông trại trước.',
                    'recommendations': []
                }
            
            if not farm.ward:
                return {
                    'error': 'Nông trại chưa có thông tin vị trí (Ward). Vui lòng cập nhật.',
                    'recommendations': []
                }
            
            # Get location info
            ward = farm.ward
            district = ward.district
            province = district.province
            
            # Get recommendations
            recommendations = CropRecommendationService.get_recommendations_by_location(
                province_id=province.id,
                district_id=district.id
            )
            
            return {
                'farm_name': farm.name,
                'location': {
                    'ward': ward.name,
                    'district': district.name,
                    'province': province.name,
                },
                'recommendations': recommendations
            }
            
        except Farmers.DoesNotExist:
            return {
                'error': 'Farmer không tồn tại',
                'recommendations': []
            }
    
    @staticmethod
    def _get_best_season(province_name, crop_name):
        """
        Get best planting season for crop (rule-based)
        """
        seasons = {
            'Rau muống': 'Quanh năm (tốt nhất: Tháng 3-10)',
            'Cải ngọt': 'Tháng 9 - Tháng 3 (mùa đông)',
            'Xà lách': 'Tháng 10 - Tháng 4',
            'Rau má': 'Quanh năm (tốt nhất: Tháng 4-9)',
            'Cà chua': 'Tháng 8 - Tháng 3',
            'Dưa lưới': 'Tháng 9 - Tháng 4',
            'Ổi': 'Quanh năm',
            'Bí ngô': 'Tháng 2 - Tháng 6',
            'Bắp cải': 'Tháng 10 - Tháng 3',
            'Khoai lang': 'Tháng 3-5, Tháng 8-10',
        }
        return seasons.get(crop_name, 'Quanh năm')
