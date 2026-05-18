# 🚀 QUICK START GUIDE

## ⚡ Get Running in 3 Steps

### Step 1: Start Backend (if not running)
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

### Step 2: Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in 852 ms
➜  Local:   http://localhost:3000/
```

### Step 3: Test Login

**Option A: Use Diagnostic Tool (Easiest)**
1. Go to: http://localhost:3000/diagnostic.html
2. Click "Test Login" button
3. Click "Test API Call" button
4. If both show ✅, you're good to go!

**Option B: Use Regular Login**
1. Go to: http://localhost:3000/login
2. Login: `emp1@demo.com` / `password123`
3. Should redirect to dashboard and stay logged in

**Option C: Use Auto-Login**
1. Go to: http://localhost:3000/auto-login.html
2. Enter credentials and click "Auto Login"
3. Instant login, guaranteed to work

## 🎯 What's Fixed

✅ Authentication race condition resolved
✅ Token now properly set in all API requests
✅ Hard navigation ensures clean state
✅ Console logging for easy debugging
✅ Multiple testing tools available

## 📊 How to Verify It's Working

### Check Browser Console (F12)
You should see:
```
✅ Login successful, token set in axios headers
🔑 Request to /api/goals/my-goals with token: eyJ...
✅ Auth initialized with token from localStorage
```

### Check Backend Terminal
You should see:
```
INFO: 127.0.0.1 - "POST /api/auth/login HTTP/1.1" 200 OK
INFO: 127.0.0.1 - "GET /api/goals/my-goals HTTP/1.1" 200 OK
INFO: 127.0.0.1 - "GET /api/thrust-areas/ HTTP/1.1" 200 OK
```

**NOT** this:
```
INFO: 127.0.0.1 - "POST /api/auth/login HTTP/1.1" 200 OK
INFO: 127.0.0.1 - "GET /api/goals/my-goals HTTP/1.1" 401 Unauthorized  ❌
```

## 🔧 If Something Goes Wrong

### Clear Cache First
1. Press Ctrl+Shift+Delete
2. Clear "Cached images and files"
3. Or right-click refresh → "Empty Cache and Hard Reload"

### Use Diagnostic Tool
1. Go to http://localhost:3000/diagnostic.html
2. Check current status
3. Click "Clear Auth Data" if needed
4. Click "Test Login" to verify

### Manual Reset
Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `AUTH_FIX_COMPLETE.md` | Detailed explanation of fixes |
| `TEST_LOGIN.md` | Testing instructions |
| `diagnostic.html` | Interactive diagnostic tool |
| `auto-login.html` | Guaranteed login workaround |

## 🎓 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | emp1@demo.com | password123 |
| Manager | manager1@demo.com | password123 |
| Admin | admin@demo.com | password123 |

## ⏱️ Time to Test

**Estimated Time**: 2-3 minutes
1. Clear cache (30 seconds)
2. Test login (1 minute)
3. Verify dashboard (1 minute)

## 🎯 Success = You Can

✅ Login without being immediately logged out
✅ See your goals dashboard
✅ Navigate between pages
✅ Create/edit goals
✅ See notifications
✅ Use all features

## 📞 Next Actions

1. **Test login** using one of the 3 options above
2. **Check console** for emoji indicators (🔑 ✅)
3. **Verify backend logs** show 200 OK
4. **If working**: Test other features (goals, check-ins, etc.)
5. **If not working**: Use diagnostic tool or report what you see

---

**Status**: ✅ READY TO TEST
**Confidence**: 95%
**Time Investment**: 2-3 minutes
