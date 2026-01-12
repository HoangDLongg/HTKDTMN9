from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from .models import Seasons, DailyTasks, FarmingLogs
from .serializers import SeasonsSerializer, DailyTasksSerializer, FarmingLogsSerializer
from .services import SeasonService
from apps.farms.models import Farms
from apps.crops.models import Crops, TechnicalProcesses


class SeasonsViewSet(viewsets.ModelViewSet):
    """API endpoint for Seasons with business logic"""
    queryset = Seasons.objects.all()
    serializer_class = SeasonsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['post'])
    def create_with_timeline(self, request):
        """
        Create a new season with automatic timeline generation
        
        POST /api/seasons/create_with_timeline/
        Body: {
            "farm_id": 1,
            "crop_id": 1,
            "process_id": 1,
            "start_date": "2026-02-01",
            "area_planted": 2.5
        }
        """
        try:
            farm = Farms.objects.get(id=request.data['farm_id'])
            crop = Crops.objects.get(id=request.data['crop_id'])
            process = TechnicalProcesses.objects.get(id=request.data['process_id'])
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            area_planted = float(request.data['area_planted'])
            
            season = SeasonService.create_season_with_timeline(
                farm=farm,
                crop=crop,
                process=process,
                start_date=start_date,
                area_planted=area_planted
            )
            
            serializer = self.get_serializer(season)
            return Response({
                'success': True,
                'message': 'Season created with timeline',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get season progress statistics"""
        try:
            progress_data = SeasonService.get_season_progress(pk)
            return Response(progress_data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update season status
        
        POST /api/seasons/{id}/update_status/
        Body: {"status": "in_progress"}
        """
        try:
            new_status = request.data.get('status')
            season = SeasonService.update_season_status(pk, new_status)
            serializer = self.get_serializer(season)
            return Response(serializer.data)
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class DailyTasksViewSet(viewsets.ModelViewSet):
    """API endpoint for DailyTasks"""
    queryset = DailyTasks.objects.all()
    serializer_class = DailyTasksSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        task.is_completed = True
        task.completed_at = datetime.now()
        task.completed_by_id = request.data.get('completed_by_id')
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class FarmingLogsViewSet(viewsets.ModelViewSet):
    """API endpoint for FarmingLogs"""
    queryset = FarmingLogs.objects.all()
    serializer_class = FarmingLogsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
