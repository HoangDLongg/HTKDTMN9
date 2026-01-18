import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()

from apps.seasons.models import DailyTasks
from apps.crops.models import Crops

# Công việc chưa hoàn thành
incomplete = DailyTasks.objects.filter(is_completed=False)
print(f'Công việc chưa hoàn thành: {incomplete.count()}')

# Nhóm theo crop
crops_with_tasks = {}
for task in incomplete[:20]:
    if task.season and task.season.crop:
        crop_name = task.season.crop.name
        if crop_name not in crops_with_tasks:
            crops_with_tasks[crop_name] = []
        crops_with_tasks[crop_name].append({
            'task': task.task_name,
            'due': task.due_date,
            'description': task.description
        })

for crop, tasks in crops_with_tasks.items():
    print(f'\n🌾 {crop}:')
    for t in tasks:
        print(f'  - {t["task"]} (Hạn: {t["due"]})')
        if t['description']:
            print(f'    {t["description"]}')
