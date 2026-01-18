from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Crops, TechnicalProcesses, ProcessStages, StageTasks, CropDocuments
from .serializers import CropsSerializer, TechnicalProcessesSerializer, ProcessStagesSerializer, StageTasksSerializer
from .crop_documents_serializers import CropDocumentsSerializer

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


class CropDocumentsViewSet(viewsets.ModelViewSet):
    """API endpoint for Crop Documents"""
    queryset = CropDocuments.objects.select_related('crop', 'cooperative', 'uploaded_by').all()
    serializer_class = CropDocumentsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter documents based on user role and cooperative"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by crop if provided
        crop_id = self.request.query_params.get('crop')
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
        
        # Filter by document type
        doc_type = self.request.query_params.get('type')
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        
        # Only show public docs or docs for user's cooperative
        if user.is_authenticated and hasattr(user, 'cooperative_manager'):
            coop_id = user.cooperative_manager.first().cooperative_id if user.cooperative_manager.exists() else None
            if coop_id:
                queryset = queryset.filter(models.Q(is_public=True) | models.Q(cooperative_id=coop_id))
            else:
                queryset = queryset.filter(is_public=True)
        else:
            queryset = queryset.filter(is_public=True)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def track_view(self, request, pk=None):
        """Increment view count"""
        doc = self.get_object()
        doc.view_count += 1
        doc.save(update_fields=['view_count'])
        return Response({'view_count': doc.view_count})
    
    @action(detail=True, methods=['post'])
    def track_download(self, request, pk=None):
        """Increment download count"""
        doc = self.get_object()
        doc.download_count += 1
        doc.save(update_fields=['download_count'])
        return Response({'download_count': doc.download_count})
