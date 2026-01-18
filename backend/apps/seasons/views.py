from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from django.utils import timezone
from .models import Seasons, DailyTasks, FarmingLogs, SeasonRegistrations
from .serializers import (
    SeasonsSerializer, DailyTasksSerializer, FarmingLogsSerializer,
    SeasonRegistrationSerializer, FarmerRegistrationInputSerializer
)
from .services import SeasonService
from apps.farms.models import Farms, Farmers
from apps.crops.models import Crops, TechnicalProcesses
from apps.market.models import PlantingRecommendations


class SeasonsViewSet(viewsets.ModelViewSet):
    """API endpoint for Seasons with business logic"""
    queryset = Seasons.objects.all()
    serializer_class = SeasonsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter seasons based on user role"""
        user = self.request.user
        
        # If not authenticated, return empty queryset
        if not user.is_authenticated:
            return Seasons.objects.none()
        
        # Check role - Admin or HTX Manager can see all
        if user.role and user.role.name in ['Admin', 'HTX Manager', 'admin', 'cooperative_manager']:
            return Seasons.objects.all()
        
        # Farmer role - only their seasons via farm ownership
        try:
            return Seasons.objects.filter(farm__farmer__user=user)
        except Exception as e:
            print(f"Error filtering seasons: {e}")
            return Seasons.objects.none()
    
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
    
    @action(detail=True, methods=['get'])
    def daily_tasks(self, request, pk=None):
        """
        Get all daily tasks for a specific season
        
        GET /api/seasons/{id}/daily_tasks/
        """
        try:
            season = self.get_object()
            tasks = DailyTasks.objects.filter(season=season).order_by('due_date')
            serializer = DailyTasksSerializer(tasks, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
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
    

class SeasonRegistrationViewSet(viewsets.ModelViewSet):
    """API endpoint for Farmer Season Registrations"""
    queryset = SeasonRegistrations.objects.all()
    serializer_class = SeasonRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Farmer registers for a recommendation"""
        try:
            input_serializer = FarmerRegistrationInputSerializer(data=request.data)
            input_serializer.is_valid(raise_exception=True)
            
            # Get current farmer
            try:
                farmer = Farmers.objects.get(user=request.user)
            except Farmers.DoesNotExist:
                return Response({'error': 'User is not a farmer'}, status=status.HTTP_403_FORBIDDEN)
            
            # Create registration logic
            # (Simplified for brevity - relying on serializer mostly but adding custom checks)
            rec_id = input_serializer.validated_data['recommendation_id']
            farm_id = input_serializer.validated_data['farm_id']
            
            if SeasonRegistrations.objects.filter(recommendation_id=rec_id, farmer=farmer, farm_id=farm_id).exists():
                 return Response({'error': 'Already registered'}, status=status.HTTP_400_BAD_REQUEST)

            registration = SeasonRegistrations.objects.create(
                recommendation_id=rec_id,
                farmer=farmer,
                farm_id=farm_id,
                area_registered=input_serializer.validated_data['area_registered'],
                status='pending'
            )
            
            return Response(SeasonRegistrationSerializer(registration).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='my-registrations')
    def my_registrations(self, request):
        """Get current farmer's registrations"""
        try:
            farmer = Farmers.objects.get(user=request.user)
            registrations = SeasonRegistrations.objects.filter(farmer=farmer).order_by('-created_at')
            return Response(SeasonRegistrationSerializer(registrations, many=True).data)
        except Farmers.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='pending-registrations')
    def pending_registrations(self, request):
        """Get pending registrations for HTX Manager"""
        user = request.user
        queryset = SeasonRegistrations.objects.filter(status='pending')
        
        # If user is HTX Manager, filter by their cooperative
        # Assuming HTX Manager has a linked profile or logic.
        # For now, we return all pending registrations to ensure it works.
        # Ideally: 
        # try:
        #     manager_coop = user.cooperative_manager_profile.cooperative
        #     queryset = queryset.filter(farmer__cooperative=manager_coop)
        # except:
        #     pass
            
        return Response(SeasonRegistrationSerializer(queryset, many=True).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """HTX approves registration"""
        registration = self.get_object()
        if registration.status != 'pending':
            return Response({'error': 'Not pending'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Get recommendation if exists
            rec = registration.recommendation if hasattr(registration, 'recommendation') and registration.recommendation else None
            
            # Try to get crop from recommendation or registration
            crop = rec.crop if rec else registration.crop if hasattr(registration, 'crop') and registration.crop else None
            
            if not crop:
                return Response({'error': 'No crop information found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get technical process for the crop, fallback to first available process
            process = crop.technicalprocesses_set.first()
            if not process:
                # Use any available technical process as fallback
                process = TechnicalProcesses.objects.filter(is_active=True).first()
                if not process:
                    process = TechnicalProcesses.objects.first()
                    
            if not process:
                return Response({
                    'error': 'No technical process available for this crop. Please create a technical process first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine start date
            if rec and hasattr(rec, 'recommended_start_date') and rec.recommended_start_date:
                start_date = rec.recommended_start_date
            else:
                start_date = datetime.date.today()
            
            # Create season with timeline
            season = SeasonService.create_season_with_timeline(
                farm=registration.farm,
                crop=crop,
                process=process, 
                start_date=start_date,
                area_planted=float(registration.area_registered)
            )
            
            registration.status = 'approved'
            registration.season = season
            registration.approved_by = request.user
            registration.approved_at = timezone.now()
            registration.save()
            
            return Response(SeasonRegistrationSerializer(registration).data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DailyTasksViewSet(viewsets.ModelViewSet):
    """API endpoint for DailyTasks"""
    queryset = DailyTasks.objects.all()
    serializer_class = DailyTasksSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['due_date', 'season', 'is_completed', 'season__farm']
    search_fields = ['task_name', 'description']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        # If user is anonymous (shouldn't happen with IsAuthenticated), return empty
        if not user.is_authenticated:
            return qs.none()

        # Check role - Admin or HTX Manager can see all
        if user.role and user.role.name in ['Admin', 'HTX Manager', 'admin', 'cooperative_manager']:
            return qs
              
        # Farmer role - only their tasks (via farm->farmer->user relationship)
        return qs.filter(season__farm__farmer__user=user)


    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        task.is_completed = True
        task.completed_at = datetime.now()
        task.completed_by_id = request.user.id
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class FarmingLogsViewSet(viewsets.ModelViewSet):
    """API endpoint for FarmingLogs"""
    queryset = FarmingLogs.objects.all()
    serializer_class = FarmingLogsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
