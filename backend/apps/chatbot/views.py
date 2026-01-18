from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import ChatLogs, Faqs, Alerts, Notifications
from .serializers import ChatLogsSerializer, FaqsSerializer, AlertsSerializer, NotificationsSerializer
from django.utils import timezone
import requests


# n8n webhook URL
N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/agri-chat'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    Send message to n8n AI assistant and return response
    
    POST /api/chat/
    Body: {"message": "giá thị trường hôm nay"}
    """
    message = request.data.get('message', '')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Call n8n webhook
        n8n_response = requests.post(
            N8N_WEBHOOK_URL,
            json={'message': message, 'user_id': request.user.id},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if n8n_response.status_code == 200:
            n8n_data = n8n_response.json()
            
            # Save to chat logs
            try:
                ChatLogs.objects.create(
                    user=request.user,
                    message=message,
                    response=n8n_data.get('answer', ''),
                    intent='auto-detected',
                    created_at=timezone.now()
                )
            except Exception as log_error:
                print(f"Failed to save chat log: {log_error}")
            
            return Response(n8n_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'n8n error', 'details': n8n_response.text},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Cannot connect to n8n. Make sure n8n is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatLogsViewSet(viewsets.ModelViewSet):
    """API endpoint for ChatLogs"""
    queryset = ChatLogs.objects.all()
    serializer_class = ChatLogsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FaqsViewSet(viewsets.ModelViewSet):
    """API endpoint for Faqs"""
    queryset = Faqs.objects.all()
    serializer_class = FaqsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AlertsViewSet(viewsets.ModelViewSet):
    """API endpoint for Alerts"""
    queryset = Alerts.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = AlertsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get active alerts (valid now)
        
        GET /api/alerts/active/
        """
        now = timezone.now()
        alerts = Alerts.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-created_at')
        
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def for_farmer(self, request):
        """
        Get alerts relevant to farmer's location
        
        GET /api/alerts/for_farmer/
        """
        # Get farmer's ward_id from their farm
        try:
            from apps.farms.models import Farmers, Farms
            farmer = Farmers.objects.get(user=request.user)
            farms = Farms.objects.filter(farmer=farmer)
            
            if not farms.exists():
                return Response([])
            
            # Get ward_ids from all farms
            ward_ids = list(farms.values_list('ward_id', flat=True).distinct())
            
            # Get active alerts
            now = timezone.now()
            alerts = Alerts.objects.filter(
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now
            ).order_by('-created_at')
            
            # Filter by location if affected_area_ids is set
            # Note: affected_area_ids is stored as text array in PostgreSQL
            # For now, return all active alerts
            # TODO: Implement proper array filtering when needed
            
            serializer = self.get_serializer(alerts, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            # If not a farmer or error, return all active alerts
            return self.active(request)


class NotificationsViewSet(viewsets.ModelViewSet):
    """API endpoint for Notifications"""
    queryset = Notifications.objects.all().order_by('-sent_at')
    serializer_class = NotificationsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter notifications by current user"""
        return Notifications.objects.filter(user=self.request.user).order_by('-sent_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Get unread notifications
        
        GET /api/notifications/unread/
        """
        notifications = self.get_queryset().filter(status='sent')
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread notifications
        
        GET /api/notifications/unread_count/
        """
        count = self.get_queryset().filter(status='sent').count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark notification as read
        
        POST /api/notifications/{id}/mark_read/
        """
        notification = self.get_object()
        notification.status = 'delivered'
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Mark all notifications as read
        
        POST /api/notifications/mark_all_read/
        """
        self.get_queryset().filter(status='sent').update(status='delivered')
        return Response({'message': 'All notifications marked as read'})
