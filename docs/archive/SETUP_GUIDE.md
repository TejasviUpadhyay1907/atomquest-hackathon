# 🚀 SETUP GUIDE - Get Running in 10 Minutes!

## Prerequisites

Before starting, make sure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running

---

## Quick Setup (10 minutes)

### Step 1: Install Backend Dependencies (2 min)

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Setup Database (3 min)

**Option A: Using PostgreSQL locally**
```bash
# Create database
createdb goal_tracking

# Update backend/.env if needed
# DATABASE_URL=postgresql://postgres:password@localhost:5432/goal_tracking
```

**Option B: Using Supabase (Free)**
1. Go to https://supabase.com
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in `backend/.env`

### Step 3: Seed Demo Data (1 min)

```bash
cd backend
python seed_data.py
```

This creates:
- 1 Admin: admin@demo.com / password123
- 3 Managers: manager1-3@demo.com / password123
- 15 Employees: emp1-15@demo.com / password123
- 6 Thrust Areas
- Sample goals and check-ins

### Step 4: Start Backend (1 min)

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
✅ API Docs at: http://localhost:8000/docs

### Step 5: Install Frontend Dependencies (2 min)

Open a NEW terminal:

```bash
cd frontend
npm install
```

### Step 6: Start Frontend (1 min)

```bash
cd frontend
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

## Test the Application (10 minutes)

### Test 1: Employee Flow (3 min)

1. Open http://localhost:3000
2. Login as: **emp1@demo.com / password123**
3. Go to "My Goals"
4. Click "Create Goal"
5. Click "Get AI Suggestion" (if OpenAI key is set)
6. Fill form and create goal
7. Create 2-3 more goals (total weightage = 100%)
8. Click "Submit All"
9. Go to "Check-ins"
10. Add a check-in for Q1

**Expected:** ✅ Goals created, submitted, check-in added

### Test 2: Manager Flow (3 min)

1. Logout (click avatar → Logout)
2. Login as: **manager1@demo.com / password123**
3. Go to "Manager → Pending Approvals"
4. See emp1's goals
5. Click edit icon, change target
6. Click approve icon
7. Click "Approve All" for the employee
8. Go to "Manager → Team Check-ins"
9. Select Q1
10. Click "Comment" and add feedback

**Expected:** ✅ Goals approved, comment added

### Test 3: Admin Flow (2 min)

1. Logout
2. Login as: **admin@demo.com / password123**
3. Go to "Admin → All Goals"
4. See all goals in system
5. Go to "Admin → Shared Goals"
6. Create a shared goal
7. Go to "Admin → Audit Logs"
8. See all changes logged

**Expected:** ✅ Admin functions working

### Test 4: Analytics & Notifications (2 min)

1. Click "Analytics" in sidebar
2. See 6 charts with data
3. Click bell icon (top right)
4. See notifications
5. Click "Mark All Read"

**Expected:** ✅ Charts showing, notifications working

---

## Troubleshooting

### Backend won't start

**Error: "ModuleNotFoundError"**
```bash
pip install -r requirements.txt
```

**Error: "Database connection failed"**
- Check PostgreSQL is running
- Check DATABASE_URL in .env
- Try: `psql -U postgres` to test connection

**Error: "Table doesn't exist"**
```bash
python seed_data.py
```

### Frontend won't start

**Error: "Cannot find module"**
```bash
npm install
```

**Error: "API connection failed"**
- Check backend is running on port 8000
- Check VITE_API_URL in frontend/.env

### No data showing

```bash
cd backend
python seed_data.py
```

---

## Optional: Enable AI & Email Features

### Enable AI Goal Suggestions

1. Get OpenAI API key from https://platform.openai.com
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart backend
4. Click "Get AI Suggestion" button in goal creation

### Enable Email Notifications

1. Get Resend API key from https://resend.com
2. Add to `backend/.env`:
   ```
   RESEND_API_KEY=re_your-key-here
   ```
3. Restart backend
4. Emails will be sent on goal submission, approval, etc.

---

## Deployment (Optional)

### Deploy Backend to Railway

1. Push code to GitHub
2. Go to https://railway.app
3. "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables:
   - DATABASE_URL (Railway provides PostgreSQL)
   - SECRET_KEY
   - OPENAI_API_KEY (optional)
   - RESEND_API_KEY (optional)
6. Deploy!

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. "New Project" → Import from GitHub
3. Select your repository
4. Set root directory: `frontend`
5. Add environment variable:
   - VITE_API_URL=https://your-backend-url.railway.app
6. Deploy!

---

## Quick Commands Reference

### Backend
```bash
# Install
cd backend && pip install -r requirements.txt

# Seed data
python seed_data.py

# Run
uvicorn app.main:app --reload --port 8000

# API Docs
http://localhost:8000/docs
```

### Frontend
```bash
# Install
cd frontend && npm install

# Run
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Manager 1 | manager1@demo.com | password123 |
| Manager 2 | manager2@demo.com | password123 |
| Manager 3 | manager3@demo.com | password123 |
| Employee 1 | emp1@demo.com | password123 |
| Employee 2 | emp2@demo.com | password123 |
| Employee 3-15 | emp3-15@demo.com | password123 |

---

## Need Help?

Check these files:
- `README.md` - Main project overview
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
- `FINAL_STATUS.md` - Complete feature list

---

**🎉 You're Ready to Win Top 10!** 🏆
