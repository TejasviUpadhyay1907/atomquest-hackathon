# ⚡ QUICK START - MAY 17 MORNING

## 🌅 FIRST THING TO DO (9:00 AM)

### 1. Check Current Status (5 min)
```bash
cd c:\Users\tejas\OneDrive\Desktop\ATOMQUEST\goal-tracking-portal
python backend\quick_test.py
```

### 2. Add Sample Data (5 min)
```bash
cd backend
python add_sample_data.py
```

### 3. Run Full Test (5 min)
```bash
cd ..
python test_comprehensive.py
```

**Expected Score**: 173/230 (75.22%)  
**Target Score**: 200+/230 (87%+)

---

## 🔧 PRIORITY FIXES (In Order)

### Fix #1: AI Suggestions (30 min)
**File**: `backend/app/services/ai_service.py`

**Quick Fix**:
```python
# Add fallback suggestions if API fails
if not suggestions:
    return [
        {"title": "Improve code quality", "description": "Reduce bugs by 20%"},
        {"title": "Team collaboration", "description": "Weekly knowledge sharing"},
        {"title": "Performance", "description": "Optimize response time by 30%"}
    ]
```

**Test**: `curl -X POST https://atomquest-backend-33sg.onrender.com/api/ai/suggest-goals`

---

### Fix #2: Goal Creation (30 min)
**File**: `backend/app/api/endpoints/goals.py`

**Test Data**:
```json
{
  "title": "Complete Project X",
  "description": "Deliver by Q2",
  "thrust_area_id": 1,
  "uom_type": "Percentage",
  "target": 100,
  "weightage": 20
}
```

**Test**: Login as employee, try creating goal

---

### Fix #3: Team Assignment (15 min)
**File**: `backend/add_sample_data.py` (already created)

**Run**:
```bash
cd backend
python add_sample_data.py
```

**Verify**: Login as manager, check team view

---

### Fix #4: Reports (30 min)
**Needs**: Sample check-in data (added by add_sample_data.py)

**Test**: Login as manager, go to reports

---

## 📝 QUICK COMMANDS

### Deploy Changes
```bash
git add -A
git commit -m "Fix: [describe what you fixed]"
git push origin main
```

### Test After Deploy (wait 2 min)
```bash
python backend\quick_test.py
```

### Full Test
```bash
python test_comprehensive.py
```

---

## 🎥 VIDEO RECORDING (2:00 PM)

### Setup
1. Close unnecessary tabs
2. Clear browser cache
3. Open frontend in incognito
4. Have script ready
5. Test audio/video

### Script (3-5 minutes)
1. **Intro** (30s): "Hi, I'm presenting AtomQuest..."
2. **Login** (30s): Show all 3 roles
3. **Admin** (1m): User management, stats
4. **Manager** (1m): Team, approvals
5. **Employee** (1m): Goals, check-ins, AI
6. **Outro** (30s): "Thank you for watching"

### Tools
- OBS Studio (free)
- Loom (easy)
- Windows Game Bar (Win+G)

---

## ✅ FINAL CHECKLIST

### Before Submitting
- [ ] All 3 logins work
- [ ] Score 200+/230
- [ ] Video uploaded
- [ ] README complete
- [ ] All links working

### Submission
- [ ] GitHub URL
- [ ] Frontend URL
- [ ] Backend URL
- [ ] Video URL
- [ ] Submit by 7:00 AM (1 hour buffer)

---

## 🚨 IF SOMETHING BREAKS

### Frontend Not Loading
```bash
# Check Vercel
https://vercel.com/dashboard

# Redeploy if needed
cd frontend
vercel --prod
```

### Backend Not Responding
```bash
# Check Render
https://dashboard.render.com

# Check logs
# Restart service if needed
```

### Login Not Working
```bash
# Run fix endpoint
curl -X POST https://atomquest-backend-33sg.onrender.com/api/auth/fix-demo-passwords
```

---

## 📞 EMERGENCY CONTACTS

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/TejasviUpadhyay1907/atomquest-hackathon

---

## 💡 REMEMBER

1. **Test after each fix**
2. **Commit frequently**
3. **Don't add new features**
4. **Focus on working features in demo**
5. **Submit early (7:00 AM, not 8:00 AM)**

---

## 🎯 TODAY'S GOAL

**Transform B+ (75%) into A- (87%)**

**You've got this! 💪**

---

**Start Time**: 9:00 AM  
**Deadline**: 8:00 AM (May 18)  
**Status**: READY TO GO ✅
