# 🚀 QUICK TEST REFERENCE CARD

## 📋 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | emp1@demo.com | password123 |
| Manager | manager1@demo.com | password123 |
| Admin | admin@demo.com | password123 |

---

## ✅ QUICK TEST CHECKLIST (10 Minutes)

### 1. Employee (5 min)
- [ ] Login as emp1@demo.com
- [ ] View goals (should see 3-4 goals)
- [ ] Click "+ Create Goal" - try to add 20% weightage
- [ ] Should FAIL with "exceeds 100%" ✅ Validation works!
- [ ] View Check-ins (should see 3 check-ins)
- [ ] View Analytics (should see 4 charts)
- [ ] Click bell icon (notifications)

### 2. Manager (3 min)
- [ ] Logout, login as manager1@demo.com
- [ ] View Pending Approvals
- [ ] If any pending, click "Approve"
- [ ] View Team Check-ins

### 3. Admin (2 min)
- [ ] Logout, login as admin@demo.com
- [ ] View All Goals (should see 9+ goals)
- [ ] View System Stats (20 users, 9+ goals)
- [ ] View Analytics

---

## 📝 Sample Test Data

### Create Goal (Employee)
```
Title: Improve Customer Satisfaction
Description: Increase CSAT scores through better service
Thrust Area: Revenue Growth
UoM Type: Percentage
Target: 90
Weightage: 25
```

### Update Check-in (Employee)
```
Actual Achievement: 35
Manager Comment: Great progress!
Status: On Track
```

### Reject Goal (Manager)
```
Rejection Reason: Please make the target more specific and measurable.
```

### Create Shared Goal (Admin)
```
Title: Company Revenue Target
Description: Achieve 20% growth
Thrust Area: Revenue Growth
UoM Type: Percentage
Target: 120
Primary Owner: emp1
Recipients: emp2, emp3, emp4
```

---

## 🎯 Key Features to Test

### Must Test:
1. ✅ Login (all 3 roles)
2. ✅ View goals
3. ✅ Create goal (validation should fail if >100%)
4. ✅ Manager approve goal
5. ✅ Analytics dashboard
6. ✅ Check-ins

### Nice to Test:
7. Edit goal
8. Submit for approval
9. Notifications
10. AI suggestions
11. Admin view all goals
12. Audit logs

---

## 🐛 Expected "Failures" (These are GOOD!)

### 1. Create Goal with Too Much Weightage
**Try**: Add goal with 20% when already at 120%
**Result**: ❌ Error: "Total weightage would be 140%"
**Status**: ✅ **CORRECT** - Validation working!

### 2. Edit Locked Goal
**Try**: Edit a goal that's been approved
**Result**: ❌ Can't edit (locked)
**Status**: ✅ **CORRECT** - Locking working!

### 3. Access Manager Page as Employee
**Try**: Go to /manager/approvals as employee
**Result**: ❌ Access denied
**Status**: ✅ **CORRECT** - RBAC working!

---

## 📊 What You Should See

### Employee Dashboard
- 3-4 goals with progress bars
- Total weightage: 120%
- Green/red status indicators
- Create Goal button

### Manager Dashboard
- Pending approvals (if any)
- Team goals list
- Approve/Reject buttons
- Team check-ins

### Admin Dashboard
- All 9+ goals from all users
- 20 users total
- System-wide statistics
- Analytics charts

---

## 🎬 For Demo Video (5 min)

**Show in this order:**
1. Login as Employee (30 sec)
2. View goals, try to create one (1 min)
3. Show validation error (30 sec)
4. View analytics dashboard (30 sec)
5. Login as Manager, approve goal (1 min)
6. Login as Admin, view all goals (1 min)
7. Show AI suggestions if working (30 sec)
8. Conclusion (30 sec)

---

## 🏆 Success Criteria

✅ Can login as all 3 roles
✅ Can view goals
✅ Validation prevents >100% weightage
✅ Manager can approve goals
✅ Analytics show charts
✅ Check-ins display correctly
✅ No console errors (F12)

---

**Full Guide**: See `MANUAL_TESTING_GUIDE.md` (35 detailed test cases)

**Time**: 10 minutes quick test OR 40 minutes full test
