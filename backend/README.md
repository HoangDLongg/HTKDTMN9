# Django Backend - Agricultural Supply Chain Management

Django backend for the Agricultural Supply Chain Management System with AI forecasting and chatbot support.

## 📁 Project Structure

```
backend/
├── manage.py                   # Django management script
├── config/                     # Project settings
│   ├── settings.py            # Main configuration
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI config
│   └── asgi.py                # ASGI config
├── apps/                       # Django applications
│   ├── core/                  # Users, Roles, Authentication
│   ├── locations/             # Provinces, Districts, Wards
│   ├── crops/                 # Crops, Technical Processes
│   ├── farms/                 # Cooperatives, Farmers, Farms
│   ├── seasons/               # Seasons, Daily Tasks, Logs
│   ├── market/                # Market Prices, Forecasts
│   └── chatbot/               # Chat Logs, FAQs, Alerts
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── .gitignore                # Git ignore rules
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_NAME=agri_supply_chain
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Database Setup

Make sure PostgreSQL is running and the database exists:

```bash
# Database should already exist from FULL_SETUP.sql
# If not, create it:
createdb agri_supply_chain
psql -d agri_supply_chain -f ../database/FULL_SETUP.sql
```

### 4. Run Migrations

```bash
# Fake initial migrations since tables already exist
python manage.py migrate --fake-initial
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

Visit: http://localhost:8000/admin

## 📦 Installed Apps

- **Django 6.0.1** - Web framework
- **Django REST Framework** - API development
- **psycopg2** - PostgreSQL adapter
- **django-cors-headers** - CORS support
- **drf-spectacular** - API documentation
- **django-filter** - Filtering support
- **pytest-django** - Testing framework

## 🔧 Next Steps

1. Generate models from existing database using `inspectdb`
2. Configure Django Admin for each app
3. Create REST API endpoints
4. Add authentication and permissions
5. Write tests

## 📚 Documentation

- [Main Project README](../README.md)
- [Database Documentation](../database/README.md)
- [API Documentation](http://localhost:8000/api/schema/swagger-ui/) (after running server)

---

**Status:** ✅ Project structure created  
**Next:** Generate models from database
