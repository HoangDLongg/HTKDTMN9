from rest_framework import serializers
from .models import CropDocuments, Crops


class CropDocumentsSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    cooperative_name = serializers.CharField(source='cooperative.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = CropDocuments
        fields = '__all__'
        read_only_fields = ('view_count', 'download_count', 'created_at', 'updated_at')


class CropsSerializer(serializers.ModelSerializer):
    documents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Crops
        fields = '__all__'
    
    def get_documents_count(self, obj):
        return obj.documents.count() if hasattr(obj, 'documents') else 0
