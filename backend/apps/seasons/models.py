from django.db import models


class Seasons(models.Model):
    season_code = models.CharField(unique=True, max_length=50)
    farm = models.ForeignKey('farms.Farms', models.DO_NOTHING, blank=True, null=True)
    crop = models.ForeignKey('crops.Crops', models.DO_NOTHING, blank=True, null=True)
    process = models.ForeignKey('crops.TechnicalProcesses', models.DO_NOTHING, blank=True, null=True)
    start_date = models.DateField()
    expected_harvest_date = models.DateField(blank=True, null=True)
    actual_harvest_date = models.DateField(blank=True, null=True)
    area_planted = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    expected_yield = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actual_yield = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'seasons'


class DailyTasks(models.Model):
    season = models.ForeignKey('seasons.Seasons', models.DO_NOTHING, blank=True, null=True)
    stage_task = models.ForeignKey('crops.StageTasks', models.DO_NOTHING, blank=True, null=True)
    task_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    completed_by = models.ForeignKey('core.Users', models.DO_NOTHING, db_column='completed_by', blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'daily_tasks'


class FarmingLogs(models.Model):
    season = models.ForeignKey('seasons.Seasons', models.DO_NOTHING, blank=True, null=True)
    daily_task = models.ForeignKey('seasons.DailyTasks', models.DO_NOTHING, blank=True, null=True)
    log_date = models.DateField()
    activity_type = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    materials_used = models.TextField(blank=True, null=True)
    quantity_used = models.CharField(max_length=100, blank=True, null=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    weather_condition = models.CharField(max_length=100, blank=True, null=True)
    images = models.TextField(blank=True, null=True)  # This field type is a guess.
    logged_by = models.ForeignKey('core.Users', models.DO_NOTHING, db_column='logged_by', blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'farming_logs'
