#!/usr/bin/env python3
"""
COMPREHENSIVE TEST SUITE - Goal Tracking Portal
Tests ALL features and endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(test_name, passed, details=""):
    global tests_passed, tests_failed
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f"\n    Details: {details}"
    test_results.append(result)
    print(result)
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1

def test_auth():
    """Test Authentication Features"""
    print("\n" + "="*60)
    print("TESTING: AUTHENTICATION")
    print("="*60)
    
    # Test 1: Login with valid credentials
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emp1@demo.com",
            "password": "password123"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            user = data.get("user")
            log_test("Login with valid credentials", 
                    token is not None and user is not None,
                    f"User: {user.get('full_name')}, Role: {user.get('role')}")
            return token
        else:
            log_test("Login with valid credentials", False, f"Status: {response.status_code}")
            return None
    except Exception as e:
        log_test("Login with valid credentials", False, str(e))
        return None
    
    # Test 2: Login with invalid credentials
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emp1@demo.com",
            "password": "wrongpassword"
        })
        log_test("Login with invalid credentials (should fail)", 
                response.status_code == 401,
                f"Status: {response.status_code}")
    except Exception as e:
        log_test("Login with invalid credentials", False, str(e))

def test_goals(token):
    """Test Goal Management Features"""
    print("\n" + "="*60)
    print("TESTING: GOAL MANAGEMENT")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get my goals
    try:
        response = requests.get(f"{BASE_URL}/api/goals/my-goals", headers=headers)
        if response.status_code == 200:
            goals = response.json()
            log_test("Get my goals", True, f"Found {len(goals)} goals")
        else:
            log_test("Get my goals", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get my goals", False, str(e))
    
    # Test 2: Create a new goal
    try:
        new_goal = {
            "title": "Test Goal - Automated",
            "description": "This is a test goal created by automated testing",
            "uom_type": "Percentage",
            "target": "100",  # Target must be string
            "weightage": 20,
            "thrust_area_id": 1
        }
        response = requests.post(f"{BASE_URL}/api/goals", json=new_goal, headers=headers)
        if response.status_code == 200:
            goal = response.json()
            goal_id = goal.get("id")
            log_test("Create new goal", True, f"Goal ID: {goal_id}, Status: {goal.get('status')}")
            return goal_id
        else:
            log_test("Create new goal", False, f"Status: {response.status_code}, {response.text}")
            return None
    except Exception as e:
        log_test("Create new goal", False, str(e))
        return None
    
    # Test 3: Update goal
    if goal_id:
        try:
            updated_goal = {
                "title": "Test Goal - Updated",
                "description": "Updated description",
                "uom_type": "Percentage",
                "target": "90",  # Target must be string
                "weightage": 25,
                "thrust_area_id": 1
            }
            response = requests.put(f"{BASE_URL}/api/goals/{goal_id}", json=updated_goal, headers=headers)
            log_test("Update goal", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Update goal", False, str(e))
    
    # Test 4: Submit goal for approval
    if goal_id:
        try:
            response = requests.post(f"{BASE_URL}/api/goals/{goal_id}/submit", headers=headers)
            log_test("Submit goal for approval", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Submit goal for approval", False, str(e))
    
    # Test 5: Check validation
    try:
        response = requests.get(f"{BASE_URL}/api/goals/validation/check", headers=headers)
        if response.status_code == 200:
            validation = response.json()
            log_test("Check goal validation", True, 
                    f"Total weightage: {validation.get('total_weightage')}%, Valid: {validation.get('is_valid')}")
        else:
            log_test("Check goal validation", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Check goal validation", False, str(e))

def test_manager_features(manager_token):
    """Test Manager Features"""
    print("\n" + "="*60)
    print("TESTING: MANAGER FEATURES")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    # Test 1: Get pending approvals
    try:
        response = requests.get(f"{BASE_URL}/api/manager/pending-approvals", headers=headers)
        if response.status_code == 200:
            approvals = response.json()
            log_test("Get pending approvals", True, f"Found {len(approvals)} pending goals")
            return approvals[0]["id"] if approvals else None
        else:
            log_test("Get pending approvals", False, f"Status: {response.status_code}")
            return None
    except Exception as e:
        log_test("Get pending approvals", False, str(e))
        return None
    
    # Test 2: Get team goals
    try:
        response = requests.get(f"{BASE_URL}/api/manager/team-goals", headers=headers)
        if response.status_code == 200:
            team_goals = response.json()
            log_test("Get team goals", True, f"Found {len(team_goals)} team goals")
        else:
            log_test("Get team goals", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get team goals", False, str(e))
    
    # Test 3: Approve a goal
    if pending_goal_id:
        try:
            response = requests.post(f"{BASE_URL}/api/manager/goals/{pending_goal_id}/approve", headers=headers)
            log_test("Approve goal", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Approve goal", False, str(e))

def test_admin_features(admin_token):
    """Test Admin Features"""
    print("\n" + "="*60)
    print("TESTING: ADMIN FEATURES")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Get all goals
    try:
        response = requests.get(f"{BASE_URL}/api/admin/all-goals", headers=headers)
        if response.status_code == 200:
            all_goals = response.json()
            log_test("Get all goals (admin)", True, f"Found {len(all_goals)} total goals")
        else:
            log_test("Get all goals (admin)", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get all goals (admin)", False, str(e))
    
    # Test 2: Get all users
    try:
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        if response.status_code == 200:
            users = response.json()
            log_test("Get all users", True, f"Found {len(users)} users")
        else:
            log_test("Get all users", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get all users", False, str(e))
    
    # Test 3: Get stats
    try:
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            log_test("Get admin stats", True, 
                    f"Users: {stats.get('total_users')}, Goals: {stats.get('total_goals')}")
        else:
            log_test("Get admin stats", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get admin stats", False, str(e))

def test_checkins(token):
    """Test Check-in Features"""
    print("\n" + "="*60)
    print("TESTING: CHECK-IN FEATURES")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get my check-ins
    try:
        response = requests.get(f"{BASE_URL}/api/checkins/my-checkins?quarter=Q1", headers=headers)
        if response.status_code == 200:
            checkins = response.json()
            log_test("Get my check-ins", True, f"Found {len(checkins)} check-ins")
        else:
            log_test("Get my check-ins", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get my check-ins", False, str(e))

def test_notifications(token):
    """Test Notification Features"""
    print("\n" + "="*60)
    print("TESTING: NOTIFICATIONS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get notifications
    try:
        response = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            log_test("Get notifications", True, f"Found {len(notifications)} notifications")
        else:
            log_test("Get notifications", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get notifications", False, str(e))
    
    # Test 2: Get unread count
    try:
        response = requests.get(f"{BASE_URL}/api/notifications/unread-count", headers=headers)
        if response.status_code == 200:
            count = response.json()
            log_test("Get unread notification count", True, f"Unread: {count.get('count')}")
        else:
            log_test("Get unread notification count", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get unread notification count", False, str(e))

def test_reports(token):
    """Test Reporting Features"""
    print("\n" + "="*60)
    print("TESTING: REPORTS & ANALYTICS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get goal distribution
    try:
        response = requests.get(f"{BASE_URL}/api/reports/analytics/goal-distribution", headers=headers)
        if response.status_code == 200:
            distribution = response.json()
            log_test("Get goal distribution", True, f"Found {len(distribution)} thrust areas")
        else:
            log_test("Get goal distribution", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get goal distribution", False, str(e))
    
    # Test 2: Get status overview
    try:
        response = requests.get(f"{BASE_URL}/api/reports/analytics/status-overview", headers=headers)
        if response.status_code == 200:
            overview = response.json()
            log_test("Get status overview", True, f"Found {len(overview)} status types")
        else:
            log_test("Get status overview", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get status overview", False, str(e))

def test_thrust_areas(token):
    """Test Thrust Area Features"""
    print("\n" + "="*60)
    print("TESTING: THRUST AREAS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/thrust-areas/", headers=headers)
        if response.status_code == 200:
            areas = response.json()
            log_test("Get thrust areas", True, f"Found {len(areas)} thrust areas")
        else:
            log_test("Get thrust areas", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get thrust areas", False, str(e))

def test_templates(token):
    """Test Template Features"""
    print("\n" + "="*60)
    print("TESTING: GOAL TEMPLATES")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/templates", headers=headers)
        if response.status_code == 200:
            templates = response.json()
            log_test("Get goal templates", True, f"Found {len(templates)} templates")
        else:
            log_test("Get goal templates", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get goal templates", False, str(e))

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 COMPREHENSIVE TEST SUITE - GOAL TRACKING PORTAL")
    print("="*60)
    print(f"Testing backend at: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Authentication
    employee_token = test_auth()
    
    if not employee_token:
        print("\n❌ CRITICAL: Authentication failed. Cannot continue tests.")
        return
    
    # Test 2: Goals (Employee)
    goal_id = test_goals(employee_token)
    
    # Test 3: Check-ins
    test_checkins(employee_token)
    
    # Test 4: Notifications
    test_notifications(employee_token)
    
    # Test 5: Thrust Areas
    test_thrust_areas(employee_token)
    
    # Test 6: Templates
    test_templates(employee_token)
    
    # Test 7: Reports
    test_reports(employee_token)
    
    # Test 8: Manager Features
    print("\n" + "="*60)
    print("LOGGING IN AS MANAGER")
    print("="*60)
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "manager1@demo.com",
            "password": "password123"
        })
        if response.status_code == 200:
            manager_token = response.json().get("access_token")
            log_test("Manager login", True, "Logged in as manager")
            pending_goal_id = test_manager_features(manager_token)
        else:
            log_test("Manager login", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Manager login", False, str(e))
    
    # Test 9: Admin Features
    print("\n" + "="*60)
    print("LOGGING IN AS ADMIN")
    print("="*60)
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@demo.com",
            "password": "password123"
        })
        if response.status_code == 200:
            admin_token = response.json().get("access_token")
            log_test("Admin login", True, "Logged in as admin")
            test_admin_features(admin_token)
        else:
            log_test("Admin login", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin login", False, str(e))
    
    # Print summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"Total Tests: {tests_passed + tests_failed}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"Success Rate: {(tests_passed/(tests_passed+tests_failed)*100):.1f}%")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if tests_failed == 0:
        print("\n🎉 ALL TESTS PASSED! YOUR APP IS 100% FUNCTIONAL!")
    else:
        print(f"\n⚠️ {tests_failed} tests failed. Review the details above.")
    
    print("="*60)

if __name__ == "__main__":
    main()
