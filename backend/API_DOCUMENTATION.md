# API Documentation - Agricultural Supply Chain Management System

## Overview

RESTful API for managing agricultural supply chain with AI forecasting and chatbot support.

**Base URL**: `http://127.0.0.1:8000/api/`

**Documentation**:
- Swagger UI: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/
- OpenAPI Schema: http://127.0.0.1:8000/api/schema/

## Authentication

Currently using `IsAuthenticatedOrReadOnly` permission class:
- **GET requests**: Public access
- **POST/PUT/PATCH/DELETE**: Requires authentication

## Core Endpoints

### Roles
- `GET /api/roles/` - List all roles
- `POST /api/roles/` - Create new role
- `GET /api/roles/{id}/` - Get role details
- `PUT /api/roles/{id}/` - Update role
- `DELETE /api/roles/{id}/` - Delete role

### Users
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `GET /api/users/me/` - Get current user info
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## Location Endpoints

### Provinces
- `GET /api/provinces/` - List 63 provinces
- `GET /api/provinces/{id}/` - Get province details

### Districts
- `GET /api/districts/` - List districts
- `GET /api/districts/?province={id}` - Filter by province

### Wards
- `GET /api/wards/` - List wards
- `GET /api/wards/?district={id}` - Filter by district

## Crop Management

### Crops
- `GET /api/crops/` - List all crops
- `POST /api/crops/` - Create new crop
- `GET /api/crops/{id}/` - Get crop details

### Technical Processes
- `GET /api/technical-processes/` - List processes
- `POST /api/technical-processes/` - Create process
- `GET /api/technical-processes/{id}/` - Get process details

### Process Stages
- `GET /api/process-stages/` - List stages
- `GET /api/process-stages/?process={id}` - Filter by process

### Stage Tasks
- `GET /api/stage-tasks/` - List tasks
- `GET /api/stage-tasks/?stage={id}` - Filter by stage

## Farm Management

### Cooperatives
- `GET /api/cooperatives/` - List cooperatives
- `POST /api/cooperatives/` - Create cooperative
- `GET /api/cooperatives/{id}/` - Get details

### Farmers
- `GET /api/farmers/` - List farmers
- `POST /api/farmers/` - Create farmer
- `GET /api/farmers/{id}/` - Get farmer details

### Farms
- `GET /api/farms/` - List farms
- `POST /api/farms/` - Create farm
- `GET /api/farms/{id}/` - Get farm details

## Season Management (Business Logic)

### Seasons

**Standard CRUD**:
- `GET /api/seasons/` - List seasons
- `GET /api/seasons/{id}/` - Get season details
- `PUT /api/seasons/{id}/` - Update season
- `DELETE /api/seasons/{id}/` - Delete season

**Custom Endpoints**:

#### Create Season with Timeline
```http
POST /api/seasons/create_with_timeline/
Content-Type: application/json

{
  "farm_id": 1,
  "crop_id": 3,
  "process_id": 1,
  "start_date": "2026-02-01",
  "area_planted": 2.5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Season created with timeline",
  "data": {
    "id": 1,
    "season_code": "SS-1-CT001-20260201",
    "farm": 1,
    "crop": 3,
    "process": 1,
    "start_date": "2026-02-01",
    "expected_harvest_date": "2026-05-02",
    "area_planted": 2.5,
    "status": "planned"
  }
}
```

#### Get Season Progress
```http
GET /api/seasons/1/progress/
```

**Response**:
```json
{
  "season_code": "SS-1-CT001-20260201",
  "status": "in_progress",
  "total_tasks": 45,
  "completed_tasks": 23,
  "progress_percentage": 51.11,
  "upcoming_tasks_count": 5,
  "overdue_tasks_count": 2,
  "days_until_harvest": 85
}
```

#### Update Season Status
```http
POST /api/seasons/1/update_status/
Content-Type: application/json

{
  "status": "in_progress"
}
```

Valid status transitions:
- `planned` → `in_progress`
- `in_progress` → `harvesting`
- `harvesting` → `completed`

### Daily Tasks

**Standard CRUD**:
- `GET /api/daily-tasks/` - List tasks
- `GET /api/daily-tasks/{id}/` - Get task details
- `PUT /api/daily-tasks/{id}/` - Update task

**Custom Endpoints**:

#### Complete Task
```http
POST /api/daily-tasks/1/complete/
Content-Type: application/json

{
  "completed_by_id": 1
}
```

### Farming Logs
- `GET /api/farming-logs/` - List logs
- `POST /api/farming-logs/` - Create log
- `GET /api/farming-logs/{id}/` - Get log details

