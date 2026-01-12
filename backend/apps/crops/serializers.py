from rest_framework import serializers
from .models import Crops, TechnicalProcesses, ProcessStages, StageTasks

class CropsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crops
        fields = '__all__'


class TechnicalProcessesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicalProcesses
        fields = '__all__'


class ProcessStagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessStages
        fields = '__all__'


class StageTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageTasks
        fields = '__all__'
