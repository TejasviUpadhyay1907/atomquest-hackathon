# 📋 COMPLETE MANUAL TESTING GUIDE
## Goal Tracking Portal - Test Cases & Data

**Use this guide to test EVERY feature manually in the UI**

---

## 🎯 TEST SETUP

### Test Accounts

| Role | Email | Password | Use For |
|------|-------|----------|---------|
| Employee | emp1@demo.com | password123 | Creating goals, check-ins |
| Employee | emp2@demo.com | password123 | Testing multiple employees |
| Manager | manager1@demo.com | password123 | Approving goals, team view |
| Admin | admin@demo.com | password123 | System-wide access |

---

## 👤 EMPLOYEE TESTING (emp1@demo.com)

### TEST 1: Login
**Steps:**
1. Go to http://localhost:3000/login
2. Enter email: `emp1@demo.com`
3. Enter password: `password123`
4. Click "Sign In"

**Expected Result:**
- ✅ Success message: "Welcome back, Alice Engineer!"
- ✅ Redirected to /employee/goals
- ✅ See dashboard with existing goals

---

### TEST 2: View My Goals
**Steps:**
1. Already on /employee/goals after login
2. Check the goals table

**Expected Result:**
- ✅ See 3-4 existing goals
- ✅ See columns: Title, UoM Type, Target, Weightage, Status, Actions
- ✅ See total weightage at top (should be 120%)
- ✅ See progress bar showing weightage

**Test Data Visible:**
```
Goal 1: "Reduce Bug Count by 50%"
- UoM Type: Percentage
- Target: 50
- Weightage: 30%
- Status: Approved

Goal 2: "Implement AI Feature"
- UoM Type: Timeline
- Target: 2024-12-31
- Weightage: 40%
- Status: Approved

Goal 3: "Improve Test Coverage"
- UoM Type: Percentage
- Target: 80
- Weightage: 30%
- Status: Approved
```

---

### TEST 3: Create New Goal (Valid - Will Fail Due to Weightage)
**Steps:**
1. Click "+ Create Goal" button
2. Fill in the form:

**Test Data:**
```
Title: Improve Code Quality
Description: Reduce technical debt and improve code maintainability
Thrust Area: Quality Improvement (select from dropdown)
UoM Type: Percentage (select from dropdown)
Target: 85
Weightage: 15
```

3. Click "Save as Draft"

**Expected Result:**
- ❌ Error: "Total weightage would be 135%. Maximum allowed is 100%. Please reduce by 35%."
- ✅ This proves validation is working!

---

### TEST 4: Create New Goal (Valid - After Deleting One)
**Steps:**
1. First, delete one of your existing goals (click trash icon)
2. Confirm deletion
3. Now click "+ Create Goal" again
4. Fill in the form:

**Test Data:**
```
Title: Customer Satisfaction Improvement
Description: Increase customer satisfaction scores through better service
Thrust Area: Revenue Growth (select from dropdown)
UoM Type: Percentage
Target: 90
Weightage: 25
```

5. Click "Save as Draft"

**Expected Result:**
- ✅ Success message: "Goal created successfully"
- ✅ New goal appears in the list
- ✅ Status: Draft
- ✅ Can see Edit and Delete buttons

---

### TEST 5: Edit Draft Goal
**Steps:**
1. Find the goal you just created
2. Click "Edit" button (pencil icon)
3. Modify the data:

**Modified Test Data:**
```
Title: Customer Satisfaction Excellence
Description: Achieve excellence in customer satisfaction through improved processes
Target: 95 (changed from 90)
Weightage: 30 (changed from 25)
```

4. Click "Update Goal"

**Expected Result:**
- ✅ Success message: "Goal updated successfully"
- ✅ Changes reflected in the table
- ✅ Still in Draft status

---

### TEST 6: Submit Goal for Approval
**Steps:**
1. Find your draft goal
2. Click "Submit for Approval" button

