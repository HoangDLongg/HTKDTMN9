from rest_framework import serializers
from .models import Seasons, DailyTasks, FarmingLogs, SeasonRegistrations

class SeasonsSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    crop_details = serializers.SerializerMethodField()
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    name = serializers.CharField(source='season_code', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Seasons
        fields = '__all__'

    def get_is_active(self, obj):
        return obj.status == 'in_progress'
    
    def get_crop_details(self, obj):
        if obj.crop:
            return {
                'id': obj.crop.id,
                'code': obj.crop.code,
                'name': obj.crop.name,
            }
        return None


class DailyTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTasks
        fields = '__all__'


class FarmingLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmingLogs
        fields = '__all__'


class SeasonRegistrationSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.user.full_name', read_only=True)
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    farm_area = serializers.DecimalField(source='farm.area_hectare', max_digits=10, decimal_places=2, read_only=True)
    crop_name = serializers.CharField(source='recommendation.crop.name', read_only=True)
    crop_id = serializers.IntegerField(source='recommendation.crop.id', read_only=True)
    expected_price = serializers.DecimalField(source='recommendation.expected_price', max_digits=12, decimal_places=2, read_only=True)
    recommended_start_date = serializers.DateField(source='recommendation.recommended_start_date', read_only=True)
    
    class Meta:
        model = SeasonRegistrations
        fields = '__all__'
        read_only_fields = ['created_at', 'approved_by', 'approved_at', 'season', 'status']


class FarmerRegistrationInputSerializer(serializers.Serializer):
    """Input serializer for farmer registration request"""
    recommendation_id = serializers.IntegerField()
    farm_id = serializers.IntegerField()
    area_registered = serializers.DecimalField(max_digits=10, decimal_places=2)
