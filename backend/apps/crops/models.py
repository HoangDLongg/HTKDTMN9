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
    
    crop = models.ForeignKey('crops.Crops', on_delete=models.CASCADE, related_name='documents', blank=True, null=True)
    title = models.CharField(max_length=500)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default='guide')
    description = models.TextField(blank=True, null=True)
    file_url = models.CharField(max_length=1000, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    external_link = models.CharField(max_length=1000, blank=True, null=True)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    publish_date = models.DateField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    cooperative = models.ForeignKey('farms.Cooperatives', on_delete=models.SET_NULL, blank=True, null=True)
    view_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0)
    uploaded_by = models.ForeignKey('core.Users', on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'crop_documents'


class Crops(models.Model):
    code = models.CharField(unique=True, max_length=50)
    name = models.CharField(max_length=255)
    scientific_name = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'crops'


class TechnicalProcesses(models.Model):
    crop = models.ForeignKey('crops.Crops', models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=255)
    total_days = models.IntegerField()
    standard_type = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('core.Users', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'technical_processes'


class ProcessStages(models.Model):
    process = models.ForeignKey('crops.TechnicalProcesses', models.DO_NOTHING, blank=True, null=True)
    stage_order = models.IntegerField()
    name = models.CharField(max_length=255)
    day_start = models.IntegerField()
    day_end = models.IntegerField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'process_stages'


class StageTasks(models.Model):
    stage = models.ForeignKey('crops.ProcessStages', models.DO_NOTHING, blank=True, null=True)
    task_order = models.IntegerField()
    day_number = models.IntegerField()
    task_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    materials_needed = models.TextField(blank=True, null=True)
    quantity_per_hectare = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stage_tasks'
