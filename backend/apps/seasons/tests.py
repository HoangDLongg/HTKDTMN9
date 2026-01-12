"""
Unit tests for Season Service
"""
import pytest
from datetime import datetime, timedelta
from django.test import TestCase
from apps.seasons.services import SeasonService
from apps.seasons.models import Seasons, DailyTasks
from apps.farms.models import Farms, Farmers, Cooperatives
from apps.crops.models import Crops, TechnicalProcesses, ProcessStages, StageTasks
from apps.locations.models import Wards, Districts, Provinces
from apps.core.models import Users, Roles


@pytest.mark.django_db
class TestSeasonService(TestCase):
    """Test cases for SeasonService"""
    
    def setUp(self):
        """Set up test data"""
        # Create role
        self.role = Roles.objects.create(name='Admin', description='Administrator')
        
        # Create user
        self.user = Users.objects.create(
            username='testuser',
            email='test@example.com',
            full_name='Test User',
            role=self.role
        )
        
        # Create location
        self.province = Provinces.objects.create(code='79', name='TP.HCM')
        self.district = Districts.objects.create(code='001', name='Quận 1', province=self.province)
        self.ward = Wards.objects.create(code='001', name='Phường 1', district=self.district)
        
        # Create cooperative
        self.cooperative = Cooperatives.objects.create(
            code='HTX001',
            name='HTX Test',
            ward=self.ward
        )
        
        # Create farmer
        self.farmer = Farmers.objects.create(
            farmer_code='ND001',
            user=self.user,
            cooperative=self.cooperative,
            ward=self.ward
        )
        
        # Create farm
        self.farm = Farms.objects.create(
            farmer=self.farmer,
            name='Test Farm',
            area_hectare=2.5,
            ward=self.ward
        )
        
        # Create crop
        self.crop = Crops.objects.create(
            code='CT001',
            name='Cà chua',
            category='Rau ăn quả'
        )
        
        # Create technical process
        self.process = TechnicalProcesses.objects.create(
            name='Quy trình cà chua',
            crop=self.crop,
            total_days=90,
            created_by=self.user
        )
        
        # Create stages and tasks
        self.stage1 = ProcessStages.objects.create(
            process=self.process,
            stage_order=1,
            name='Giai đoạn 1',
            day_start=1,
            day_end=30
        )
        
        self.task1 = StageTasks.objects.create(
            stage=self.stage1,
            task_order=1,
            day_number=1,
            task_name='Chuẩn bị đất',
            description='Làm đất, bón phân'
        )
        
        self.task2 = StageTasks.objects.create(
            stage=self.stage1,
            task_order=2,
            day_number=7,
            task_name='Gieo hạt',
            description='Gieo hạt giống'
        )
    
    def test_create_season_with_timeline(self):
        """Test creating season with automatic timeline"""
        start_date = datetime.now().date()
        
        season = SeasonService.create_season_with_timeline(
            farm=self.farm,
            crop=self.crop,
            process=self.process,
            start_date=start_date,
            area_planted=2.5
        )
        
        # Check season created
        self.assertIsNotNone(season)
        self.assertEqual(season.farm, self.farm)
        self.assertEqual(season.crop, self.crop)
        self.assertEqual(season.status, 'planned')
        
        # Check expected harvest date
        expected_harvest = start_date + timedelta(days=90)
        self.assertEqual(season.expected_harvest_date, expected_harvest)
        
        # Check daily tasks created
        daily_tasks = DailyTasks.objects.filter(season=season)
        self.assertEqual(daily_tasks.count(), 2)  # 2 tasks created
    
    def test_get_season_progress(self):
        """Test getting season progress"""
        start_date = datetime.now().date()
        
        season = SeasonService.create_season_with_timeline(
            farm=self.farm,
            crop=self.crop,
            process=self.process,
            start_date=start_date,
            area_planted=2.5
        )
        
        # Mark one task as completed
        task = DailyTasks.objects.filter(season=season).first()
        task.is_completed = True
        task.save()
        
        # Get progress
        progress = SeasonService.get_season_progress(season.id)
        
        self.assertEqual(progress['total_tasks'], 2)
        self.assertEqual(progress['completed_tasks'], 1)
        self.assertEqual(progress['progress_percentage'], 50.0)
    
    def test_update_season_status(self):
        """Test updating season status"""
        start_date = datetime.now().date()
        
        season = SeasonService.create_season_with_timeline(
            farm=self.farm,
            crop=self.crop,
            process=self.process,
            start_date=start_date,
            area_planted=2.5
        )
        
        # Valid transition
        updated_season = SeasonService.update_season_status(season.id, 'in_progress')
        self.assertEqual(updated_season.status, 'in_progress')
        
        # Invalid transition should raise error
        with self.assertRaises(ValueError):
            SeasonService.update_season_status(season.id, 'completed')
