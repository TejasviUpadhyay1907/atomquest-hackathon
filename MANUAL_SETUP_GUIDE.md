# 🛠️ MANUAL SETUP GUIDE - Everything You Need to Do!

## ⏰ Time Required: 30 minutes

---

## 📋 CHECKLIST - What You Need to Do

### Part 1: Get API Keys (15 minutes)
- [ ] OpenAI API Key (for AI suggestions)
- [ ] Resend API Key (for email notifications)
- [ ] PostgreSQL Database (local or Supabase)

### Part 2: Configure Environment Files (5 minutes)
- [ ] Update `backend/.env`
- [ ] Update `frontend/.env`

### Part 3: Install & Run (10 minutes)
- [ ] Install backend dependencies
- [ ] Setup database
- [ ] Seed demo data
- [ ] Run backend
- [ ] Install frontend dependencies
- [ ] Run frontend

---

## 🔑 PART 1: GET API KEYS (15 minutes)

### 1. OpenAI API Key (for AI Goal Suggestions)

**Step 1:** Go to https://platform.openai.com/signup
- Sign up with Google/Email
- Verify email

**Step 2:** Add payment method
- Go to https://platform.openai.com/account/billing
- Click "Add payment method"
- Add credit card (will charge ~$2 for entire hackathon)

**Step 3:** Create API Key
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Name it: "AtomQuest Hackathon"
- Copy the key (starts with `sk-...`)
- **SAVE IT!** You won't see it again

**Example Key:**
```
sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### 2. Resend API Key (for Email Notifications)

**Step 1:** Go to https://resend.com/signup
- Sign up with Google/Email
- Verify email

**Step 2:** Create API Key
- Go to https://resend.com/api-keys
- Click "Create API Key"
- Name it: "AtomQuest Hackathon"
- Copy the key (starts with `re_...`)

**Example Key:**
```
re_123abc456def789ghi012jkl345mno678pqr
```

**Note:** Free tier = 100 emails/day (enough for demo!)

---

### 3. PostgreSQL Database

**Option A: Local PostgreSQL (Recommended for Testing)**

**If you have PostgreSQL installed:**
```bash
# Open Command Prompt
createdb goal_tracking
```

**If you DON'T have PostgreSQL:**
- Download: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set!

**Database URL Format:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/goal_tracking
```

**Example:**
```
postgresql://postgres:mypassword123@localhost:5432/goal_tracking
```

---

**Option B: Supabase (Free Cloud Database)**

**Step 1:** Go to https://supabase.com/dashboard
- Sign up with GitHub/Google
- Click "New Project"

**Step 2:** Create Project
- Name: "goal-tracking"
- Database Password: (create a strong password)
- Region: Choose closest to you
- Click "Create new project"
- Wait 2 minutes for setup

**Step 3:** Get Connection String
- Go to Project Settings → Database
- Find "Connection string" → "URI"
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```
postgresql://postgres.abc123:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 📝 PART 2: CONFIGURE ENVIRONMENT FILES (5 minutes)

### Backend Environment File

**File:** `backend/.env`

**Open the file and update these values:**

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/goal_tracking

# Security (REQUIRED)
SECRET_KEY=your-super-secret-key-change-this-in-production-12345

# OpenAI (REQUIRED for AI suggestions)
OPENAI_API_KEY=sk-proj-YOUR-OPENAI-KEY-HERE

# Resend (OPTIONAL - for email notifications)
RESEND_API_KEY=re_YOUR-RESEND-KEY-HERE

# CORS (keep as is for local development)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Example with real values:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/goal_tracking
SECRET_KEY=atomquest-hackathon-2024-super-secret-key-xyz789
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
RESEND_API_KEY=re_123abc456def789ghi012jkl345mno678pqr
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

### Frontend Environment File

**File:** `frontend/.env`

**Open the file and update:**

```env
# Backend API URL (for local development)
VITE_API_URL=http://localhost:8000
```

**Keep as is for local testing!**

**For production (after deployment):**
```env
VITE_API_URL=https://your-backend-url.railway.app
```

---

## 🚀 PART 3: INSTALL & RUN (10 minutes)

### Step 1: Install Backend Dependencies (2 min)

**Open Command Prompt in project folder:**

```bash
cd backend
pip install -r requirements.txt
```

**Wait for installation to complete...**

---

### Step 2: Setup Database & Seed Data (2 min)

**Still in backend folder:**

```bash
# This will create all tables and add demo data
python seed_data.py
```

**You should see:**
```
✅ Created 1 admin
✅ Created 3 managers
✅ Created 15 employees
✅ Created 6 thrust areas
✅ Created sample goals
✅ Created sample check-ins
✅ Database seeded successfully!
```

---

### Step 3: Run Backend Server (1 min)

**Still in backend folder:**

```bash
uvicorn app.main:app --reload --port 8000
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**✅ Backend is running!**

**Test it:** Open browser → http://localhost:8000/docs
- You should see Swagger API documentation

**Keep this terminal open!**

---

### Step 4: Install Frontend Dependencies (3 min)

**Open a NEW Command Prompt:**

```bash
cd frontend
npm install
```

**Wait for installation...**

---

### Step 5: Run Frontend Server (1 min)

**Still in frontend folder:**

