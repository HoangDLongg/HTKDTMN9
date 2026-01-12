from django.db import models


class Provinces(models.Model):
    code = models.CharField(unique=True, max_length=10)
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'provinces'


class Districts(models.Model):
    code = models.CharField(unique=True, max_length=10)
    name = models.CharField(max_length=255)
    province = models.ForeignKey('locations.Provinces', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'districts'


class Wards(models.Model):
    code = models.CharField(unique=True, max_length=10)
    name = models.CharField(max_length=255)
    district = models.ForeignKey('locations.Districts', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wards'
