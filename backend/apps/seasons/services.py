"""
Business logic services for season management
"""
from datetime import datetime, timedelta
from django.db import transaction
from apps.seasons.models import Seasons, DailyTasks
from apps.crops.models import TechnicalProcesses, ProcessStages, StageTasks


class SeasonService:
    """Service for managing farming seasons"""
    
    @staticmethod
    @transaction.atomic
    def create_season_with_timeline(farm, crop, process, start_date, area_planted):
        """
        Create a new season and automatically generate timeline with daily tasks
        
        Args:
            farm: Farm instance
            crop: Crop instance
            process: TechnicalProcess instance
            start_date: Season start date
            area_planted: Area in hectares
            
        Returns:
            Created Season instance with all daily tasks
        """
        # Generate season code
        season_code = f"SS-{farm.id}-{crop.code}-{start_date.strftime('%Y%m%d')}"
        
        # Calculate expected harvest date
        expected_harvest_date = start_date + timedelta(days=process.total_days)
        
        # Create season
        season = Seasons.objects.create(
            season_code=season_code,
            farm=farm,
            crop=crop,
            process=process,
            start_date=start_date,
            expected_harvest_date=expected_harvest_date,
            area_planted=area_planted,
            status='planned'
        )
        
        # Generate daily tasks from process
        SeasonService._generate_daily_tasks(season, process, start_date)
        
        return season
    
    @staticmethod
    def _generate_daily_tasks(season, process, start_date):
        """
        Generate daily tasks based on technical process
        
        Args:
            season: Season instance
            process: TechnicalProcess instance
            start_date: Season start date
        """
        # Get all stages for this process
        stages = ProcessStages.objects.filter(process=process).order_by('stage_order')
        
        daily_tasks_to_create = []
        
        for stage in stages:
            # Get all tasks for this stage
            stage_tasks = StageTasks.objects.filter(stage=stage).order_by('task_order')
            
            for stage_task in stage_tasks:
                # Calculate due date
                due_date = start_date + timedelta(days=stage_task.day_number - 1)
                
                # Create daily task
                daily_task = DailyTasks(
                    season=season,
                    stage_task=stage_task,
                    task_name=stage_task.task_name,
                    description=stage_task.description,
                    due_date=due_date,
                    is_completed=False
                )
                daily_tasks_to_create.append(daily_task)
        
        # Bulk create all daily tasks
        DailyTasks.objects.bulk_create(daily_tasks_to_create)
        
        return len(daily_tasks_to_create)
    
    @staticmethod
    def update_season_status(season_id, new_status):
        """
        Update season status with validation
        
        Valid transitions:
        - planned -> in_progress
        - in_progress -> harvesting
        - harvesting -> completed
        """
        season = Seasons.objects.get(id=season_id)
        
        valid_transitions = {
            'planned': ['in_progress'],
            'in_progress': ['harvesting'],
            'harvesting': ['completed'],
        }
        
        if new_status not in valid_transitions.get(season.status, []):
            raise ValueError(f"Invalid status transition from {season.status} to {new_status}")
        
        season.status = new_status
        season.save()
        
        return season
    
    @staticmethod
    def get_season_progress(season_id):
        """
        Calculate season progress based on completed tasks
        
        Returns:
            dict with progress statistics
        """
        season = Seasons.objects.get(id=season_id)
        
        total_tasks = DailyTasks.objects.filter(season=season).count()
        completed_tasks = DailyTasks.objects.filter(season=season, is_completed=True).count()
        
        progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Get upcoming tasks (next 7 days)
        today = datetime.now().date()
        upcoming_tasks = DailyTasks.objects.filter(
            season=season,
            is_completed=False,
            due_date__gte=today,
            due_date__lte=today + timedelta(days=7)
        ).order_by('due_date')
        
        # Get overdue tasks
        overdue_tasks = DailyTasks.objects.filter(
            season=season,
            is_completed=False,
            due_date__lt=today
        ).order_by('due_date')
        
        return {
            'season_code': season.season_code,
            'status': season.status,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'progress_percentage': round(progress_percentage, 2),
            'upcoming_tasks_count': upcoming_tasks.count(),
            'overdue_tasks_count': overdue_tasks.count(),
            'days_until_harvest': (season.expected_harvest_date - today).days if season.expected_harvest_date else None,
        }
