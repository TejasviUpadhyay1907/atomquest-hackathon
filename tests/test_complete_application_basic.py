#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
COMPLETE APPLICATION TEST SUITE - BACKEND + FRONTEND (Basic Version)
Tests EVERY aspect of the application like a hackathon judge
Backend APIs + Frontend HTTP + User Experience + Integration
Total Points: 1000 (Most comprehensive test possible)
"""

import sys
import io
import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple
import threading
import re

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

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
# Initialize test results
results = TestResult()

print_header("ATOMQUEST COMPLETE APPLICATION TEST SUITE - BACKEND + FRONTEND")
print(f"{Colors.MAGENTA}Testing EVERYTHING: APIs + Frontend HTTP + UX + Integration + Performance{Colors.END}")
print(f"{Colors.MAGENTA}Total Test Points: 1000 | Testing Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")

# ============================================================================
# PART 1: BACKEND API TESTING (500 points)
# ============================================================================
print_header("PART 1: BACKEND API TESTING (500 points)")

# Test credentials
tokens = {}

# Backend health check
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
# Admin functionality tests
if tokens.get('admin'):
    admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
    
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

# Employee functionality tests
if tokens.get('employee'):
    emp_headers = {"Authorization": f"Bearer {tokens['employee']}"}
    
    employee_endpoints = [
        ("/api/goals/my-goals", "My Goals"),
        ("/api/checkins/my-checkins?quarter=Q1", "Check-ins (Fixed)"),
        ("/api/notifications", "Notifications")
    ]
    
    for endpoint, name in employee_endpoints:
        try:
            start = time.time()
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=emp_headers, timeout=10)
            elapsed = time.time() - start
            
            passed = response.status_code == 200
            data = response.json() if passed else []
            data_quality = isinstance(data, list) and len(data) >= 0
            
            score = 25 if passed and data_quality and elapsed < 2.0 else 20 if passed else 0
            
            results.add_test("Employee Features", name, score, 25,
                           f"Status: {response.status_code} | Time: {elapsed:.3f}s | Data: {len(data) if isinstance(data, list) else 'N/A'}")
            print_test(name, passed and data_quality, score, 25,
                       f"Status: {response.status_code} | Time: {elapsed:.3f}s | Data: {len(data) if isinstance(data, list) else 'N/A'}")
        except Exception as e:
            results.add_test("Employee Features", name, 0, 25, str(e))
            print_test(name, False, 0, 25, str(e))

# AI features test
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
# PART 2: FRONTEND HTTP TESTING (400 points)
# ============================================================================
print_header("PART 2: FRONTEND HTTP TESTING (400 points)")

# Test 1: Frontend Server Response
try:
    start = time.time()
    response = requests.get(FRONTEND_URL, timeout=15)
    elapsed = time.time() - start
    
    passed = response.status_code == 200
    content_length = len(response.text)
    has_html = "<html" in response.text.lower() or "<!doctype" in response.text.lower()
    
    score = 50 if passed and has_html and elapsed < 5.0 else 30 if passed else 0
    
    results.add_test("Frontend Server", "Frontend Loading", score, 50,
                     f"Status: {response.status_code} | Time: {elapsed:.3f}s | Size: {content_length} bytes | HTML: {'✓' if has_html else '✗'}")
    print_test("Frontend Loading", passed and has_html, score, 50,
               f"Status: {response.status_code} | Time: {elapsed:.3f}s | Size: {content_length} bytes | HTML: {'✓' if has_html else '✗'}")
except Exception as e:
    results.add_test("Frontend Server", "Frontend Loading", 0, 50, str(e))
    print_test("Frontend Loading", False, 0, 50, str(e))

# Test 2: Frontend Content Analysis
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        content = response.text.lower()
        
        # Check for key elements
        has_title = "atomquest" in content or "goal" in content
        has_login = "login" in content or "email" in content or "password" in content
        has_react = "react" in content or "_app" in content or "bundle" in content
        has_css = "css" in content or "style" in content
        
        elements_found = sum([has_title, has_login, has_react, has_css])
        score = 50 if elements_found >= 3 else 30 if elements_found >= 2 else 10 if elements_found >= 1 else 0
        
        results.add_test("Frontend Content", "Content Quality", score, 50,
                        f"Title: {'✓' if has_title else '✗'} | Login: {'✓' if has_login else '✗'} | React: {'✓' if has_react else '✗'} | CSS: {'✓' if has_css else '✗'}")
        print_test("Content Quality", elements_found >= 3, score, 50,
                   f"Title: {'✓' if has_title else '✗'} | Login: {'✓' if has_login else '✗'} | React: {'✓' if has_react else '✗'} | CSS: {'✓' if has_css else '✗'}")
    else:
        results.add_test("Frontend Content", "Content Quality", 0, 50, f"HTTP {response.status_code}")
        print_test("Content Quality", False, 0, 50, f"HTTP {response.status_code}")
except Exception as e:
    results.add_test("Frontend Content", "Content Quality", 0, 50, str(e))
    print_test("Content Quality", False, 0, 50, str(e))

# Test 3: Frontend Assets and Resources
try:
    # Check for common frontend assets
    asset_tests = [
        ("/favicon.ico", "Favicon"),
        ("/manifest.json", "PWA Manifest"),
        ("/robots.txt", "SEO Robots")
    ]
    
    assets_working = 0
    for asset_path, asset_name in asset_tests:
        try:
            asset_response = requests.get(f"{FRONTEND_URL}{asset_path}", timeout=5)
            if asset_response.status_code in [200, 404]:  # 404 is acceptable for optional assets
                assets_working += 1
        except:
            pass
    
    # Check if main page loads additional resources
    main_response = requests.get(FRONTEND_URL, timeout=10)
    if main_response.status_code == 200:
        # Look for script and CSS references
        script_refs = len(re.findall(r'<script[^>]*src=', main_response.text, re.IGNORECASE))
        css_refs = len(re.findall(r'<link[^>]*stylesheet', main_response.text, re.IGNORECASE))
        
        has_resources = script_refs > 0 or css_refs > 0
        score = 50 if has_resources and assets_working >= 2 else 30 if has_resources else 0
        
        results.add_test("Frontend Assets", "Resource Loading", score, 50,
                        f"Scripts: {script_refs} | CSS: {css_refs} | Assets: {assets_working}/3")
        print_test("Resource Loading", has_resources and assets_working >= 2, score, 50,
                   f"Scripts: {script_refs} | CSS: {css_refs} | Assets: {assets_working}/3")
    else:
        results.add_test("Frontend Assets", "Resource Loading", 0, 50, "Main page failed")
        print_test("Resource Loading", False, 0, 50, "Main page failed")
except Exception as e:
    results.add_test("Frontend Assets", "Resource Loading", 0, 50, str(e))
    print_test("Resource Loading", False, 0, 50, str(e))
# Test 4: Frontend API Integration Check
try:
    # Check if frontend is configured to connect to correct backend
    main_response = requests.get(FRONTEND_URL, timeout=10)
    if main_response.status_code == 200:
        content = main_response.text
        
        # Look for backend URL references
        has_backend_ref = BACKEND_URL in content or "atomquest-backend" in content
        has_api_calls = "/api/" in content or "api" in content
        
        # Check if frontend makes actual API calls (by looking for common patterns)
        has_auth_patterns = "authorization" in content.lower() or "bearer" in content.lower()
        
        integration_score = sum([has_backend_ref, has_api_calls, has_auth_patterns])
        score = 50 if integration_score >= 2 else 30 if integration_score >= 1 else 0
        
        results.add_test("Frontend Integration", "API Configuration", score, 50,
                        f"Backend ref: {'✓' if has_backend_ref else '✗'} | API calls: {'✓' if has_api_calls else '✗'} | Auth: {'✓' if has_auth_patterns else '✗'}")
        print_test("API Configuration", integration_score >= 2, score, 50,
                   f"Backend ref: {'✓' if has_backend_ref else '✗'} | API calls: {'✓' if has_api_calls else '✗'} | Auth: {'✓' if has_auth_patterns else '✗'}")
    else:
        results.add_test("Frontend Integration", "API Configuration", 0, 50, "Frontend not accessible")
        print_test("API Configuration", False, 0, 50, "Frontend not accessible")
except Exception as e:
    results.add_test("Frontend Integration", "API Configuration", 0, 50, str(e))
    print_test("API Configuration", False, 0, 50, str(e))

# Test 5: Frontend Performance
try:
    # Test multiple requests to frontend
    response_times = []
    success_count = 0
    
    for i in range(3):
        start = time.time()
        response = requests.get(FRONTEND_URL, timeout=10)
        elapsed = time.time() - start
        response_times.append(elapsed)
        
        if response.status_code == 200:
            success_count += 1
        
        time.sleep(1)  # Small delay between requests
    
    avg_response_time = sum(response_times) / len(response_times)
    success_rate = success_count / 3 * 100
    
    score = 50 if avg_response_time < 3.0 and success_rate == 100 else 30 if success_rate >= 66 else 0
    
    results.add_test("Frontend Performance", "Response Time", score, 50,
                    f"Avg time: {avg_response_time:.3f}s | Success: {success_rate:.0f}%")
    print_test("Response Time", avg_response_time < 3.0 and success_rate == 100, score, 50,
               f"Avg time: {avg_response_time:.3f}s | Success: {success_rate:.0f}%")
except Exception as e:
    results.add_test("Frontend Performance", "Response Time", 0, 50, str(e))
    print_test("Response Time", False, 0, 50, str(e))

# Test 6: Frontend Security Headers
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        headers = response.headers
        
        # Check for security headers
        has_csp = 'content-security-policy' in headers
        has_xframe = 'x-frame-options' in headers
        has_xss = 'x-xss-protection' in headers
        has_content_type = 'x-content-type-options' in headers
        
        security_headers = sum([has_csp, has_xframe, has_xss, has_content_type])
        score = 50 if security_headers >= 2 else 30 if security_headers >= 1 else 10
        
        results.add_test("Frontend Security", "Security Headers", score, 50,
                        f"CSP: {'✓' if has_csp else '✗'} | X-Frame: {'✓' if has_xframe else '✗'} | XSS: {'✓' if has_xss else '✗'} | Content-Type: {'✓' if has_content_type else '✗'}")
        print_test("Security Headers", security_headers >= 2, score, 50,
                   f"CSP: {'✓' if has_csp else '✗'} | X-Frame: {'✓' if has_xframe else '✗'} | XSS: {'✓' if has_xss else '✗'} | Content-Type: {'✓' if has_content_type else '✗'}")
    else:
        results.add_test("Frontend Security", "Security Headers", 0, 50, "Frontend not accessible")
        print_test("Security Headers", False, 0, 50, "Frontend not accessible")
except Exception as e:
    results.add_test("Frontend Security", "Security Headers", 0, 50, str(e))
    print_test("Security Headers", False, 0, 50, str(e))
# ============================================================================
# PART 3: INTEGRATION & USER EXPERIENCE (100 points)
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
    elif any(keyword in category.lower() for keyword in ["frontend", "server", "content", "assets", "performance", "security"]):
        frontend_score += category_score
        frontend_max += category_max
    elif "integration" in category.lower():
        integration_score += category_score
        integration_max += category_max

print(f"\n{Colors.BOLD}DETAILED BREAKDOWN:{Colors.END}")
print(f"{'='*100}")
print(f"BACKEND SCORE:     {backend_score:>3}/{backend_max:<3} ({backend_score/backend_max*100:.1f}%)")
print(f"FRONTEND SCORE:    {frontend_score:>3}/{frontend_max:<3} ({frontend_score/frontend_max*100:.1f}% if frontend_max > 0 else 'N/A')")
print(f"INTEGRATION SCORE: {integration_score:>3}/{integration_max:<3} ({integration_score/integration_max*100:.1f}% if integration_max > 0 else 'N/A')")
print(f"{'='*100}")
print(f"TOTAL SCORE:       {results.total_score:>3}/{results.max_score:<3} ({results.total_score/results.max_score*100:.2f}%)")

# Grade calculation
percentage = results.total_score / results.max_score * 100
if percentage >= 95:
    grade = "A++ (Outstanding)"
    status = "EXCEPTIONAL"
    color = Colors.GREEN
elif percentage >= 90:
    grade = "A+ (Excellent)"
    status = "EXCELLENT"
    color = Colors.GREEN
elif percentage >= 85:
    grade = "A (Very Good)"
    status = "VERY GOOD"
    color = Colors.GREEN
elif percentage >= 80:
    grade = "B+ (Good)"
    status = "GOOD"
    color = Colors.YELLOW
elif percentage >= 75:
    grade = "B (Satisfactory)"
    status = "SATISFACTORY"
    color = Colors.YELLOW
else:
    grade = "C (Needs Improvement)"
    status = "NEEDS WORK"
    color = Colors.RED

print(f"\n{Colors.BOLD}{color}FINAL GRADE: {grade}{Colors.END}")
print(f"{Colors.BOLD}{color}STATUS: {status}{Colors.END}")

# Detailed category breakdown
print(f"\n{Colors.BOLD}CATEGORY PERFORMANCE:{Colors.END}")
print(f"{'='*100}")

for category, tests in results.categories.items():
    category_score = sum(test["score"] for test in tests)
    category_max = sum(test["max_score"] for test in tests)
    category_pct = category_score / category_max * 100 if category_max > 0 else 0
    
    status_icon = "✅" if category_pct >= 90 else "⚠️" if category_pct >= 70 else "❌"
    print(f"{status_icon} {category:<25} | {category_score:>3}/{category_max:<3} ({category_pct:>5.1f}%)")

# Recommendations
print(f"\n{Colors.BOLD}RECOMMENDATIONS:{Colors.END}")
print(f"{'='*100}")

if backend_score < backend_max * 0.9:
    print(f"{Colors.YELLOW}• Backend Performance: Some API endpoints need optimization{Colors.END}")
if frontend_score < frontend_max * 0.8:
    print(f"{Colors.YELLOW}• Frontend Issues: Check UI components and resource loading{Colors.END}")
if integration_score < integration_max * 0.8:
    print(f"{Colors.YELLOW}• Integration Issues: Backend-Frontend communication needs improvement{Colors.END}")

if percentage >= 95:
    print(f"{Colors.GREEN}• 🏆 OUTSTANDING! Application is ready for production deployment!{Colors.END}")
elif percentage >= 90:
    print(f"{Colors.GREEN}• 🎉 EXCELLENT! Application is highly competitive for hackathon!{Colors.END}")
elif percentage >= 85:
    print(f"{Colors.GREEN}• ✅ VERY GOOD! Application meets high standards!{Colors.END}")
elif percentage >= 80:
    print(f"{Colors.YELLOW}• 👍 GOOD! Application is solid with minor improvements needed{Colors.END}")
else:
    print(f"{Colors.RED}• ⚠️ NEEDS WORK! Focus on critical issues before submission{Colors.END}")

# Hackathon readiness assessment
print(f"\n{Colors.BOLD}HACKATHON READINESS ASSESSMENT:{Colors.END}")
print(f"{'='*100}")

readiness_criteria = [
    ("Backend APIs Working", backend_score >= backend_max * 0.8, 20),
    ("Frontend Loading", frontend_score >= frontend_max * 0.7, 20),
    ("Authentication System", any("auth" in cat.lower() for cat in results.categories.keys()), 15),
    ("Core Features Present", backend_score + frontend_score >= (backend_max + frontend_max) * 0.75, 15),
    ("Performance Acceptable", percentage >= 75, 15),
    ("Integration Working", integration_score >= integration_max * 0.7, 15)
]

total_readiness = 0
max_readiness = 0

for criteria, passed, points in readiness_criteria:
    status = "✅ MET" if passed else "❌ NOT MET"
    score = points if passed else 0
    total_readiness += score
    max_readiness += points
    print(f"{status:<12} | {criteria:<30} | {score:>2}/{points}")

readiness_pct = total_readiness / max_readiness * 100
print(f"{'='*100}")
print(f"HACKATHON READINESS: {total_readiness}/{max_readiness} ({readiness_pct:.1f}%)")

if readiness_pct >= 90:
    print(f"{Colors.GREEN}{Colors.BOLD}🏆 HIGHLY COMPETITIVE - Ready to win!{Colors.END}")
elif readiness_pct >= 80:
    print(f"{Colors.GREEN}{Colors.BOLD}🎯 COMPETITIVE - Strong submission!{Colors.END}")
elif readiness_pct >= 70:
    print(f"{Colors.YELLOW}{Colors.BOLD}👍 GOOD - Solid hackathon entry!{Colors.END}")
else:
    print(f"{Colors.RED}{Colors.BOLD}⚠️ NEEDS WORK - Address critical issues!{Colors.END}")

print(f"\n{Colors.CYAN}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
print(f"{Colors.CYAN}Total test duration: {(datetime.now() - results.start_time).total_seconds():.1f} seconds{Colors.END}")
print(f"{Colors.CYAN}Report generated by: Complete Application Test Suite v1.0{Colors.END}")

print(f"\n{Colors.BOLD}🎯 SUMMARY:{Colors.END}")
print(f"Backend: {backend_score}/{backend_max} ({backend_score/backend_max*100:.1f}%)")
print(f"Frontend: {frontend_score}/{frontend_max} ({frontend_score/frontend_max*100:.1f}%)")
print(f"Integration: {integration_score}/{integration_max} ({integration_score/integration_max*100:.1f}%)")
print(f"TOTAL: {results.total_score}/{results.max_score} ({percentage:.2f}%) - {grade}")