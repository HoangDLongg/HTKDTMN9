from rest_framework import viewsets, permissions
from .models import Crops, TechnicalProcesses, ProcessStages, StageTasks
from .serializers import CropsSerializer, TechnicalProcessesSerializer, ProcessStagesSerializer, StageTasksSerializer

class CropsViewSet(viewsets.ModelViewSet):
    """API endpoint for Crops"""
    queryset = Crops.objects.all()
    serializer_class = CropsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TechnicalProcessesViewSet(viewsets.ModelViewSet):
    """API endpoint for TechnicalProcesses"""
    queryset = TechnicalProcesses.objects.all()
    serializer_class = TechnicalProcessesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProcessStagesViewSet(viewsets.ModelViewSet):
    """API endpoint for ProcessStages"""
    queryset = ProcessStages.objects.all()
    serializer_class = ProcessStagesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class StageTasksViewSet(viewsets.ModelViewSet):
    """API endpoint for StageTasks"""
    queryset = StageTasks.objects.all()
    serializer_class = StageTasksSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
