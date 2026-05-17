#!/usr/bin/env python3
"""
FRONTEND DEEP ANALYSIS TEST SUITE
Comprehensive testing of frontend UI, UX, performance, and functionality
Identifies exact issues affecting frontend score
Total Points: 500 (Frontend-focused detailed analysis)
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple
import re
from urllib.parse import urljoin, urlparse

# Frontend URL
FRONTEND_URL = "https://atomquest-frontend.vercel.app"
BACKEND_URL = "https://atomquest-backend-33sg.onrender.com"

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

print_header("ATOMQUEST FRONTEND DEEP ANALYSIS TEST SUITE")
print(f"{Colors.MAGENTA}Comprehensive Frontend Testing: UI + UX + Performance + Security + Integration{Colors.END}")
print(f"{Colors.MAGENTA}Total Test Points: 500 | Testing Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")

# ============================================================================
# CATEGORY 1: BASIC FRONTEND FUNCTIONALITY (100 points)
# ============================================================================
print_header("1. BASIC FRONTEND FUNCTIONALITY (100 points)")

# Test 1.1: Frontend Server Response
try:
    start = time.time()
    response = requests.get(FRONTEND_URL, timeout=15, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    elapsed = time.time() - start
    
    passed = response.status_code == 200
    content_length = len(response.text)
    
    score = 25 if passed and elapsed < 3.0 else 20 if passed else 0
    
    results.add_test("Basic Functionality", "Server Response", score, 25,
                     f"Status: {response.status_code} | Time: {elapsed:.3f}s | Size: {content_length} bytes")
    print_test("Server Response", passed, score, 25,
               f"Status: {response.status_code} | Time: {elapsed:.3f}s | Size: {content_length} bytes")
    
    # Store response for further analysis
    main_html = response.text if passed else ""
    
except Exception as e:
    main_html = ""
    results.add_test("Basic Functionality", "Server Response", 0, 25, str(e))
    print_test("Server Response", False, 0, 25, str(e))

# Test 1.2: HTML Structure Analysis
try:
    if main_html:
        # Check HTML structure
        has_doctype = "<!doctype" in main_html.lower() or "<!DOCTYPE" in main_html
        has_html_tag = "<html" in main_html.lower()
        has_head = "<head" in main_html.lower()
        has_body = "<body" in main_html.lower()
        has_title = "<title" in main_html.lower()
        
        structure_score = sum([has_doctype, has_html_tag, has_head, has_body, has_title])
        score = 25 if structure_score >= 4 else 20 if structure_score >= 3 else 10 if structure_score >= 2 else 0
        
        results.add_test("Basic Functionality", "HTML Structure", score, 25,
                        f"DOCTYPE: {'✓' if has_doctype else '✗'} | HTML: {'✓' if has_html_tag else '✗'} | HEAD: {'✓' if has_head else '✗'} | BODY: {'✓' if has_body else '✗'} | TITLE: {'✓' if has_title else '✗'}")
        print_test("HTML Structure", structure_score >= 4, score, 25,
                   f"DOCTYPE: {'✓' if has_doctype else '✗'} | HTML: {'✓' if has_html_tag else '✗'} | HEAD: {'✓' if has_head else '✗'} | BODY: {'✓' if has_body else '✗'} | TITLE: {'✓' if has_title else '✗'}")
    else:
        results.add_test("Basic Functionality", "HTML Structure", 0, 25, "No HTML content")
        print_test("HTML Structure", False, 0, 25, "No HTML content")
except Exception as e:
    results.add_test("Basic Functionality", "HTML Structure", 0, 25, str(e))
    print_test("HTML Structure", False, 0, 25, str(e))

# Test 1.3: Meta Tags and SEO
try:
    if main_html:
        # Check meta tags
        has_charset = 'charset=' in main_html.lower()
        has_viewport = 'viewport' in main_html.lower()
        has_description = 'name="description"' in main_html.lower()
        has_favicon = 'favicon' in main_html.lower() or 'icon' in main_html.lower()
        
        # Extract title
        title_match = re.search(r'<title[^>]*>(.*?)</title>', main_html, re.IGNORECASE | re.DOTALL)
        title_text = title_match.group(1).strip() if title_match else ""
        has_meaningful_title = len(title_text) > 0 and not title_text.lower() in ['', 'react app', 'vite app']
        
        meta_score = sum([has_charset, has_viewport, has_description, has_favicon, has_meaningful_title])
        score = 25 if meta_score >= 4 else 20 if meta_score >= 3 else 10 if meta_score >= 2 else 0
        
        results.add_test("Basic Functionality", "Meta Tags & SEO", score, 25,
                        f"Charset: {'✓' if has_charset else '✗'} | Viewport: {'✓' if has_viewport else '✗'} | Description: {'✓' if has_description else '✗'} | Favicon: {'✓' if has_favicon else '✗'} | Title: '{title_text[:30]}...'")
        print_test("Meta Tags & SEO", meta_score >= 4, score, 25,
                   f"Charset: {'✓' if has_charset else '✗'} | Viewport: {'✓' if has_viewport else '✗'} | Description: {'✓' if has_description else '✗'} | Favicon: {'✓' if has_favicon else '✗'} | Title: '{title_text[:30]}...'")
    else:
        results.add_test("Basic Functionality", "Meta Tags & SEO", 0, 25, "No HTML content")
        print_test("Meta Tags & SEO", False, 0, 25, "No HTML content")
except Exception as e:
    results.add_test("Basic Functionality", "Meta Tags & SEO", 0, 25, str(e))
    print_test("Meta Tags & SEO", False, 0, 25, str(e))

# Test 1.4: JavaScript and CSS Resources
try:
    if main_html:
        # Find script tags
        script_tags = re.findall(r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>', main_html, re.IGNORECASE)
        inline_scripts = re.findall(r'<script[^>]*>(?!.*src=)', main_html, re.IGNORECASE)
        
        # Find CSS links
        css_links = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', main_html, re.IGNORECASE)
        css_links += re.findall(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\']', main_html, re.IGNORECASE)
        
        # Find style tags
        style_tags = len(re.findall(r'<style[^>]*>', main_html, re.IGNORECASE))
        
        has_external_js = len(script_tags) > 0
        has_external_css = len(css_links) > 0
        has_resources = has_external_js or has_external_css or len(inline_scripts) > 0 or style_tags > 0
        
        score = 25 if has_external_js and has_external_css else 20 if has_resources else 0
        
        results.add_test("Basic Functionality", "JavaScript & CSS Resources", score, 25,
                        f"External JS: {len(script_tags)} | External CSS: {len(css_links)} | Inline JS: {len(inline_scripts)} | Style tags: {style_tags}")
        print_test("JavaScript & CSS Resources", has_external_js and has_external_css, score, 25,
                   f"External JS: {len(script_tags)} | External CSS: {len(css_links)} | Inline JS: {len(inline_scripts)} | Style tags: {style_tags}")
        
        # Store for later analysis
        js_files = script_tags
        css_files = css_links
        
    else:
        js_files = []
        css_files = []
        results.add_test("Basic Functionality", "JavaScript & CSS Resources", 0, 25, "No HTML content")
        print_test("JavaScript & CSS Resources", False, 0, 25, "No HTML content")
except Exception as e:
    js_files = []
    css_files = []
    results.add_test("Basic Functionality", "JavaScript & CSS Resources", 0, 25, str(e))
    print_test("JavaScript & CSS Resources", False, 0, 25, str(e))
# ============================================================================
# CATEGORY 2: RESOURCE LOADING & PERFORMANCE (100 points)
# ============================================================================
print_header("2. RESOURCE LOADING & PERFORMANCE (100 points)")

# Test 2.1: JavaScript Files Loading
js_load_results = []
if js_files:
    for js_file in js_files[:3]:  # Test first 3 JS files
        try:
            js_url = urljoin(FRONTEND_URL, js_file)
            start = time.time()
            js_response = requests.get(js_url, timeout=10)
            elapsed = time.time() - start
            
            js_load_results.append({
                'url': js_file,
                'status': js_response.status_code,
                'size': len(js_response.text),
                'time': elapsed,
                'success': js_response.status_code == 200
            })
        except Exception as e:
            js_load_results.append({
                'url': js_file,
                'status': 0,
                'size': 0,
                'time': 0,
                'success': False,
                'error': str(e)
            })

successful_js = sum(1 for result in js_load_results if result['success'])
total_js = len(js_load_results)
avg_js_time = sum(result['time'] for result in js_load_results) / max(total_js, 1)

score = 25 if successful_js == total_js and avg_js_time < 2.0 else 20 if successful_js >= total_js * 0.8 else 10 if successful_js > 0 else 0

results.add_test("Resource Loading", "JavaScript Files", score, 25,
                f"Loaded: {successful_js}/{total_js} | Avg time: {avg_js_time:.3f}s")
print_test("JavaScript Files", successful_js == total_js, score, 25,
           f"Loaded: {successful_js}/{total_js} | Avg time: {avg_js_time:.3f}s")

# Test 2.2: CSS Files Loading
css_load_results = []
if css_files:
    for css_file in css_files[:3]:  # Test first 3 CSS files
        try:
            css_url = urljoin(FRONTEND_URL, css_file)
            start = time.time()
            css_response = requests.get(css_url, timeout=10)
            elapsed = time.time() - start
            
            css_load_results.append({
                'url': css_file,
                'status': css_response.status_code,
                'size': len(css_response.text),
                'time': elapsed,
                'success': css_response.status_code == 200
            })
        except Exception as e:
            css_load_results.append({
                'url': css_file,
                'status': 0,
                'size': 0,
                'time': 0,
                'success': False,
                'error': str(e)
            })

successful_css = sum(1 for result in css_load_results if result['success'])
total_css = len(css_load_results)
avg_css_time = sum(result['time'] for result in css_load_results) / max(total_css, 1)

score = 25 if successful_css == total_css and avg_css_time < 2.0 else 20 if successful_css >= total_css * 0.8 else 10 if successful_css > 0 else 0

results.add_test("Resource Loading", "CSS Files", score, 25,
                f"Loaded: {successful_css}/{total_css} | Avg time: {avg_css_time:.3f}s")
print_test("CSS Files", successful_css == total_css, score, 25,
           f"Loaded: {successful_css}/{total_css} | Avg time: {avg_css_time:.3f}s")

# Test 2.3: Static Assets
try:
    asset_tests = [
        ("/favicon.ico", "Favicon"),
        ("/manifest.json", "PWA Manifest"),
        ("/robots.txt", "SEO Robots"),
        ("/logo192.png", "Logo"),
        ("/logo512.png", "Large Logo")
    ]
    
    assets_working = 0
    asset_details = []
    
    for asset_path, asset_name in asset_tests:
        try:
            asset_url = urljoin(FRONTEND_URL, asset_path)
            asset_response = requests.get(asset_url, timeout=5)
            if asset_response.status_code == 200:
                assets_working += 1
                asset_details.append(f"{asset_name}: ✓")
            else:
                asset_details.append(f"{asset_name}: {asset_response.status_code}")
        except:
            asset_details.append(f"{asset_name}: ✗")
    
    score = 25 if assets_working >= 3 else 15 if assets_working >= 2 else 10 if assets_working >= 1 else 0
    
    results.add_test("Resource Loading", "Static Assets", score, 25,
                    f"Working: {assets_working}/5 | {' | '.join(asset_details[:3])}")
    print_test("Static Assets", assets_working >= 3, score, 25,
               f"Working: {assets_working}/5 | {' | '.join(asset_details[:3])}")
except Exception as e:
    results.add_test("Resource Loading", "Static Assets", 0, 25, str(e))
    print_test("Static Assets", False, 0, 25, str(e))

# Test 2.4: Performance Metrics
try:
    # Test multiple page loads for performance consistency
    load_times = []
    for i in range(3):
        start = time.time()
        response = requests.get(FRONTEND_URL, timeout=10)
        elapsed = time.time() - start
        if response.status_code == 200:
            load_times.append(elapsed)
        time.sleep(1)
    
    if load_times:
        avg_load_time = sum(load_times) / len(load_times)
        min_load_time = min(load_times)
        max_load_time = max(load_times)
        consistency = max_load_time - min_load_time
        
        score = 25 if avg_load_time < 2.0 and consistency < 1.0 else 20 if avg_load_time < 3.0 else 10 if avg_load_time < 5.0 else 0
        
        results.add_test("Resource Loading", "Performance Consistency", score, 25,
                        f"Avg: {avg_load_time:.3f}s | Min: {min_load_time:.3f}s | Max: {max_load_time:.3f}s | Variance: {consistency:.3f}s")
        print_test("Performance Consistency", avg_load_time < 2.0 and consistency < 1.0, score, 25,
                   f"Avg: {avg_load_time:.3f}s | Min: {min_load_time:.3f}s | Max: {max_load_time:.3f}s | Variance: {consistency:.3f}s")
    else:
        results.add_test("Resource Loading", "Performance Consistency", 0, 25, "No successful loads")
        print_test("Performance Consistency", False, 0, 25, "No successful loads")
except Exception as e:
    results.add_test("Resource Loading", "Performance Consistency", 0, 25, str(e))
    print_test("Performance Consistency", False, 0, 25, str(e))
# ============================================================================
# CATEGORY 3: CONTENT ANALYSIS & REACT DETECTION (100 points)
# ============================================================================
print_header("3. CONTENT ANALYSIS & REACT DETECTION (100 points)")

# Test 3.1: React Application Detection
try:
    if main_html:
        # Check for React indicators in HTML
        has_react_root = 'id="root"' in main_html or 'id="app"' in main_html
        has_react_scripts = any('react' in js_file.lower() for js_file in js_files)
        has_bundle_js = any('bundle' in js_file.lower() or 'main' in js_file.lower() for js_file in js_files)
        
        # Check for Vite indicators
        has_vite = 'vite' in main_html.lower()
        
        # Check for modern build indicators
        has_module_script = 'type="module"' in main_html.lower()
        
        react_indicators = sum([has_react_root, has_react_scripts, has_bundle_js, has_vite, has_module_script])
        score = 25 if react_indicators >= 3 else 20 if react_indicators >= 2 else 10 if react_indicators >= 1 else 0
        
        results.add_test("Content Analysis", "React App Detection", score, 25,
                        f"Root div: {'✓' if has_react_root else '✗'} | React scripts: {'✓' if has_react_scripts else '✗'} | Bundle: {'✓' if has_bundle_js else '✗'} | Vite: {'✓' if has_vite else '✗'} | Module: {'✓' if has_module_script else '✗'}")
        print_test("React App Detection", react_indicators >= 3, score, 25,
                   f"Root div: {'✓' if has_react_root else '✗'} | React scripts: {'✓' if has_react_scripts else '✗'} | Bundle: {'✓' if has_bundle_js else '✗'} | Vite: {'✓' if has_vite else '✗'} | Module: {'✓' if has_module_script else '✗'}")
    else:
        results.add_test("Content Analysis", "React App Detection", 0, 25, "No HTML content")
        print_test("React App Detection", False, 0, 25, "No HTML content")
except Exception as e:
    results.add_test("Content Analysis", "React App Detection", 0, 25, str(e))
    print_test("React App Detection", False, 0, 25, str(e))

# Test 3.2: Application Content Analysis
try:
    if main_html:
        content_lower = main_html.lower()
        
        # Check for application-specific content
        has_atomquest = 'atomquest' in content_lower
        has_goal_content = 'goal' in content_lower
        has_login_form = 'login' in content_lower or 'email' in content_lower or 'password' in content_lower
        has_navigation = 'nav' in content_lower or 'menu' in content_lower
        
        # Check for form elements
        has_input_fields = '<input' in content_lower
        has_buttons = '<button' in content_lower or 'type="submit"' in content_lower
        
        content_indicators = sum([has_atomquest, has_goal_content, has_login_form, has_navigation, has_input_fields, has_buttons])
        score = 25 if content_indicators >= 4 else 20 if content_indicators >= 3 else 10 if content_indicators >= 2 else 0
        
        results.add_test("Content Analysis", "Application Content", score, 25,
                        f"AtomQuest: {'✓' if has_atomquest else '✗'} | Goals: {'✓' if has_goal_content else '✗'} | Login: {'✓' if has_login_form else '✗'} | Nav: {'✓' if has_navigation else '✗'} | Inputs: {'✓' if has_input_fields else '✗'} | Buttons: {'✓' if has_buttons else '✗'}")
        print_test("Application Content", content_indicators >= 4, score, 25,
                   f"AtomQuest: {'✓' if has_atomquest else '✗'} | Goals: {'✓' if has_goal_content else '✗'} | Login: {'✓' if has_login_form else '✗'} | Nav: {'✓' if has_navigation else '✗'} | Inputs: {'✓' if has_input_fields else '✗'} | Buttons: {'✓' if has_buttons else '✗'}")
    else:
        results.add_test("Content Analysis", "Application Content", 0, 25, "No HTML content")
        print_test("Application Content", False, 0, 25, "No HTML content")
except Exception as e:
    results.add_test("Content Analysis", "Application Content", 0, 25, str(e))
    print_test("Application Content", False, 0, 25, str(e))

# Test 3.3: JavaScript Bundle Analysis
try:
    if js_files:
        # Analyze the main JavaScript bundle
        main_js_file = js_files[0] if js_files else None
        if main_js_file:
            js_url = urljoin(FRONTEND_URL, main_js_file)
            js_response = requests.get(js_url, timeout=15)
            
            if js_response.status_code == 200:
                js_content = js_response.text.lower()
                
                # Check for React/framework indicators in bundle
                has_react_in_bundle = 'react' in js_content
                has_router = 'router' in js_content or 'route' in js_content
                has_api_calls = 'api' in js_content or 'axios' in js_content or 'fetch' in js_content
                has_auth = 'auth' in js_content or 'token' in js_content or 'login' in js_content
                has_components = 'component' in js_content or 'element' in js_content
                
                bundle_indicators = sum([has_react_in_bundle, has_router, has_api_calls, has_auth, has_components])
                score = 25 if bundle_indicators >= 4 else 20 if bundle_indicators >= 3 else 10 if bundle_indicators >= 2 else 0
                
                results.add_test("Content Analysis", "JavaScript Bundle Analysis", score, 25,
                                f"React: {'✓' if has_react_in_bundle else '✗'} | Router: {'✓' if has_router else '✗'} | API: {'✓' if has_api_calls else '✗'} | Auth: {'✓' if has_auth else '✗'} | Components: {'✓' if has_components else '✗'}")
                print_test("JavaScript Bundle Analysis", bundle_indicators >= 4, score, 25,
                           f"React: {'✓' if has_react_in_bundle else '✗'} | Router: {'✓' if has_router else '✗'} | API: {'✓' if has_api_calls else '✗'} | Auth: {'✓' if has_auth else '✗'} | Components: {'✓' if has_components else '✗'}")
            else:
                results.add_test("Content Analysis", "JavaScript Bundle Analysis", 0, 25, f"Bundle not accessible: {js_response.status_code}")
                print_test("JavaScript Bundle Analysis", False, 0, 25, f"Bundle not accessible: {js_response.status_code}")
        else:
            results.add_test("Content Analysis", "JavaScript Bundle Analysis", 0, 25, "No JS files found")
            print_test("JavaScript Bundle Analysis", False, 0, 25, "No JS files found")
    else:
        results.add_test("Content Analysis", "JavaScript Bundle Analysis", 0, 25, "No JS files to analyze")
        print_test("JavaScript Bundle Analysis", False, 0, 25, "No JS files to analyze")
except Exception as e:
    results.add_test("Content Analysis", "JavaScript Bundle Analysis", 0, 25, str(e))
    print_test("JavaScript Bundle Analysis", False, 0, 25, str(e))

# Test 3.4: CSS Analysis
try:
    if css_files:
        # Analyze the main CSS file
        main_css_file = css_files[0] if css_files else None
        if main_css_file:
            css_url = urljoin(FRONTEND_URL, main_css_file)
            css_response = requests.get(css_url, timeout=10)
            
            if css_response.status_code == 200:
                css_content = css_response.text.lower()
                
                # Check for modern CSS features
                has_flexbox = 'flex' in css_content or 'display:flex' in css_content
                has_grid = 'grid' in css_content or 'display:grid' in css_content
                has_responsive = '@media' in css_content
                has_animations = 'animation' in css_content or 'transition' in css_content
                has_custom_props = '--' in css_content or 'var(' in css_content
                
                css_indicators = sum([has_flexbox, has_grid, has_responsive, has_animations, has_custom_props])
                score = 25 if css_indicators >= 3 else 20 if css_indicators >= 2 else 10 if css_indicators >= 1 else 0
                
                results.add_test("Content Analysis", "CSS Features Analysis", score, 25,
                                f"Flexbox: {'✓' if has_flexbox else '✗'} | Grid: {'✓' if has_grid else '✗'} | Responsive: {'✓' if has_responsive else '✗'} | Animations: {'✓' if has_animations else '✗'} | Custom Props: {'✓' if has_custom_props else '✗'}")
                print_test("CSS Features Analysis", css_indicators >= 3, score, 25,
                           f"Flexbox: {'✓' if has_flexbox else '✗'} | Grid: {'✓' if has_grid else '✗'} | Responsive: {'✓' if has_responsive else '✗'} | Animations: {'✓' if has_animations else '✗'} | Custom Props: {'✓' if has_custom_props else '✗'}")
            else:
                results.add_test("Content Analysis", "CSS Features Analysis", 0, 25, f"CSS not accessible: {css_response.status_code}")
                print_test("CSS Features Analysis", False, 0, 25, f"CSS not accessible: {css_response.status_code}")
        else:
            results.add_test("Content Analysis", "CSS Features Analysis", 0, 25, "No CSS files found")
            print_test("CSS Features Analysis", False, 0, 25, "No CSS files found")
    else:
        results.add_test("Content Analysis", "CSS Features Analysis", 0, 25, "No CSS files to analyze")
        print_test("CSS Features Analysis", False, 0, 25, "No CSS files to analyze")
except Exception as e:
    results.add_test("Content Analysis", "CSS Features Analysis", 0, 25, str(e))
    print_test("CSS Features Analysis", False, 0, 25, str(e))
# ============================================================================
# CATEGORY 4: SECURITY & HEADERS (100 points)
# ============================================================================
print_header("4. SECURITY & HEADERS (100 points)")

# Test 4.1: Security Headers
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        headers = {k.lower(): v for k, v in response.headers.items()}
        
        # Check for security headers
        has_csp = 'content-security-policy' in headers
        has_xframe = 'x-frame-options' in headers
        has_xss = 'x-xss-protection' in headers
        has_content_type = 'x-content-type-options' in headers
        has_hsts = 'strict-transport-security' in headers
        has_referrer = 'referrer-policy' in headers
        
        security_headers = sum([has_csp, has_xframe, has_xss, has_content_type, has_hsts, has_referrer])
        score = 25 if security_headers >= 4 else 20 if security_headers >= 3 else 15 if security_headers >= 2 else 10 if security_headers >= 1 else 0
        
        results.add_test("Security", "Security Headers", score, 25,
                        f"CSP: {'✓' if has_csp else '✗'} | X-Frame: {'✓' if has_xframe else '✗'} | XSS: {'✓' if has_xss else '✗'} | Content-Type: {'✓' if has_content_type else '✗'} | HSTS: {'✓' if has_hsts else '✗'} | Referrer: {'✓' if has_referrer else '✗'}")
        print_test("Security Headers", security_headers >= 4, score, 25,
                   f"CSP: {'✓' if has_csp else '✗'} | X-Frame: {'✓' if has_xframe else '✗'} | XSS: {'✓' if has_xss else '✗'} | Content-Type: {'✓' if has_content_type else '✗'} | HSTS: {'✓' if has_hsts else '✗'} | Referrer: {'✓' if has_referrer else '✗'}")
    else:
        results.add_test("Security", "Security Headers", 0, 25, "Frontend not accessible")
        print_test("Security Headers", False, 0, 25, "Frontend not accessible")
except Exception as e:
    results.add_test("Security", "Security Headers", 0, 25, str(e))
    print_test("Security Headers", False, 0, 25, str(e))

# Test 4.2: HTTPS and SSL
try:
    parsed_url = urlparse(FRONTEND_URL)
    is_https = parsed_url.scheme == 'https'
    
    if is_https:
        # Test SSL certificate
        import ssl
        import socket
        
        context = ssl.create_default_context()
        with socket.create_connection((parsed_url.hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=parsed_url.hostname) as ssock:
                cert = ssock.getpeercert()
                has_valid_cert = cert is not None
                
        score = 25 if has_valid_cert else 20
        
        results.add_test("Security", "HTTPS & SSL Certificate", score, 25,
                        f"HTTPS: ✓ | Valid Cert: {'✓' if has_valid_cert else '✗'}")
        print_test("HTTPS & SSL Certificate", has_valid_cert, score, 25,
                   f"HTTPS: ✓ | Valid Cert: {'✓' if has_valid_cert else '✗'}")
    else:
        results.add_test("Security", "HTTPS & SSL Certificate", 0, 25, "Not using HTTPS")
        print_test("HTTPS & SSL Certificate", False, 0, 25, "Not using HTTPS")
except Exception as e:
    # Fallback to basic HTTPS check
    is_https = FRONTEND_URL.startswith('https://')
    score = 15 if is_https else 0
    results.add_test("Security", "HTTPS & SSL Certificate", score, 25, f"HTTPS: {'✓' if is_https else '✗'} | Cert check failed: {str(e)}")
    print_test("HTTPS & SSL Certificate", is_https, score, 25, f"HTTPS: {'✓' if is_https else '✗'} | Cert check failed: {str(e)}")

# Test 4.3: Content Security Policy Analysis
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        csp_header = response.headers.get('Content-Security-Policy', '')
        
        if csp_header:
            # Analyze CSP directives
            has_default_src = 'default-src' in csp_header
            has_script_src = 'script-src' in csp_header
            has_style_src = 'style-src' in csp_header
            has_img_src = 'img-src' in csp_header
            blocks_inline = "'unsafe-inline'" not in csp_header
            
            csp_quality = sum([has_default_src, has_script_src, has_style_src, has_img_src, blocks_inline])
            score = 25 if csp_quality >= 4 else 20 if csp_quality >= 3 else 15 if csp_quality >= 2 else 10 if csp_quality >= 1 else 0
            
            results.add_test("Security", "Content Security Policy", score, 25,
                            f"Default: {'✓' if has_default_src else '✗'} | Script: {'✓' if has_script_src else '✗'} | Style: {'✓' if has_style_src else '✗'} | Image: {'✓' if has_img_src else '✗'} | Blocks inline: {'✓' if blocks_inline else '✗'}")
            print_test("Content Security Policy", csp_quality >= 4, score, 25,
                       f"Default: {'✓' if has_default_src else '✗'} | Script: {'✓' if has_script_src else '✗'} | Style: {'✓' if has_style_src else '✗'} | Image: {'✓' if has_img_src else '✗'} | Blocks inline: {'✓' if blocks_inline else '✗'}")
        else:
            results.add_test("Security", "Content Security Policy", 0, 25, "No CSP header found")
            print_test("Content Security Policy", False, 0, 25, "No CSP header found")
    else:
        results.add_test("Security", "Content Security Policy", 0, 25, "Frontend not accessible")
        print_test("Content Security Policy", False, 0, 25, "Frontend not accessible")
except Exception as e:
    results.add_test("Security", "Content Security Policy", 0, 25, str(e))
    print_test("Content Security Policy", False, 0, 25, str(e))

# Test 4.4: Cookie Security
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        cookies = response.cookies
        
        if cookies:
            secure_cookies = 0
            httponly_cookies = 0
            samesite_cookies = 0
            
            for cookie in cookies:
                if cookie.secure:
                    secure_cookies += 1
                if hasattr(cookie, 'has_nonstandard_attr') and cookie.has_nonstandard_attr('HttpOnly'):
                    httponly_cookies += 1
                if hasattr(cookie, 'has_nonstandard_attr') and cookie.has_nonstandard_attr('SameSite'):
                    samesite_cookies += 1
            
            total_cookies = len(cookies)
            cookie_security_score = (secure_cookies + httponly_cookies + samesite_cookies) / max(total_cookies * 3, 1)
            
            score = 25 if cookie_security_score >= 0.8 else 20 if cookie_security_score >= 0.6 else 15 if cookie_security_score >= 0.4 else 10 if total_cookies > 0 else 25  # No cookies is also secure
            
            results.add_test("Security", "Cookie Security", score, 25,
                            f"Total: {total_cookies} | Secure: {secure_cookies} | HttpOnly: {httponly_cookies} | SameSite: {samesite_cookies}")
            print_test("Cookie Security", cookie_security_score >= 0.8 or total_cookies == 0, score, 25,
                       f"Total: {total_cookies} | Secure: {secure_cookies} | HttpOnly: {httponly_cookies} | SameSite: {samesite_cookies}")
        else:
            # No cookies is actually good for security
            results.add_test("Security", "Cookie Security", 25, 25, "No cookies set (secure)")
            print_test("Cookie Security", True, 25, 25, "No cookies set (secure)")
    else:
        results.add_test("Security", "Cookie Security", 0, 25, "Frontend not accessible")
        print_test("Cookie Security", False, 0, 25, "Frontend not accessible")
except Exception as e:
    results.add_test("Security", "Cookie Security", 0, 25, str(e))
    print_test("Cookie Security", False, 0, 25, str(e))
# ============================================================================
# CATEGORY 5: API INTEGRATION & CONFIGURATION (100 points)
# ============================================================================
print_header("5. API INTEGRATION & CONFIGURATION (100 points)")

# Test 5.1: Backend URL Configuration Detection
try:
    backend_detected = False
    config_method = "None"
    
    # Check HTML for backend URL
    if main_html and BACKEND_URL in main_html:
        backend_detected = True
        config_method = "HTML"
    
    # Check JavaScript bundle for backend URL
    if not backend_detected and js_files:
        for js_file in js_files[:2]:  # Check first 2 JS files
            try:
                js_url = urljoin(FRONTEND_URL, js_file)
                js_response = requests.get(js_url, timeout=10)
                if js_response.status_code == 200 and BACKEND_URL in js_response.text:
                    backend_detected = True
                    config_method = "JavaScript Bundle"
                    break
            except:
                continue
    
    # Check for environment variable patterns
    if not backend_detected and js_files:
        for js_file in js_files[:2]:
            try:
                js_url = urljoin(FRONTEND_URL, js_file)
                js_response = requests.get(js_url, timeout=10)
                if js_response.status_code == 200:
                    js_content = js_response.text.lower()
                    if 'vite_api_url' in js_content or 'react_app_api_url' in js_content or 'api_url' in js_content:
                        backend_detected = True
                        config_method = "Environment Variables"
                        break
            except:
                continue
    
    score = 25 if backend_detected else 0
    
    results.add_test("API Integration", "Backend URL Configuration", score, 25,
                    f"Detected: {'✓' if backend_detected else '✗'} | Method: {config_method}")
    print_test("Backend URL Configuration", backend_detected, score, 25,
               f"Detected: {'✓' if backend_detected else '✗'} | Method: {config_method}")
except Exception as e:
    results.add_test("API Integration", "Backend URL Configuration", 0, 25, str(e))
    print_test("Backend URL Configuration", False, 0, 25, str(e))

# Test 5.2: API Call Patterns Detection
try:
    api_patterns_found = False
    api_methods = []
    
    if js_files:
        for js_file in js_files[:2]:
            try:
                js_url = urljoin(FRONTEND_URL, js_file)
                js_response = requests.get(js_url, timeout=10)
                if js_response.status_code == 200:
                    js_content = js_response.text.lower()
                    
                    # Check for API call patterns
                    if 'fetch(' in js_content or 'axios' in js_content:
                        api_patterns_found = True
                        if 'fetch(' in js_content:
                            api_methods.append('fetch')
                        if 'axios' in js_content:
                            api_methods.append('axios')
                    
                    # Check for HTTP methods
                    http_methods = []
                    if '.get(' in js_content or '"get"' in js_content:
                        http_methods.append('GET')
                    if '.post(' in js_content or '"post"' in js_content:
                        http_methods.append('POST')
                    if '.put(' in js_content or '"put"' in js_content:
                        http_methods.append('PUT')
                    if '.delete(' in js_content or '"delete"' in js_content:
                        http_methods.append('DELETE')
                    
                    if http_methods:
                        api_methods.extend(http_methods)
                    
                    break
            except:
                continue
    
    score = 25 if api_patterns_found and len(api_methods) >= 2 else 20 if api_patterns_found else 0
    
    results.add_test("API Integration", "API Call Patterns", score, 25,
                    f"Found: {'✓' if api_patterns_found else '✗'} | Methods: {', '.join(set(api_methods))}")
    print_test("API Call Patterns", api_patterns_found and len(api_methods) >= 2, score, 25,
               f"Found: {'✓' if api_patterns_found else '✗'} | Methods: {', '.join(set(api_methods))}")
except Exception as e:
    results.add_test("API Integration", "API Call Patterns", 0, 25, str(e))
    print_test("API Call Patterns", False, 0, 25, str(e))

# Test 5.3: Authentication Integration
try:
    auth_patterns_found = False
    auth_features = []
    
    if js_files:
        for js_file in js_files[:2]:
            try:
                js_url = urljoin(FRONTEND_URL, js_file)
                js_response = requests.get(js_url, timeout=10)
                if js_response.status_code == 200:
                    js_content = js_response.text.lower()
                    
                    # Check for authentication patterns
                    if 'authorization' in js_content or 'bearer' in js_content:
                        auth_patterns_found = True
                        auth_features.append('Bearer Token')
                    
                    if 'login' in js_content:
                        auth_features.append('Login')
                    
                    if 'token' in js_content:
                        auth_features.append('Token Management')
                    
                    if 'localstorage' in js_content or 'sessionstorage' in js_content:
                        auth_features.append('Local Storage')
                    
                    if 'logout' in js_content:
                        auth_features.append('Logout')
                    
                    break
            except:
                continue
    
    score = 25 if auth_patterns_found and len(auth_features) >= 3 else 20 if auth_patterns_found else 0
    
    results.add_test("API Integration", "Authentication Integration", score, 25,
                    f"Found: {'✓' if auth_patterns_found else '✗'} | Features: {', '.join(set(auth_features))}")
    print_test("Authentication Integration", auth_patterns_found and len(auth_features) >= 3, score, 25,
               f"Found: {'✓' if auth_patterns_found else '✗'} | Features: {', '.join(set(auth_features))}")
except Exception as e:
    results.add_test("API Integration", "Authentication Integration", 0, 25, str(e))
    print_test("Authentication Integration", False, 0, 25, str(e))

# Test 5.4: Error Handling & Loading States
try:
    error_handling_found = False
    loading_patterns = []
    
    if js_files:
        for js_file in js_files[:2]:
            try:
                js_url = urljoin(FRONTEND_URL, js_file)
                js_response = requests.get(js_url, timeout=10)
                if js_response.status_code == 200:
                    js_content = js_response.text.lower()
                    
                    # Check for error handling patterns
                    if 'catch' in js_content or 'error' in js_content:
                        error_handling_found = True
                        loading_patterns.append('Error Handling')
                    
                    if 'loading' in js_content or 'isloading' in js_content:
                        loading_patterns.append('Loading States')
                    
                    if 'try' in js_content and 'catch' in js_content:
                        loading_patterns.append('Try-Catch')
                    
                    if 'promise' in js_content or '.then(' in js_content:
                        loading_patterns.append('Promise Handling')
                    
                    if 'async' in js_content and 'await' in js_content:
                        loading_patterns.append('Async/Await')
                    
                    break
            except:
                continue
    
    score = 25 if error_handling_found and len(loading_patterns) >= 3 else 20 if error_handling_found else 0
    
    results.add_test("API Integration", "Error Handling & Loading States", score, 25,
                    f"Found: {'✓' if error_handling_found else '✗'} | Patterns: {', '.join(set(loading_patterns))}")
    print_test("Error Handling & Loading States", error_handling_found and len(loading_patterns) >= 3, score, 25,
               f"Found: {'✓' if error_handling_found else '✗'} | Patterns: {', '.join(set(loading_patterns))}")
except Exception as e:
    results.add_test("API Integration", "Error Handling & Loading States", 0, 25, str(e))
    print_test("Error Handling & Loading States", False, 0, 25, str(e))
# ============================================================================
# FINAL ANALYSIS & SCORING
# ============================================================================
print_header("FRONTEND DEEP ANALYSIS - FINAL RESULTS")

# Calculate scores by category
category_scores = {}
for category, tests in results.categories.items():
    category_score = sum(test["score"] for test in tests)
    category_max = sum(test["max_score"] for test in tests)
    category_scores[category] = {
        'score': category_score,
        'max': category_max,
        'percentage': category_score / category_max * 100 if category_max > 0 else 0
    }

print(f"\n{Colors.BOLD}DETAILED CATEGORY BREAKDOWN:{Colors.END}")
print(f"{'='*100}")

for category, data in category_scores.items():
    status_icon = "✅" if data['percentage'] >= 90 else "⚠️" if data['percentage'] >= 70 else "❌"
    print(f"{status_icon} {category:<30} | {data['score']:>3}/{data['max']:<3} ({data['percentage']:>5.1f}%)")

# Overall scoring
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

print(f"{'='*100}")
print(f"TOTAL FRONTEND SCORE: {results.total_score}/{results.max_score} ({percentage:.2f}%)")
print(f"\n{Colors.BOLD}{color}FINAL GRADE: {grade}{Colors.END}")
print(f"{Colors.BOLD}{color}STATUS: {status}{Colors.END}")

# Issue identification
print(f"\n{Colors.BOLD}ISSUE ANALYSIS:{Colors.END}")
print(f"{'='*100}")

issues_found = []
recommendations = []

for category, data in category_scores.items():
    if data['percentage'] < 70:
        issues_found.append(f"❌ {category}: {data['percentage']:.1f}% - Critical Issue")
        
        # Specific recommendations based on category
        if "Basic Functionality" in category:
            recommendations.append("• Check HTML structure and meta tags")
            recommendations.append("• Ensure proper DOCTYPE and semantic HTML")
        elif "Resource Loading" in category:
            recommendations.append("• Optimize JavaScript and CSS loading")
            recommendations.append("• Check static asset availability")
        elif "Content Analysis" in category:
            recommendations.append("• Verify React bundle contains expected patterns")
            recommendations.append("• Check if application content is properly rendered")
        elif "Security" in category:
            recommendations.append("• Add security headers (CSP, X-Frame-Options, etc.)")
            recommendations.append("• Implement HTTPS with proper SSL certificate")
        elif "API Integration" in category:
            recommendations.append("• Ensure backend URL is properly configured")
            recommendations.append("• Verify API call patterns and authentication")
    elif data['percentage'] < 90:
        issues_found.append(f"⚠️ {category}: {data['percentage']:.1f}% - Minor Issue")

if not issues_found:
    print(f"{Colors.GREEN}✅ No critical issues found! Frontend is performing excellently.{Colors.END}")
else:
    for issue in issues_found:
        print(issue)

if recommendations:
    print(f"\n{Colors.BOLD}RECOMMENDATIONS:{Colors.END}")
    for rec in recommendations:
        print(f"{Colors.YELLOW}{rec}{Colors.END}")

# Frontend readiness assessment
print(f"\n{Colors.BOLD}FRONTEND READINESS ASSESSMENT:{Colors.END}")
print(f"{'='*100}")

readiness_criteria = [
    ("HTML Structure Valid", category_scores.get("Basic Functionality", {}).get('percentage', 0) >= 80, 20),
    ("Resources Loading", category_scores.get("Resource Loading", {}).get('percentage', 0) >= 70, 20),
    ("React App Detected", category_scores.get("Content Analysis", {}).get('percentage', 0) >= 60, 15),
    ("Security Headers", category_scores.get("Security", {}).get('percentage', 0) >= 50, 15),
    ("API Integration", category_scores.get("API Integration", {}).get('percentage', 0) >= 60, 15),
    ("Overall Performance", percentage >= 75, 15)
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
print(f"FRONTEND READINESS: {total_readiness}/{max_readiness} ({readiness_pct:.1f}%)")

if readiness_pct >= 90:
    print(f"{Colors.GREEN}{Colors.BOLD}🏆 FRONTEND EXCELLENT - Production Ready!{Colors.END}")
elif readiness_pct >= 80:
    print(f"{Colors.GREEN}{Colors.BOLD}🎯 FRONTEND GOOD - Minor improvements needed{Colors.END}")
elif readiness_pct >= 70:
    print(f"{Colors.YELLOW}{Colors.BOLD}👍 FRONTEND ACCEPTABLE - Some issues to address{Colors.END}")
else:
    print(f"{Colors.RED}{Colors.BOLD}⚠️ FRONTEND NEEDS WORK - Critical issues found{Colors.END}")

print(f"\n{Colors.CYAN}Frontend analysis completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
print(f"{Colors.CYAN}Total analysis duration: {(datetime.now() - results.start_time).total_seconds():.1f} seconds{Colors.END}")
print(f"{Colors.CYAN}Report generated by: Frontend Deep Analysis Suite v1.0{Colors.END}")

# Summary for comparison with backend
print(f"\n{Colors.BOLD}🎯 FRONTEND SUMMARY:{Colors.END}")
print(f"Score: {results.total_score}/{results.max_score} ({percentage:.2f}%)")
print(f"Grade: {grade}")
print(f"Status: {status}")
print(f"Readiness: {readiness_pct:.1f}%")

# Key findings
print(f"\n{Colors.BOLD}KEY FINDINGS:{Colors.END}")
if percentage >= 85:
    print(f"{Colors.GREEN}• Frontend is performing well overall{Colors.END}")
if category_scores.get("Basic Functionality", {}).get('percentage', 0) >= 80:
    print(f"{Colors.GREEN}• HTML structure and basic functionality are solid{Colors.END}")
if category_scores.get("Resource Loading", {}).get('percentage', 0) >= 80:
    print(f"{Colors.GREEN}• Resource loading is optimized{Colors.END}")
if category_scores.get("Content Analysis", {}).get('percentage', 0) < 70:
    print(f"{Colors.YELLOW}• React/content detection needs improvement (likely due to bundling){Colors.END}")
if category_scores.get("Security", {}).get('percentage', 0) < 70:
    print(f"{Colors.YELLOW}• Security headers missing (common for static hosting){Colors.END}")
if category_scores.get("API Integration", {}).get('percentage', 0) < 70:
    print(f"{Colors.YELLOW}• API integration patterns not clearly visible in bundle{Colors.END}")

print(f"\n{Colors.BOLD}CONCLUSION:{Colors.END}")
if percentage >= 80:
    print(f"{Colors.GREEN}Frontend is ready for production deployment with minor optimizations.{Colors.END}")
elif percentage >= 70:
    print(f"{Colors.YELLOW}Frontend is functional but needs some improvements for optimal performance.{Colors.END}")
else:
    print(f"{Colors.RED}Frontend has critical issues that should be addressed before deployment.{Colors.END}")