```bash
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is running!**

**Keep this terminal open too!**

---

### Step 6: Open Application (1 min)

**Open browser:** http://localhost:5173

**You should see the Login page!**

---

## 🧪 PART 4: TEST EVERYTHING (10 minutes)

### Test 1: Login as Employee

**Credentials:**
- Email: `emp1@demo.com`
- Password: `password123`

**Click "Login"**

**You should see:**
- Dashboard with sidebar
- "My Goals" page
- Navigation menu

---

### Test 2: Create Goal with AI

**On "My Goals" page:**

1. Click "Create Goal" button
2. Click "Get AI Suggestion" button (⚡ magic!)
3. **Wait 2-3 seconds...**
4. Form should auto-fill with AI-generated goal!
5. Select a thrust area
6. Click "Create"

**If AI doesn't work:**
- Check OpenAI API key in `backend/.env`
- Check you have credits in OpenAI account
- Check backend terminal for errors

**If AI works:**
- ✅ You'll see "Goal created successfully!"
- ✅ Goal appears in table

---

### Test 3: Submit Goals

1. Create 2-3 more goals (can use AI or manual)
2. Make sure total weightage = 100%
3. Click "Submit All" button
4. Confirm submission

**You should see:**
- ✅ "All goals submitted for approval!"
- Goals status changed to "Pending Approval"

---

### Test 4: Login as Manager

**Logout:**
- Click avatar (top right)
- Click "Logout"

**Login as Manager:**
- Email: `manager1@demo.com`
- Password: `password123`

**You should see:**
- "Pending Approvals" page
- emp1's goals waiting for approval

---

### Test 5: Approve Goals

1. Click edit icon on a goal
2. Change target value
3. Click save
4. Click approve icon
5. Or click "Approve All" button

**You should see:**
- ✅ "Goals approved successfully!"

---

### Test 6: Login as Admin

**Logout and login as:**
- Email: `admin@demo.com`
- Password: `password123`

**Navigate to:**
- "Admin → All Goals" - See all goals
- "Admin → Shared Goals" - Create shared goal
- "Admin → Audit Logs" - See all changes

---

### Test 7: Analytics Dashboard

**Click "Analytics" in sidebar**

**You should see:**
- 6 interactive charts
- Goal distribution
- Completion rates
- Progress trends

**If charts are empty:**
- Need more data (create more goals)
- Or use existing demo data

---

### Test 8: Notifications

**Click bell icon (top right)**

**You should see:**
- Notification count badge
- List of notifications
- "Mark All Read" button

---

## 🐛 TROUBLESHOOTING

### Backend won't start

**Error: "ModuleNotFoundError"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "Database connection failed"**
- Check PostgreSQL is running
- Check DATABASE_URL in `.env`
- Try: `psql -U postgres` to test connection

**Error: "Table doesn't exist"**
```bash
python seed_data.py
```

---

### Frontend won't start

**Error: "Cannot find module"**
```bash
cd frontend
npm install
```

**Error: "API connection failed"**
- Check backend is running on port 8000
- Check VITE_API_URL in `frontend/.env`
- Open http://localhost:8000/docs to verify backend

---

### AI Suggestions not working

**Error: "AI suggestions not available"**

**Check:**
1. OpenAI API key in `backend/.env`
2. API key is correct (starts with `sk-`)
3. You have credits in OpenAI account
4. Backend terminal for error messages

**Test API key:**
- Go to https://platform.openai.com/account/usage
- Check if you have credits

---

### Email Notifications not working

**This is OPTIONAL!**

**If you want emails:**
1. Add Resend API key to `backend/.env`
2. Restart backend server
3. Emails will be sent on goal submission, approval, etc.

**If you don't want emails:**
- Leave RESEND_API_KEY empty
- App will work fine without emails
- In-app notifications will still work!

---

## 📊 WHAT YOU SHOULD SEE

### Backend Terminal
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Frontend Terminal
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser
- Login page at http://localhost:5173
- API docs at http://localhost:8000/docs
- No console errors (press F12 to check)

---

## 🔗 IMPORTANT LINKS

### Local Development
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** localhost:5432 (if using local PostgreSQL)

### External Services
- **OpenAI Dashboard:** https://platform.openai.com/account/usage
- **Resend Dashboard:** https://resend.com/emails
- **Supabase Dashboard:** https://supabase.com/dashboard (if using Supabase)

### Documentation
- **Setup Guide:** `SETUP_GUIDE.md`
- **Final Checklist:** `FINAL_CHECKLIST.md`
- **Video Script:** `VIDEO_DEMO_SCRIPT.md`
- **Winning Strategy:** `WINNING_STRATEGY.md`

---

## 👥 DEMO CREDENTIALS

### Admin
- **Email:** admin@demo.com
- **Password:** password123
- **Can:** View all goals, create shared goals, unlock goals, view audit logs

### Managers
- **Email:** manager1@demo.com, manager2@demo.com, manager3@demo.com
- **Password:** password123
- **Can:** Approve goals, edit goals, add check-in comments

### Employees
- **Email:** emp1@demo.com, emp2@demo.com, ... emp15@demo.com
- **Password:** password123
- **Can:** Create goals, submit goals, add check-ins

---

## ✅ SUCCESS CHECKLIST

After setup, you should be able to:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Login page loads
- [ ] Can login as employee
- [ ] Can create goal with AI suggestion
- [ ] Can submit goals
- [ ] Can login as manager
- [ ] Can approve goals
- [ ] Can login as admin
- [ ] Can view all goals
- [ ] Analytics dashboard shows charts
- [ ] Notifications work
- [ ] No console errors

---

## 🎯 NEXT STEPS

Once everything is working:

1. **Test all features** (follow `FINAL_CHECKLIST.md`)
2. **Record video demo** (follow `VIDEO_DEMO_SCRIPT.md`)
3. **Deploy to production** (follow `WINNING_STRATEGY.md`)
4. **Submit!**

---

## 💪 YOU'VE GOT THIS!

**If you get stuck:**
1. Check the error message
2. Look in the Troubleshooting section
3. Check backend terminal for errors
4. Check browser console (F12) for errors
5. Make sure all API keys are correct

**Everything should work perfectly!** 🚀

**Time to test and win TOP 3!** 🏆

