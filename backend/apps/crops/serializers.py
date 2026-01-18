from rest_framework import serializers
from .models import Crops, TechnicalProcesses, ProcessStages, StageTasks

class CropsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crops
        fields = '__all__'


# Nested serializer for tasks within stages
class StageTasksNestedSerializer(serializers.ModelSerializer):
    # Map frontend-friendly field names to database field names
    name = serializers.CharField(source='task_name', read_only=True)
    day_offset = serializers.IntegerField(source='day_number', read_only=True)
    
    class Meta:
        model = StageTasks
        fields = ['id', 'name', 'description', 'day_offset']


# Nested serializer for stages within processes
class ProcessStagesNestedSerializer(serializers.ModelSerializer):
    tasks = StageTasksNestedSerializer(many=True, read_only=True, source='stagetasks_set')
    # Map frontend-friendly field names to database field names
    start_day = serializers.IntegerField(source='day_start', read_only=True)
    end_day = serializers.IntegerField(source='day_end', read_only=True)
    
    class Meta:
        model = ProcessStages
        fields = ['id', 'name', 'description', 'start_day', 'end_day', 'tasks']


class TechnicalProcessesSerializer(serializers.ModelSerializer):
    # Include nested stages with their tasks
    stages = ProcessStagesNestedSerializer(many=True, read_only=True, source='processstages_set')
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    
    class Meta:
        model = TechnicalProcesses
        fields = '__all__'


# Standalone serializers for direct CRUD operations
class ProcessStagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessStages
        fields = '__all__'


class StageTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageTasks
        fields = '__all__'
