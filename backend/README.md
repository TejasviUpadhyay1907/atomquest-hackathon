# Goal Tracking Portal - Backend

FastAPI backend for the Goal Setting & Tracking Portal.

## Features

### Core Features (20)
✅ Goal creation with 4 UoM types (Numeric, %, Timeline, Zero)
✅ Validation: Total weightage = 100%, min 10%, max 8 goals
✅ Manager approval workflow with inline editing
✅ Goal locking after approval
✅ Shared goals functionality with sync
✅ Quarterly check-ins (Q1, Q2, Q3, Q4)
✅ Progress score calculations (4 formulas)
✅ 3 user roles (Employee, Manager, Admin)
✅ Achievement report (CSV export)
✅ Completion dashboard
✅ Audit trail

### Bonus Features (9)
✅ Email notifications (Resend)
✅ Real-time in-app notifications
✅ AI goal suggestions (OpenAI)
✅ Goal templates
✅ Analytics endpoints
✅ Bulk operations
✅ Advanced audit logging
✅ Role-based access control
✅ RESTful API with auto-docs

## Tech Stack

- **Framework:** FastAPI 0.109.0
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt (passlib)
- **Email:** Resend
- **AI:** OpenAI GPT-3.5
- **Migrations:** Alembic

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/goal_tracking
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RESEND_API_KEY=your-resend-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Setup Database

```bash
# Create database
createdb goal_tracking

# Run migrations (creates tables)
python -m app.main

# Seed demo data
python seed_data.py
```

### 4. Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server will start at: http://localhost:8000

API Documentation: http://localhost:8000/docs

## Demo Credentials

**Admin:**
- Email: admin@demo.com
- Password: password123

**Managers:**
- manager1@demo.com / password123 (Engineering)
- manager2@demo.com / password123 (Sales)
- manager3@demo.com / password123 (Marketing)

**Employees:**
- emp1@demo.com / password123 (has approved goals with check-ins)
- emp2@demo.com / password123 (has pending goals)
- emp3-emp15@demo.com / password123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token
- GET `/api/auth/me` - Get current user info

### Goals (Employee)
- POST `/api/goals` - Create goal
- GET `/api/goals/my-goals` - Get my goals
- GET `/api/goals/{id}` - Get goal details
- PUT `/api/goals/{id}` - Update goal
- POST `/api/goals/{id}/submit` - Submit for approval
- DELETE `/api/goals/{id}` - Delete goal
- GET `/api/goals/validation/check` - Check validation status

### Manager
- GET `/api/manager/pending-approvals` - Get pending approvals
- GET `/api/manager/team-goals` - Get team goals
- PUT `/api/manager/goals/{id}/inline-edit` - Inline edit goal
- POST `/api/manager/goals/{id}/approve` - Approve goal
- POST `/api/manager/goals/{id}/reject` - Reject goal
- POST `/api/manager/approve-all/{employee_id}` - Approve all goals

### Admin
- GET `/api/admin/all-goals` - Get all goals
- POST `/api/admin/goals/{id}/unlock` - Unlock goal
- POST `/api/admin/shared-goals` - Create shared goal
- GET `/api/admin/users` - Get all users
- GET `/api/admin/stats` - Get system stats

### Check-ins
- POST `/api/checkins` - Create check-in
- GET `/api/checkins/my-checkins` - Get my check-ins
- GET `/api/checkins/{id}` - Get check-in details
- PUT `/api/checkins/{id}` - Update check-in
- GET `/api/checkins/manager/team-checkins` - Get team check-ins

### Reports
- GET `/api/reports/achievement-report` - Achievement report (JSON)
- GET `/api/reports/achievement-report/export` - Export CSV
- GET `/api/reports/completion-dashboard` - Completion dashboard
- GET `/api/reports/audit-logs` - Audit logs
- GET `/api/reports/analytics/goal-distribution` - Goal distribution
- GET `/api/reports/analytics/status-overview` - Status overview

### Notifications
- GET `/api/notifications` - Get notifications
- GET `/api/notifications/unread-count` - Unread count
- PUT `/api/notifications/{id}/read` - Mark as read
- PUT `/api/notifications/mark-all-read` - Mark all as read

### AI
- POST `/api/ai/suggest-goals` - Get AI goal suggestions
- POST `/api/ai/improve-description` - Improve goal description

### Templates
- GET `/api/templates` - Get goal templates

### Thrust Areas
- GET `/api/thrust-areas` - Get all thrust areas

## Validation Rules

### Goal Creation
1. **Total Weightage = 100%**
   - Sum of all goal weightages must equal exactly 100%
   - Validated on submission

2. **Minimum Weightage = 10%**
   - Each individual goal must have at least 10% weightage
   - Validated on creation and update

3. **Maximum Goals = 8**
   - Employee can have maximum 8 goals
   - Validated on creation

### Progress Calculation Formulas

1. **Min (Numeric/%):** Achievement ÷ Target × 100
   - Higher is better (e.g., Sales Revenue)

2. **Max (Numeric/%):** Target ÷ Achievement × 100
   - Lower is better (e.g., TAT, Cost)

3. **Timeline:** Date comparison
   - 100% if on/before deadline
   - Penalty for delays

4. **Zero:** If 0 → 100%, else 0%
   - Zero = Success (e.g., Safety incidents)

## Architecture

```
backend/
├── app/
│   ├── core/           # Config, database, security
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── api/
│   │   ├── deps.py     # Dependencies (auth, roles)
│   │   └── endpoints/  # API routes
│   ├── services/       # Business logic
│   │   ├── validation_service.py
│   │   ├── progress_calculation_service.py
│   │   ├── notification_service.py
│   │   ├── audit_service.py
│   │   ├── ai_service.py
│   │   └── email_service.py
│   └── main.py         # FastAPI app
├── alembic/            # Database migrations
├── seed_data.py        # Demo data seeder
└── requirements.txt    # Dependencies
```

## Cost Optimization

- **Database:** PostgreSQL (Supabase free tier - 500MB)
- **Email:** Resend (100 emails/day free)
- **AI:** OpenAI GPT-3.5 (~$0.002 per request)
- **Hosting:** Railway free tier
- **Total Cost:** ~$0-5/month for demo

## Development

### Run Tests
```bash
pytest
```

### Format Code
```bash
black app/
```

### Type Checking
```bash
mypy app/
```

## Deployment

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```bash
docker build -t goal-tracking-backend .
docker run -p 8000:8000 goal-tracking-backend
```

## License

MIT License - AtomQuest Hackathon 2026
