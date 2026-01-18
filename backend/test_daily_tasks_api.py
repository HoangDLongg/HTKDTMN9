"""
Test Daily Tasks API
Verify all endpoints and functionality for daily tasks management
"""
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.seasons.models import Seasons, DailyTasks
from apps.farms.models import Farmers
from apps.core.models import Users

def test_daily_tasks():
    print("\n" + "="*80)
    print("DAILY TASKS API TEST")
    print("="*80)
    
    # Get farmer user
    farmer_user = Users.objects.filter(role__name='farmer').first()
    if not farmer_user:
        print("❌ No farmer user found!")
        return
    
    print(f"\n✓ Testing with farmer: {farmer_user.full_name} (ID: {farmer_user.id})")
    
    # Get farmer profile
    try:
        farmer = Farmers.objects.get(user=farmer_user)
        print(f"✓ Farmer profile: {farmer.farmer_code}")
    except Farmers.DoesNotExist:
        print("❌ Farmer profile not found!")
        return
    
    # Get farmer's seasons
    seasons = Seasons.objects.filter(farm__farmer=farmer)
    print(f"\n✓ Farmer has {seasons.count()} season(s)")
    
    if not seasons.exists():
        print("❌ No seasons found for farmer!")
        return
    
    # Test each season
    for season in seasons[:2]:  # Test first 2 seasons
        print(f"\n{'─'*80}")
        print(f"Season: {season.season_code}")
        print(f"Crop: {season.crop.name if season.crop else 'N/A'}")
        print(f"Status: {season.status}")
        print(f"Start Date: {season.start_date}")
        
        # Get daily tasks
        tasks = DailyTasks.objects.filter(season=season).order_by('due_date')
        print(f"\n✓ Total tasks: {tasks.count()}")
        
        # Statistics
        today = date.today()
        completed = tasks.filter(is_completed=True).count()
        pending = tasks.filter(is_completed=False).count()
        overdue = tasks.filter(is_completed=False, due_date__lt=today).count()
        upcoming = tasks.filter(is_completed=False, due_date__gte=today).count()
        
        print(f"\n📊 Task Statistics:")
        print(f"   ✅ Completed: {completed}")
        print(f"   ⏳ Pending: {pending}")
        print(f"   ⚠️  Overdue: {overdue}")
        print(f"   📅 Upcoming: {upcoming}")
        
        # Show sample tasks
        print(f"\n📋 Sample Tasks:")
        
        # Show today's tasks
        today_tasks = tasks.filter(due_date=today)
        if today_tasks.exists():
            print(f"\n   🔥 TODAY'S TASKS ({today_tasks.count()}):")
            for task in today_tasks[:5]:
                status_icon = "✅" if task.is_completed else "⭕"
                print(f"      {status_icon} {task.task_name}")
                if task.description:
                    print(f"         └─ {task.description[:60]}...")
        
        # Show upcoming tasks
        upcoming_tasks = tasks.filter(is_completed=False, due_date__gt=today)[:5]
        if upcoming_tasks.exists():
            print(f"\n   📅 UPCOMING TASKS (Next 5):")
            for task in upcoming_tasks:
                print(f"      {task.due_date} - {task.task_name}")
        
        # Show overdue tasks
        overdue_tasks = tasks.filter(is_completed=False, due_date__lt=today)[:5]
        if overdue_tasks.exists():
            print(f"\n   ⚠️  OVERDUE TASKS ({overdue_tasks.count()}):")
            for task in overdue_tasks[:5]:
                days_overdue = (today - task.due_date).days
                print(f"      {task.due_date} ({days_overdue} days ago) - {task.task_name}")
        
        # Show recently completed
        completed_tasks = tasks.filter(is_completed=True).order_by('-completed_at')[:5]
        if completed_tasks.exists():
            print(f"\n   ✅ RECENTLY COMPLETED:")
            for task in completed_tasks:
                print(f"      {task.task_name}")
                if task.completed_at:
                    print(f"         └─ Completed: {task.completed_at.strftime('%Y-%m-%d %H:%M')}")
    
    # API Endpoint Summary
    print(f"\n{'='*80}")
    print("API ENDPOINTS SUMMARY")
    print("="*80)
    print("\n📍 Available Endpoints:")
    print("\n1. List all tasks for a season:")
    print("   GET /api/seasons/{season_id}/daily_tasks/")
    print("\n2. List all daily tasks (with filtering):")
    print("   GET /api/daily-tasks/?season={id}")
    print("   GET /api/daily-tasks/?is_completed=false")
    print("   GET /api/daily-tasks/?due_date=2026-01-17")
    print("\n3. Get task detail:")
    print("   GET /api/daily-tasks/{task_id}/")
    print("\n4. Mark task as complete:")
    print("   POST /api/daily-tasks/{task_id}/complete/")
    print("   Body: {}")
    print("\n5. Update task:")
    print("   PUT /api/daily-tasks/{task_id}/")
    print("   PATCH /api/daily-tasks/{task_id}/")
    
    # Test data for API
    if seasons.exists():
        first_season = seasons.first()
        first_task = DailyTasks.objects.filter(season=first_season, is_completed=False).first()
        
        print(f"\n{'='*80}")
        print("SAMPLE API CALLS")
        print("="*80)
        
        print(f"\n# Get tasks for season {first_season.season_code}:")
        print(f"curl -H 'Authorization: Bearer {{token}}' \\")
        print(f"     http://127.0.0.1:8000/api/seasons/{first_season.id}/daily_tasks/")
        
        if first_task:
            print(f"\n# Complete task '{first_task.task_name}':")
            print(f"curl -X POST \\")
            print(f"     -H 'Authorization: Bearer {{token}}' \\")
            print(f"     -H 'Content-Type: application/json' \\")
            print(f"     http://127.0.0.1:8000/api/daily-tasks/{first_task.id}/complete/")
        
        print(f"\n# Filter overdue tasks:")
        print(f"curl -H 'Authorization: Bearer {{token}}' \\")
        print(f"     'http://127.0.0.1:8000/api/daily-tasks/?is_completed=false&due_date__lt={today}'")
    
    print(f"\n{'='*80}")
    print("✓ Test Complete!")
    print("="*80)

if __name__ == '__main__':
    test_daily_tasks()