**Expected Result:**
- ✅ Success message: "Goal submitted for approval"
- ✅ Status changes to "Pending Approval"
- ✅ Goal is now locked (can't edit)
- ✅ Lock icon appears

---

### TEST 7: Try to Edit Locked Goal (Should Fail)
**Steps:**
1. Try to click on the submitted goal

**Expected Result:**
- ✅ Edit button is disabled or not visible
- ✅ Goal is locked and can't be modified
- ✅ This proves locking mechanism works!

---

### TEST 8: View Check-ins
**Steps:**
1. Click "Check-ins" in left menu
2. Select "Q1 (July)" from dropdown

**Expected Result:**
- ✅ See check-ins table
- ✅ See columns: Goal, Quarter, Planned Target, Actual Achievement, Progress, Status
- ✅ See 3 existing check-ins
- ✅ See progress bars (red = behind target)

**Test Data Visible:**
```
Check-in 1: "Reduce Bug Count by 50%"
- Quarter: Q1
- Planned: 50
- Actual: 25
- Progress: 50% (red bar)
- Status: On Track

Check-in 2: "Implement AI Feature"
- Quarter: Q1
- Planned: 2024-12-31
- Actual: 2024-06-30
- Progress: Behind
- Status: On Track

Check-in 3: "Improve Test Coverage"
- Quarter: Q1
- Planned: 80
- Actual: 25
- Progress: 31% (red bar)
- Status: On Track
```

---

### TEST 9: Update Check-in
**Steps:**
1. Click "Update" button on any check-in
2. Fill in the modal:

**Test Data:**
```
Actual Achievement: 35 (increased from 25)
Manager Comment: Great progress this quarter!
Status: On Track (select from dropdown)
```

3. Click "Update Check-in"

**Expected Result:**
- ✅ Success message: "Check-in updated successfully"
- ✅ Progress bar updates
- ✅ New actual achievement shows
- ✅ Manager comment visible

---

### TEST 10: View Analytics
**Steps:**
1. Click "Analytics" in left menu

**Expected Result:**
- ✅ See "Analytics Dashboard" page
- ✅ See 4 charts:
  1. Goal Distribution by Thrust Area (pie chart)
  2. Goal Status Overview (pie chart)
  3. Completion Rates - Q1 (bar chart)
  4. Average Progress by Quarter (line chart)
- ✅ Charts are colorful and interactive
- ✅ Can select different quarters from dropdown

---

### TEST 11: View Notifications
**Steps:**
1. Click bell icon (🔔) in top right

**Expected Result:**
- ✅ Notification dropdown opens
- ✅ See list of notifications (if any)
- ✅ See "Mark all as read" button
- ✅ Can click individual notifications

---

### TEST 12: Test AI Suggestions (X-Factor Feature!)
**Steps:**
1. Go back to "My Goals"
2. Click "+ Create Goal"
3. Look for "AI Suggestions" or "Get AI Help" button
4. Click it

**Expected Result:**
- ✅ AI generates goal suggestions
- ✅ See suggested goals based on your role
- ✅ Can select a suggestion to auto-fill form
- ✅ This is your X-FACTOR feature!

**Note:** If OpenAI API key is not configured, this might show an error. That's okay - mention it in demo as "requires API key configuration".

---

### TEST 13: Logout
**Steps:**
1. Click profile icon (top right, shows "Employee")
2. Click "Logout"

**Expected Result:**
- ✅ Logged out successfully
- ✅ Redirected to /login
- ✅ Can't access protected pages

---

## 👔 MANAGER TESTING (manager1@demo.com)

### TEST 14: Manager Login
**Steps:**
1. Go to http://localhost:3000/login
2. Enter email: `manager1@demo.com`
3. Enter password: `password123`
4. Click "Sign In"

**Expected Result:**
- ✅ Success message: "Welcome back, John Manager!"
- ✅ Redirected to /manager/approvals
- ✅ See different menu items (Manager-specific)

---

### TEST 15: View Pending Approvals
**Steps:**
1. Already on /manager/approvals after login
2. Check the pending approvals table

**Expected Result:**
- ✅ See goals waiting for approval
- ✅ See columns: Employee, Goal Title, Weightage, Target, Actions
- ✅ See "Approve" and "Reject" buttons
- ✅ Can see goal details

**Test Data Visible:**
```
If you submitted a goal as emp1, you should see:
- Employee: Alice Engineer
- Goal: Customer Satisfaction Excellence
- Weightage: 30%
- Target: 95
- Status: Pending Approval
```

---

### TEST 16: Approve a Goal
**Steps:**
1. Find a pending goal
2. Click "Approve" button (green checkmark)
3. Confirm approval

**Expected Result:**
- ✅ Success message: "Goal approved successfully"
- ✅ Goal disappears from pending list
- ✅ Notification sent to employee
- ✅ Goal status changes to "Approved"

---

### TEST 17: Reject a Goal
**Steps:**
1. Find another pending goal (login as emp2 and create one if needed)
2. Click "Reject" button (red X)
3. Enter rejection reason:

**Test Data:**
```
Rejection Reason: Please revise the target to be more specific and measurable. Current target is too vague.
```

4. Click "Reject"

**Expected Result:**
- ✅ Success message: "Goal rejected"
- ✅ Goal disappears from pending list
- ✅ Notification sent to employee with reason
- ✅ Goal status changes to "Rejected"

---

### TEST 18: View Team Goals
**Steps:**
1. Click "Team Goals" in left menu (if available)
2. Or check the main dashboard

**Expected Result:**
- ✅ See all goals from your team members
- ✅ See goals from emp1, emp2, emp3, emp4, emp5
- ✅ Can filter by employee
- ✅ Can see status of all goals

---

### TEST 19: View Team Check-ins
**Steps:**
1. Click "Team Check-ins" in left menu
2. Select "Q1 (July)" from dropdown

**Expected Result:**
- ✅ See check-ins from all team members
- ✅ See columns: Employee, Goal, Progress, Status, Manager Comment
- ✅ Can add manager comments
- ✅ Can see who's on track vs behind

---

### TEST 20: Add Manager Comment to Check-in
**Steps:**
1. Find a check-in
2. Click "Update" or "Add Comment"
3. Enter comment:

**Test Data:**
```
Manager Comment: Excellent progress! Keep up the good work. Let's discuss strategies to accelerate in our next 1:1.
```

4. Save comment

**Expected Result:**
- ✅ Comment saved successfully
- ✅ Comment visible to employee
- ✅ Timestamp shows when comment was added

---

### TEST 21: Inline Edit Goal (Manager Feature)
**Steps:**
1. Go to Team Goals
2. Find a goal
3. Click to edit inline (if available)
4. Modify:

**Test Data:**
```
Weightage: Change from 30% to 25%
```

5. Save changes

**Expected Result:**
- ✅ Changes saved
- ✅ Employee notified of change
- ✅ Audit log created

---

### TEST 22: Approve All Goals for an Employee
**Steps:**
1. Go to Pending Approvals
2. Look for "Approve All" button for an employee
3. Click it

**Expected Result:**
- ✅ All pending goals for that employee approved
- ✅ Success message
- ✅ All goals move to approved status

---

## 🔑 ADMIN TESTING (admin@demo.com)

### TEST 23: Admin Login
**Steps:**
1. Logout from manager account
2. Go to http://localhost:3000/login
3. Enter email: `admin@demo.com`
4. Enter password: `password123`
5. Click "Sign In"

**Expected Result:**
- ✅ Success message: "Welcome back, Admin User!"
- ✅ Redirected to /admin/goals
- ✅ See admin-specific menu items

---

### TEST 24: View All Goals (System-Wide)
**Steps:**
1. Already on /admin/goals after login
2. Check the all goals table

**Expected Result:**
- ✅ See ALL goals from ALL employees
- ✅ See columns: Employee, Goal, Department, Status, Weightage
- ✅ Can filter by department
- ✅ Can filter by status
- ✅ Can search by employee name
- ✅ See goals from all 15+ employees

---

### TEST 25: Unlock a Locked Goal
**Steps:**
1. Find a goal with status "Approved" (locked)
2. Click "Unlock" button (if available)
3. Confirm unlock

**Expected Result:**
- ✅ Goal unlocked successfully
- ✅ Employee can now edit the goal
- ✅ Audit log entry created
- ✅ Notification sent to employee

---

### TEST 26: Create Shared Goal
**Steps:**
1. Click "Shared Goals" in left menu
2. Click "+ Create Shared Goal"
3. Fill in the form:

**Test Data:**
```
Title: Company-Wide Revenue Target
Description: Achieve 20% revenue growth across all departments
Thrust Area: Revenue Growth
UoM Type: Percentage
Target: 120
Primary Owner: Select emp1 (Alice Engineer)
Recipients: Select multiple employees (emp2, emp3, emp4)
```

4. Click "Create Shared Goal"

**Expected Result:**
- ✅ Shared goal created
- ✅ Goal assigned to all selected employees
- ✅ All recipients notified
- ✅ Goal appears in each employee's dashboard

---

### TEST 27: View All Users
**Steps:**
1. Click "Users" in admin menu (if available)
2. Or go to admin dashboard

**Expected Result:**
- ✅ See list of all 20 users
- ✅ See columns: Name, Email, Role, Department, Manager
- ✅ Can filter by role
- ✅ Can filter by department
- ✅ Can search by name

**Test Data Visible:**
```
Should see:
- 1 Admin (admin@demo.com)
- 3 Managers (manager1, manager2, manager3)
- 15+ Employees (emp1-emp15)
```

---

### TEST 28: View System Statistics
**Steps:**
1. Go to admin dashboard
2. Check the stats cards at top

**Expected Result:**
- ✅ See total users: 20
- ✅ See total goals: 9+
- ✅ See pending approvals count
- ✅ See completion rate
- ✅ See other key metrics

---

### TEST 29: View Audit Logs
**Steps:**
1. Click "Audit Logs" in admin menu
2. Check the audit log table

**Expected Result:**
- ✅ See complete activity history
- ✅ See columns: User, Action, Entity, Details, Timestamp
- ✅ Can filter by user
- ✅ Can filter by action type
- ✅ Can filter by date range

**Test Data Visible:**
```
Should see entries like:
- "Alice Engineer created goal 'Customer Satisfaction Excellence'"
- "John Manager approved goal for Alice Engineer"
- "Admin User unlocked goal for Bob Developer"
- Timestamps for all actions
```

---

### TEST 30: View System-Wide Analytics
**Steps:**
1. Click "Analytics" in admin menu
2. Check all charts

**Expected Result:**
- ✅ See analytics for ALL departments
- ✅ See goal distribution across thrust areas
- ✅ See completion rates by department
- ✅ See employee performance comparison
- ✅ Can filter by quarter
- ✅ Can export reports

---

### TEST 31: Export Reports
**Steps:**
1. Go to Analytics or Reports page
2. Click "Export" button
3. Select format (CSV or PDF)

**Expected Result:**
- ✅ Report downloads successfully
- ✅ Contains all relevant data
- ✅ Properly formatted
- ✅ Includes charts/graphs (if PDF)

---

## 🔔 CROSS-ROLE TESTING

### TEST 32: Notification Flow
**Steps:**
1. Login as emp1
2. Create and submit a goal
3. Logout
4. Login as manager1
5. Approve the goal
6. Logout
7. Login as emp1 again
8. Check notifications

**Expected Result:**
- ✅ Employee sees notification: "Your goal 'X' was approved by John Manager"
- ✅ Notification has timestamp
- ✅ Can mark as read
- ✅ Unread count updates

---

### TEST 33: Weightage Validation
**Steps:**
1. Login as emp2 (fresh employee with no goals)
2. Create 5 goals with these weightages:

**Test Data:**
```
Goal 1: Weightage 25% ✅ Should work
Goal 2: Weightage 25% ✅ Should work (total 50%)
Goal 3: Weightage 25% ✅ Should work (total 75%)
Goal 4: Weightage 25% ✅ Should work (total 100%)
Goal 5: Weightage 10% ❌ Should FAIL (total would be 110%)
```

**Expected Result:**
- ✅ First 4 goals created successfully
- ❌ 5th goal rejected with error: "Total weightage would be 110%. Maximum allowed is 100%."
- ✅ This proves validation works!

---

### TEST 34: Role-Based Access Control
**Steps:**
1. Login as emp1 (employee)
2. Try to access these URLs directly:
   - http://localhost:3000/manager/approvals
   - http://localhost:3000/admin/goals

**Expected Result:**
- ❌ Access denied or redirected
- ✅ Can only access employee pages
- ✅ This proves RBAC works!

---

### TEST 35: Search and Filter
**Steps:**
1. Login as admin
2. Go to All Goals page
3. Test search:

**Test Data:**
```
Search: "Bug" → Should find "Reduce Bug Count" goal
Search: "Alice" → Should find all Alice's goals
Filter by Status: "Approved" → Should show only approved goals
Filter by Department: "Engineering" → Should show only engineering goals
```

**Expected Result:**
- ✅ Search works correctly
- ✅ Filters work correctly
- ✅ Can combine search and filters
- ✅ Results update in real-time

---

## 📊 SUMMARY CHECKLIST

### Employee Features (13 tests)
- [ ] Login
- [ ] View goals
- [ ] Create goal (validation)
- [ ] Create goal (valid)
- [ ] Edit draft goal
- [ ] Submit for approval
- [ ] Try edit locked goal
- [ ] View check-ins
- [ ] Update check-in
- [ ] View analytics
- [ ] View notifications
- [ ] Test AI suggestions
- [ ] Logout

### Manager Features (9 tests)
- [ ] Manager login
- [ ] View pending approvals
- [ ] Approve goal
- [ ] Reject goal
- [ ] View team goals
- [ ] View team check-ins
- [ ] Add manager comment
- [ ] Inline edit goal
- [ ] Approve all goals

### Admin Features (9 tests)
- [ ] Admin login
- [ ] View all goals
- [ ] Unlock goal
- [ ] Create shared goal
- [ ] View all users
- [ ] View system stats
- [ ] View audit logs
- [ ] View system analytics
- [ ] Export reports

### Cross-Role Tests (4 tests)
- [ ] Notification flow
- [ ] Weightage validation
- [ ] Role-based access control
- [ ] Search and filter

**Total: 35 Test Cases**

---

## 🎯 TESTING TIPS

1. **Test in Order**: Follow the sequence above for best results
2. **Take Screenshots**: Capture key features for your demo
3. **Note Any Issues**: Write down anything that doesn't work
4. **Test Edge Cases**: Try invalid inputs to see error handling
5. **Check Responsiveness**: Resize browser to test mobile view

---

## ⏱️ TIME ESTIMATE

- **Employee Tests**: 15 minutes
- **Manager Tests**: 10 minutes
- **Admin Tests**: 10 minutes
- **Cross-Role Tests**: 5 minutes

**Total Testing Time**: ~40 minutes

---

## 🎬 FOR DEMO VIDEO

**Must Show:**
1. ✅ Login (all 3 roles)
2. ✅ Create goal (show validation working)
3. ✅ Manager approval workflow
4. ✅ Analytics dashboard (looks great!)
5. ✅ AI suggestions (X-factor!)
6. ✅ Check-ins with progress
7. ✅ Admin viewing all goals

**Time**: 4-5 minutes max

---

**Happy Testing! 🚀**
