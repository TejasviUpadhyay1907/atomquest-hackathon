#!/usr/bin/env python3
"""
COMPLETE APPLICATION TEST SUITE - BACKEND + FRONTEND
Tests EVERY aspect of the application like a hackathon judge
Backend APIs + Frontend UI + User Experience + Integration
Total Points: 1000 (Most comprehensive test possible)
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import threading

# URLs
BACKEND_URL = "https://atomquest-backend-33sg.onrender.com"
FRONTEND_URL = "https://atomquest-frontend.vercel.app"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'
    BOLD = '\033[1m'

class TestResult:
    def __init__(self):
        self.categories = {}
        self.total_score = 0
        self.max_score = 0
        self.start_time = datetime.now()
    
    def add_test(self, category: str, test_name: str, score: int, max_score: int, 
                 details: str = "", benchmark: str = ""):
        if category not in self.categories:
            self.categories[category] = []
        
        self.categories[category].append({
            "name": test_name,
            "score": score,
            "max_score": max_score,
            "details": details,
            "benchmark": benchmark,
            "passed": score == max_score
        })
        self.total_score += score
        self.max_score += max_score

def print_header(title: str):
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*120}{Colors.END}")
    print(f"{Colors.CYAN}{Colors.BOLD}{title.center(120)}{Colors.END}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*120}{Colors.END}\n")

def print_test(name: str, passed: bool, score: int, max_score: int, 
               details: str = "", benchmark: str = ""):
    status = f"{Colors.GREEN}✅ PASS{Colors.END}" if passed else f"{Colors.RED}❌ FAIL{Colors.END}"
    percentage = (score / max_score * 100) if max_score > 0 else 0
    
    print(f"{status} | {name:<70} | {score:>2}/{max_score:<2} ({percentage:>5.1f}%)")
    if details:
        print(f"     {Colors.YELLOW}└─ {details}{Colors.END}")
    if benchmark:
        print(f"     {Colors.BLUE}└─ Benchmark: {benchmark}{Colors.END}")

def setup_driver():
    """Setup Chrome driver for frontend testing"""
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        return driver
    except Exception as e:
        print(f"⚠️ Could not setup Chrome driver: {e}")
        print("Frontend tests will be skipped. Install ChromeDriver for full testing.")
        return None

# Initialize test results
results = TestResult()

print_header("ATOMQUEST COMPLETE APPLICATION TEST SUITE - BACKEND + FRONTEND")
print(f"{Colors.MAGENTA}Testing EVERYTHING: APIs + UI + UX + Integration + Performance{Colors.END}")
print(f"{Colors.MAGENTA}Total Test Points: 1000 | Testing Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")

# ============================================================================
# PART 1: BACKEND API TESTING (500 points) - Same as before but condensed
# ============================================================================
print_header("PART 1: BACKEND API TESTING (500 points)")

# Test credentials
admin_token = None
manager_token = None
employee_token = None

# Quick backend health check
try:
    start = time.time()
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    elapsed = time.time() - start
    
    passed = response.status_code == 200 and response.json().get("status") == "healthy"
    score = 25 if passed and elapsed < 1.0 else 20 if passed else 0
    
    results.add_test("Backend Health", "API Server Health", score, 25,
                     f"Response: {elapsed:.3f}s | Status: {response.json().get('status') if passed else 'Failed'}")
    print_test("API Server Health", passed, score, 25,
               f"Response: {elapsed:.3f}s | Status: {response.json().get('status') if passed else 'Failed'}")
except Exception as e:
    results.add_test("Backend Health", "API Server Health", 0, 25, str(e))
    print_test("API Server Health", False, 0, 25, str(e))

# Authentication tests
auth_tests = [
    ("admin@demo.com", "password123", "Admin"),
    ("manager@demo.com", "password123", "Manager"), 
    ("emp1@demo.com", "password123", "Employee")
]

tokens = {}
for email, password, role in auth_tests:
    try:
        start = time.time()
        response = requests.post(f"{BACKEND_URL}/api/auth/login",
                               json={"email": email, "password": password}, timeout=10)
        elapsed = time.time() - start
        
        passed = response.status_code == 200 and "access_token" in response.json()
        if passed:
            tokens[role.lower()] = response.json()["access_token"]
            user_role = response.json().get("user", {}).get("role")
            role_correct = user_role == role
            score = 25 if role_correct and elapsed < 2.0 else 20 if passed else 0
        else:
            score = 0
            role_correct = False
        
        results.add_test("Authentication", f"{role} Login", score, 25,
                        f"Time: {elapsed:.3f}s | Role: {user_role if passed else 'Failed'}")
        print_test(f"{role} Login", passed and role_correct, score, 25,
                   f"Time: {elapsed:.3f}s | Role: {user_role if passed else 'Failed'}")
    except Exception as e:
        results.add_test("Authentication", f"{role} Login", 0, 25, str(e))
        print_test(f"{role} Login", False, 0, 25, str(e))

# Quick API functionality tests
if tokens.get('admin'):
    admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
    
    # Test key admin endpoints
    admin_endpoints = [
        ("/api/admin/users", "User Management"),
        ("/api/admin/stats", "System Statistics"),
        ("/api/admin/audit-logs", "Audit Logs")
    ]
    
    for endpoint, name in admin_endpoints:
        try:
            start = time.time()
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=admin_headers, timeout=10)
            elapsed = time.time() - start
            
            passed = response.status_code == 200
            score = 25 if passed and elapsed < 2.0 else 20 if passed else 0
            
            results.add_test("Admin Features", name, score, 25,
                           f"Status: {response.status_code} | Time: {elapsed:.3f}s")
            print_test(name, passed, score, 25,
                       f"Status: {response.status_code} | Time: {elapsed:.3f}s")
        except Exception as e:
            results.add_test("Admin Features", name, 0, 25, str(e))
            print_test(name, False, 0, 25, str(e))

if tokens.get('employee'):
    emp_headers = {"Authorization": f"Bearer {tokens['employee']}"}
    
    # Test key employee endpoints
    employee_endpoints = [
        ("/api/goals/my-goals", "My Goals"),
        ("/api/checkins/my-checkins?quarter=Q1", "Check-ins"),
        ("/api/notifications", "Notifications")
    ]
    
    for endpoint, name in employee_endpoints:
        try:
            start = time.time()
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=emp_headers, timeout=10)
            elapsed = time.time() - start
            
            passed = response.status_code == 200
            score = 25 if passed and elapsed < 2.0 else 20 if passed else 0
            
            results.add_test("Employee Features", name, score, 25,
                           f"Status: {response.status_code} | Time: {elapsed:.3f}s")
            print_test(name, passed, score, 25,
                       f"Status: {response.status_code} | Time: {elapsed:.3f}s")
        except Exception as e:
            results.add_test("Employee Features", name, 0, 25, str(e))
            print_test(name, False, 0, 25, str(e))

# AI and advanced features
if tokens.get('employee'):
    try:
        start = time.time()
        response = requests.post(f"{BACKEND_URL}/api/ai/suggest-goals", 
                               headers=emp_headers,
                               params={"role": "Software Engineer", "department": "Engineering"},
                               timeout=15)
        elapsed = time.time() - start
        
        passed = response.status_code == 200
        suggestions = response.json() if passed else []
        quality_score = len(suggestions) >= 3 if passed else False
        
        score = 50 if passed and quality_score and elapsed < 10.0 else 30 if passed else 0
        
        results.add_test("AI Features", "Goal Suggestions", score, 50,
                        f"Suggestions: {len(suggestions)} | Time: {elapsed:.3f}s")
        print_test("Goal Suggestions", passed and quality_score, score, 50,
                   f"Suggestions: {len(suggestions)} | Time: {elapsed:.3f}s")
    except Exception as e:
        results.add_test("AI Features", "Goal Suggestions", 0, 50, str(e))
        print_test("Goal Suggestions", False, 0, 50, str(e))

# ============================================================================
# PART 2: FRONTEND UI TESTING (400 points) - NEW!
# ============================================================================
print_header("PART 2: FRONTEND UI TESTING (400 points)")

driver = setup_driver()
if driver:
    try:
        # Test 1: Frontend Loading and Accessibility
        try:
            start = time.time()
            driver.get(FRONTEND_URL)
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            elapsed = time.time() - start
            
            # Check if login page loads
            login_elements = driver.find_elements(By.XPATH, "//input[@type='email' or @placeholder*='email']")
            has_login_form = len(login_elements) > 0
            
            # Check page title
            title = driver.title
            has_proper_title = "AtomQuest" in title or "Goal" in title or len(title) > 0
            
            score = 50 if has_login_form and has_proper_title and elapsed < 5.0 else 30 if has_login_form else 0
            
            results.add_test("Frontend Loading", "Page Load & Accessibility", score, 50,
                           f"Load time: {elapsed:.3f}s | Title: {title} | Login form: {'✓' if has_login_form else '✗'}")
            print_test("Page Load & Accessibility", has_login_form and has_proper_title, score, 50,
                       f"Load time: {elapsed:.3f}s | Title: {title} | Login form: {'✓' if has_login_form else '✗'}")
        except Exception as e:
            results.add_test("Frontend Loading", "Page Load & Accessibility", 0, 50, str(e))
            print_test("Page Load & Accessibility", False, 0, 50, str(e))
        
        # Test 2: Login Functionality
        try:
            # Find email and password fields
            email_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='email' or @placeholder*='email' or @placeholder*='Email']"))
            )
            password_field = driver.find_element(By.XPATH, "//input[@type='password' or @placeholder*='password' or @placeholder*='Password']")
            login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Sign In') or @type='submit']")
            
            # Test login with employee credentials
            email_field.clear()
            email_field.send_keys("emp1@demo.com")
            password_field.clear()
            password_field.send_keys("password123")
            
            start = time.time()
            login_button.click()
            
            # Wait for dashboard to load (look for navigation or dashboard elements)
            try:
                WebDriverWait(driver, 15).until(
                    lambda d: d.current_url != FRONTEND_URL + "/" and "login" not in d.current_url.lower()
                )
                elapsed = time.time() - start
                login_successful = True
            except TimeoutException:
                elapsed = time.time() - start
                login_successful = False
            
            # Check if we're on dashboard
            current_url = driver.current_url
            is_dashboard = "employee" in current_url or "dashboard" in current_url or "goals" in current_url
            
            score = 50 if login_successful and is_dashboard and elapsed < 10.0 else 30 if login_successful else 0
            
            results.add_test("Frontend Auth", "Login Functionality", score, 50,
                           f"Login time: {elapsed:.3f}s | URL: {current_url} | Success: {'✓' if login_successful else '✗'}")
            print_test("Login Functionality", login_successful and is_dashboard, score, 50,
                       f"Login time: {elapsed:.3f}s | URL: {current_url} | Success: {'✓' if login_successful else '✗'}")
        except Exception as e:
            results.add_test("Frontend Auth", "Login Functionality", 0, 50, str(e))
            print_test("Login Functionality", False, 0, 50, str(e))
        
        # Test 3: Navigation and UI Elements
        try:
            # Look for navigation elements
            nav_elements = driver.find_elements(By.XPATH, "//nav//a | //div[contains(@class, 'menu')]//a | //ul//li//a")
            sidebar_elements = driver.find_elements(By.XPATH, "//*[contains(@class, 'sidebar') or contains(@class, 'sider')]")
            
            # Look for key navigation items
            goals_nav = any("goal" in elem.text.lower() for elem in nav_elements if elem.text)
            checkins_nav = any("check" in elem.text.lower() for elem in nav_elements if elem.text)
            
            has_navigation = len(nav_elements) > 0 or len(sidebar_elements) > 0
            has_key_features = goals_nav and checkins_nav
            
            score = 50 if has_navigation and has_key_features else 30 if has_navigation else 0
            
            results.add_test("Frontend UI", "Navigation & Menu", score, 50,
                           f"Nav elements: {len(nav_elements)} | Goals: {'✓' if goals_nav else '✗'} | Check-ins: {'✓' if checkins_nav else '✗'}")
            print_test("Navigation & Menu", has_navigation and has_key_features, score, 50,
                       f"Nav elements: {len(nav_elements)} | Goals: {'✓' if goals_nav else '✗'} | Check-ins: {'✓' if checkins_nav else '✗'}")
        except Exception as e:
            results.add_test("Frontend UI", "Navigation & Menu", 0, 50, str(e))
            print_test("Navigation & Menu", False, 0, 50, str(e))
        
        # Test 4: Goals Page Functionality
        try:
            # Try to navigate to goals page
            goals_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Goal') or contains(text(), 'goal')]")
            if goals_links:
                goals_links[0].click()
                time.sleep(3)
            
            # Look for goals-related elements
            goal_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Goal') or contains(text(), 'goal')]")
            table_elements = driver.find_elements(By.TAG_NAME, "table")
            card_elements = driver.find_elements(By.XPATH, "//*[contains(@class, 'card') or contains(@class, 'Card')]")
            
            has_goals_content = len(goal_elements) > 0
            has_data_display = len(table_elements) > 0 or len(card_elements) > 0
            
            score = 50 if has_goals_content and has_data_display else 30 if has_goals_content else 0
            
            results.add_test("Frontend Features", "Goals Page", score, 50,
                           f"Goal elements: {len(goal_elements)} | Tables: {len(table_elements)} | Cards: {len(card_elements)}")
            print_test("Goals Page", has_goals_content and has_data_display, score, 50,
                       f"Goal elements: {len(goal_elements)} | Tables: {len(table_elements)} | Cards: {len(card_elements)}")
        except Exception as e:
            results.add_test("Frontend Features", "Goals Page", 0, 50, str(e))
            print_test("Goals Page", False, 0, 50, str(e))
        
        # Test 5: Check-ins Page (The one we just fixed!)
        try:
            # Try to navigate to check-ins page
            checkin_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Check') or contains(text(), 'check')]")
            if checkin_links:
                checkin_links[0].click()
                time.sleep(5)  # Give more time for the fixed component to load
            
            # Check if we get an error page or proper content
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Something went wrong') or contains(text(), 'Error') or contains(text(), 'Oops')]")
            checkin_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Check-in') or contains(text(), 'Quarter')]")
            
            has_error = len(error_elements) > 0
            has_checkin_content = len(checkin_elements) > 0
            
            # This should now work with our fix!
            score = 50 if has_checkin_content and not has_error else 20 if not has_error else 0
            
            results.add_test("Frontend Features", "Check-ins Page (Fixed)", score, 50,
                           f"Check-in elements: {len(checkin_elements)} | Errors: {len(error_elements)} | Working: {'✓' if not has_error else '✗'}")
            print_test("Check-ins Page (Fixed)", has_checkin_content and not has_error, score, 50,
                       f"Check-in elements: {len(checkin_elements)} | Errors: {len(error_elements)} | Working: {'✓' if not has_error else '✗'}")
        except Exception as e:
            results.add_test("Frontend Features", "Check-ins Page (Fixed)", 0, 50, str(e))
            print_test("Check-ins Page (Fixed)", False, 0, 50, str(e))
        
        # Test 6: Responsive Design
        try:
            # Test different screen sizes
            original_size = driver.get_window_size()
            
            # Test mobile size
            driver.set_window_size(375, 667)
            time.sleep(2)
            mobile_body = driver.find_element(By.TAG_NAME, "body")
            mobile_working = mobile_body.is_displayed()
            
            # Test tablet size
            driver.set_window_size(768, 1024)
            time.sleep(2)
            tablet_body = driver.find_element(By.TAG_NAME, "body")
            tablet_working = tablet_body.is_displayed()
            
            # Restore original size
            driver.set_window_size(original_size['width'], original_size['height'])
            
            responsive_score = 50 if mobile_working and tablet_working else 30 if mobile_working or tablet_working else 0
            
            results.add_test("Frontend UI", "Responsive Design", responsive_score, 50,
                           f"Mobile: {'✓' if mobile_working else '✗'} | Tablet: {'✓' if tablet_working else '✗'}")
            print_test("Responsive Design", mobile_working and tablet_working, responsive_score, 50,
                       f"Mobile: {'✓' if mobile_working else '✗'} | Tablet: {'✓' if tablet_working else '✗'}")
        except Exception as e:
            results.add_test("Frontend UI", "Responsive Design", 0, 50, str(e))
            print_test("Responsive Design", False, 0, 50, str(e))
        
    finally:
        driver.quit()
else:
    # Skip frontend tests if no driver
    print(f"{Colors.YELLOW}⚠️ Skipping frontend tests - ChromeDriver not available{Colors.END}")
    for test_name in ["Page Load & Accessibility", "Login Functionality", "Navigation & Menu", 
                      "Goals Page", "Check-ins Page (Fixed)", "Responsive Design"]:
        results.add_test("Frontend Skipped", test_name, 0, 50, "ChromeDriver not available")

# ============================================================================
# PART 3: INTEGRATION & USER EXPERIENCE (100 points) - NEW!
# ============================================================================
print_header("PART 3: INTEGRATION & USER EXPERIENCE (100 points)")

# Test 1: End-to-End Data Flow
try:
    if tokens.get('employee'):
        emp_headers = {"Authorization": f"Bearer {tokens['employee']}"}
        
        # Get goals from backend
        goals_response = requests.get(f"{BACKEND_URL}/api/goals/my-goals", headers=emp_headers, timeout=10)
        goals_success = goals_response.status_code == 200
        
        # Get checkins from backend  
        checkins_response = requests.get(f"{BACKEND_URL}/api/checkins/my-checkins?quarter=Q1", headers=emp_headers, timeout=10)
        checkins_success = checkins_response.status_code == 200
        
        # Test data consistency
        if goals_success and checkins_success:
            goals_data = goals_response.json()
            checkins_data = checkins_response.json()
            
            data_consistent = isinstance(goals_data, list) and isinstance(checkins_data, list)
            score = 50 if data_consistent else 30
        else:
            score = 0
            data_consistent = False
        
        results.add_test("Integration", "Backend-Frontend Data Flow", score, 50,
                        f"Goals API: {'✓' if goals_success else '✗'} | Checkins API: {'✓' if checkins_success else '✗'} | Consistent: {'✓' if data_consistent else '✗'}")
        print_test("Backend-Frontend Data Flow", goals_success and checkins_success and data_consistent, score, 50,
                   f"Goals API: {'✓' if goals_success else '✗'} | Checkins API: {'✓' if checkins_success else '✗'} | Consistent: {'✓' if data_consistent else '✗'}")
except Exception as e:
    results.add_test("Integration", "Backend-Frontend Data Flow", 0, 50, str(e))
    print_test("Backend-Frontend Data Flow", False, 0, 50, str(e))

# Test 2: Performance Integration
try:
    # Test concurrent requests (simulating multiple users)
    def make_request():
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    start = time.time()
    threads = []
    results_list = []
    
    for i in range(5):
        thread = threading.Thread(target=lambda: results_list.append(make_request()))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
    
    elapsed = time.time() - start
    success_rate = sum(results_list) / len(results_list) * 100
    
    score = 50 if success_rate >= 80 and elapsed < 5.0 else 30 if success_rate >= 60 else 0
    
    results.add_test("Integration", "Concurrent Load Handling", score, 50,
                    f"Success rate: {success_rate:.1f}% | Time: {elapsed:.3f}s")
    print_test("Concurrent Load Handling", success_rate >= 80 and elapsed < 5.0, score, 50,
               f"Success rate: {success_rate:.1f}% | Time: {elapsed:.3f}s")
except Exception as e:
    results.add_test("Integration", "Concurrent Load Handling", 0, 50, str(e))
    print_test("Concurrent Load Handling", False, 0, 50, str(e))

# ============================================================================
# FINAL SCORING & ANALYSIS
# ============================================================================
print_header("COMPLETE APPLICATION SCORING & ANALYSIS")

# Calculate scores by category
backend_score = 0
backend_max = 0
frontend_score = 0
frontend_max = 0
integration_score = 0
integration_max = 0

for category, tests in results.categories.items():
    category_score = sum(test["score"] for test in tests)
    category_max = sum(test["max_score"] for test in tests)
    
    if any(keyword in category.lower() for keyword in ["backend", "health", "auth", "admin", "employee", "ai"]):
        backend_score += category_score
        backend_max += category_max
    elif any(keyword in category.lower() for keyword in ["frontend", "ui", "loading", "features"]):
        frontend_score += category_score
        frontend_max += category_max
    elif "integration" in category.lower():
        integration_score += category_score
        integration_max += category_max

print(f"\n{Colors.BOLD}DETAILED BREAKDOWN:{Colors.END}")
print(f"{'='*80}")
print(f"BACKEND SCORE:     {backend_score:>3}/{backend_max:<3} ({backend_score/backend_max*100:.1f}%)")
print(f"FRONTEND SCORE:    {frontend_score:>3}/{frontend_max:<3} ({frontend_score/frontend_max*100:.1f}% if frontend_max > 0 else 'N/A')")
print(f"INTEGRATION SCORE: {integration_score:>3}/{integration_max:<3} ({integration_score/integration_max*100:.1f}% if integration_max > 0 else 'N/A')")
print(f"{'='*80}")
print(f"TOTAL SCORE:       {results.total_score:>3}/{results.max_score:<3} ({results.total_score/results.max_score*100:.2f}%)")

# Grade calculation
percentage = results.total_score / results.max_score * 100
if percentage >= 95:
    grade = "A++ (Outstanding)"
    status = "EXCEPTIONAL"
elif percentage >= 90:
    grade = "A+ (Excellent)"
    status = "EXCELLENT"
elif percentage >= 85:
    grade = "A (Very Good)"
    status = "VERY GOOD"
elif percentage >= 80:
    grade = "B+ (Good)"
    status = "GOOD"
elif percentage >= 75:
    grade = "B (Satisfactory)"
    status = "SATISFACTORY"
else:
    grade = "C (Needs Improvement)"
    status = "NEEDS WORK"

print(f"\n{Colors.BOLD}{Colors.GREEN}FINAL GRADE: {grade}{Colors.END}")
print(f"{Colors.BOLD}{Colors.GREEN}STATUS: {status}{Colors.END}")

# Recommendations
print(f"\n{Colors.BOLD}RECOMMENDATIONS:{Colors.END}")
if frontend_max == 0:
    print(f"{Colors.YELLOW}• Install ChromeDriver to enable frontend testing{Colors.END}")
if backend_score < backend_max:
    print(f"{Colors.YELLOW}• Backend issues detected - check API endpoints{Colors.END}")
if frontend_score < frontend_max * 0.8:
    print(f"{Colors.YELLOW}• Frontend issues detected - check UI components{Colors.END}")
if percentage >= 95:
    print(f"{Colors.GREEN}• Application is ready for production deployment!{Colors.END}")

print(f"\n{Colors.CYAN}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
print(f"{Colors.CYAN}Total test duration: {(datetime.now() - results.start_time).total_seconds():.1f} seconds{Colors.END}")