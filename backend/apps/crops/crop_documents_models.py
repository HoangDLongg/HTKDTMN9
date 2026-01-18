"""
Crop Documents Models - Tài liệu cây trồng cho HTX quản lý
"""
from django.db import models


class CropDocuments(models.Model):
    """Tài liệu kỹ thuật cây trồng"""
    DOCUMENT_TYPES = [
        ('guide', 'Hướng dẫn kỹ thuật'),
        ('manual', 'Sổ tay canh tác'),
        ('video', 'Video hướng dẫn'),
        ('research', 'Nghiên cứu khoa học'),
        ('regulation', 'Quy định/Tiêu chuẩn'),
        ('other', 'Khác')
    ]
    
    crop = models.ForeignKey('crops.Crops', on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=500)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default='guide')
    description = models.TextField(blank=True, null=True)
    file_url = models.CharField(max_length=1000, blank=True, null=True)  # Link to file storage
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True, help_text='File size in bytes')
    external_link = models.CharField(max_length=1000, blank=True, null=True)  # External resource
    
    # Metadata
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True, help_text='Organization or publisher')
    publish_date = models.DateField(blank=True, null=True)
    
    # Access control
    is_public = models.BooleanField(default=True)
    cooperative = models.ForeignKey('farms.Cooperatives', on_delete=models.SET_NULL, blank=True, null=True, 
                                   help_text='If set, only this cooperative can access')
    
    # Tracking
    view_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0)
    uploaded_by = models.ForeignKey('core.Users', on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crop_documents'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.crop.name})"


class DocumentCategories(models.Model):
    """Danh mục tài liệu"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_categories'
        verbose_name_plural = 'Document Categories'
    
    def __str__(self):
        return self.name


class DocumentTags(models.Model):
    """Tags for documents"""
    name = models.CharField(max_length=100, unique=True)
    documents = models.ManyToManyField(CropDocuments, related_name='tags')
    
    class Meta:
        db_table = 'document_tags'
    
    def __str__(self):
        return self.name
