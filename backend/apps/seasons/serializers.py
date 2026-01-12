from rest_framework import serializers
from .models import Seasons, DailyTasks, FarmingLogs

class SeasonsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seasons
        fields = '__all__'


class DailyTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTasks
        fields = '__all__'


class FarmingLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmingLogs
        fields = '__all__'
