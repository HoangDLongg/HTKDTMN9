from datetime import datetime

# Today
today = datetime(2026, 1, 17)

# Seasons
seasons = [
    {'id': 5, 'crop': 'Dưa lưới', 'start': datetime(2026, 1, 2), 'end': datetime(2026, 3, 18), 'farm': 4, 'farmer': 'farmer3'},
    {'id': 6, 'crop': 'Rau má', 'start': datetime(2026, 1, 23), 'end': datetime(2026, 4, 8), 'farm': 1, 'farmer': 'farmer1'},
]

print(f"Today: {today.date()}\n")

for s in seasons:
    days_elapsed = (today - s['start']).days
    total_days = (s['end'] - s['start']).days
    
    if days_elapsed < 0:
        progress = 0
    elif days_elapsed >= total_days:
        progress = 100
    else:
        progress = (days_elapsed / total_days) * 100
    
    print(f"{s['crop']} (Farmer: {s['farmer']}, Farm: {s['farm']})")
    print(f"  Start: {s['start'].date()}, End: {s['end'].date()}")
    print(f"  Days elapsed: {days_elapsed}, Total: {total_days}")
    print(f"  Progress: {progress:.1f}%")
    print()
