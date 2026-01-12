from django.db import models


class Cooperatives(models.Model):
    code = models.CharField(unique=True, max_length=50)
    name = models.CharField(max_length=255)
    tax_code = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    ward = models.ForeignKey('locations.Wards', models.DO_NOTHING, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    manager = models.ForeignKey('core.Users', models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cooperatives'


class Farmers(models.Model):
    user = models.ForeignKey('core.Users', models.DO_NOTHING, blank=True, null=True)
    farmer_code = models.CharField(unique=True, max_length=50)
    cooperative = models.ForeignKey('farms.Cooperatives', models.DO_NOTHING, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    ward = models.ForeignKey('locations.Wards', models.DO_NOTHING, blank=True, null=True)
    id_card = models.CharField(max_length=20, blank=True, null=True)
    bank_account = models.CharField(max_length=50, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'farmers'


class Farms(models.Model):
    farmer = models.ForeignKey('farms.Farmers', models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=255)
    area_hectare = models.DecimalField(max_digits=10, decimal_places=2)
    location_lat = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    location_lng = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    ward = models.ForeignKey('locations.Wards', models.DO_NOTHING, blank=True, null=True)
    soil_type = models.CharField(max_length=100, blank=True, null=True)
    water_source = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'farms'