## Market Analysis (Business Logic)

### Market Prices

**Standard CRUD**:
- `GET /api/market-prices/` - List prices
- `POST /api/market-prices/` - Add price
- `GET /api/market-prices/{id}/` - Get price details

**Custom Endpoints**:

#### Get Current Price
```http
GET /api/market-prices/current_price/?crop_id=3&market_location=Chợ Bình Điền
```

**Response**:
```json
{
  "id": 123,
  "crop": 3,
  "price_date": "2026-01-12",
  "price_min": 15000,
  "price_max": 18000,
  "price_avg": 16500,
  "market_location": "Chợ Bình Điền",
  "source": 1
}
```

#### Get Price Trend
```http
GET /api/market-prices/trend/?crop_id=3&days=30&market_location=Chợ Bình Điền
```

**Response**:
```json
{
  "crop_id": 3,
  "period_days": 30,
  "data_points": 28,
  "average_price": 16200.50,
  "min_price": 14500.00,
  "max_price": 18500.00,
  "trend": "increasing",
  "price_change_percent": 8.5
}
```

Trend values: `increasing`, `decreasing`, `stable`

#### Compare Market Prices
```http
GET /api/market-prices/compare_markets/?crop_id=3&date=2026-01-12
```

**Response**:
```json
[
  {
    "market_location": "Chợ Bình Điền",
    "price_min": 15000,
    "price_max": 18000,
    "price_avg": 16500,
    "source": "Sở NN&PTNT"
  },
  {
    "market_location": "Chợ Hóc Môn",
    "price_min": 14500,
    "price_max": 17500,
    "price_avg": 16000,
    "source": "Sở NN&PTNT"
  }
]
```

### Demand Forecasts

**Standard CRUD**:
- `GET /api/demand-forecasts/` - List forecasts
- `POST /api/demand-forecasts/` - Create forecast
- `GET /api/demand-forecasts/{id}/` - Get forecast details

**Custom Endpoints**:

#### Get Forecast
```http
GET /api/demand-forecasts/get_forecast/?crop_id=3&months=3
```

**Response**:
```json
[
  {
    "forecast_month": "2026-02-01",
    "predicted_demand": 1500.5,
    "predicted_price": 17500.00,
    "confidence_score": 0.85,
    "forecast_date": "2026-01-12"
  },
  {
    "forecast_month": "2026-03-01",
    "predicted_demand": 1650.0,
    "predicted_price": 18200.00,
    "confidence_score": 0.82,
    "forecast_date": "2026-01-12"
  }
]
```

### Planting Recommendations

**Standard CRUD**:
- `GET /api/planting-recommendations/` - List recommendations
- `POST /api/planting-recommendations/` - Create recommendation
- `GET /api/planting-recommendations/{id}/` - Get details

**Custom Endpoints**:

#### Get Best Selling Time
```http
GET /api/planting-recommendations/best_selling_time/?crop_id=3&harvest_date=2026-05-01
```

**Response**:
```json
{
  "recommendation": "optimal_time",
  "best_month": "2026-06-01",
  "predicted_price": 19500.00,
  "confidence": 0.88,
  "message": "Nên bán vào tháng 06/2026 với giá dự kiến 19,500 VNĐ/kg"
}
```

## Chatbot Endpoints

### Chat Logs
- `GET /api/chat-logs/` - List chat history
- `POST /api/chat-logs/` - Log chat
- `GET /api/chat-logs/{id}/` - Get chat details

### FAQs
- `GET /api/faqs/` - List FAQs
- `POST /api/faqs/` - Create FAQ
- `GET /api/faqs/{id}/` - Get FAQ details

### Alerts
- `GET /api/alerts/` - List alerts
- `POST /api/alerts/` - Create alert
- `GET /api/alerts/{id}/` - Get alert details

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/` - Create notification
- `GET /api/notifications/{id}/` - Get notification details

## Filtering, Searching & Ordering

All list endpoints support:

**Filtering**:
```http
GET /api/seasons/?status=in_progress&crop=3
```

**Searching**:
```http
GET /api/farmers/?search=Nguyen
```

**Ordering**:
```http
GET /api/market-prices/?ordering=-price_date
```

Use `-` prefix for descending order.

**Pagination**:
```http
GET /api/crops/?page=2&page_size=20
```

Default page size: 20

## Error Responses

**400 Bad Request**:
```json
{
  "error": "Invalid input data"
}
```

**404 Not Found**:
```json
{
  "detail": "Not found."
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

## Versioning

Current version: v1 (no versioning in URL yet)

---

**Last Updated**: 2026-01-12  
**API Version**: 1.0.0
