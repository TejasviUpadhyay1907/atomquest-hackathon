#!/usr/bin/env python3
"""Final comprehensive test - simplified"""

import requests

BASE_URL = "https://atomquest-backend-33sg.onrender.com"

print("🎯 FINAL COMPREHENSIVE TEST\n")
print("="*60)

score = 0
max_score = 0

# 1. Authentication (50 points)
print("\n1️⃣ AUTHENTICATION")
max_score += 50
try:
    # Admin
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email":"admin@demo.com","password":"password123"}, timeout=10)
    if r.status_code == 200:
        admin_token = r.json()["access_token"]
        print("   ✅ Admin login (10)")
        score += 10
    
    # Manager
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email":"manager@demo.com","password":"password123"}, timeout=10)
    if r.status_code == 200:
        manager_token = r.json()["access_token"]
        print("   ✅ Manager login (10)")
        score += 10
    
    # Employee
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email":"emp1@demo.com","password":"password123"}, timeout=10)
    if r.status_code == 200:
        employee_token = r.json()["access_token"]
        print("   ✅ Employee login (10)")
        score += 10
    
    # Invalid login
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email":"bad@test.com","password":"wrong"}, timeout=10)
    if r.status_code == 401:
        print("   ✅ Invalid login rejected (10)")
        score += 10
    
    # Health check
    r = requests.get(f"{BASE_URL}/health", timeout=10)
    if r.status_code == 200:
        print("   ✅ Health check (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 2. Admin Features (30 points)
print("\n2️⃣ ADMIN FEATURES")
max_score += 30
try:
    r = requests.get(f"{BASE_URL}/api/admin/users", headers={"Authorization":f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Get users ({len(r.json())} users) (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/admin/stats", headers={"Authorization":f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ System stats (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/admin/audit-logs", headers={"Authorization":f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Audit logs ({len(r.json())} entries) (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 3. Manager Features (30 points)
print("\n3️⃣ MANAGER FEATURES")
max_score += 30
try:
    r = requests.get(f"{BASE_URL}/api/manager/team", headers={"Authorization":f"Bearer {manager_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Team members ({len(r.json())} members) (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/manager/team-goals", headers={"Authorization":f"Bearer {manager_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Team goals ({len(r.json())} goals) (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/manager/team-performance", headers={"Authorization":f"Bearer {manager_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ Team performance (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 4. Employee Features (30 points)
print("\n4️⃣ EMPLOYEE FEATURES")
max_score += 30
try:
    r = requests.get(f"{BASE_URL}/api/goals/my-goals", headers={"Authorization":f"Bearer {employee_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ My goals ({len(r.json())} goals) (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/goals/validation/check", headers={"Authorization":f"Bearer {employee_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ Validation check (10)")
        score += 10
    
    r = requests.get(f"{BASE_URL}/api/checkins/my-checkins", headers={"Authorization":f"Bearer {employee_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ Check-ins (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 5. AI Features (10 points)
print("\n5️⃣ AI FEATURES")
max_score += 10
try:
    r = requests.post(f"{BASE_URL}/api/ai/suggest-goals?role=Employee&department=Engineering", headers={"Authorization":f"Bearer {employee_token}"}, timeout=30)
    if r.status_code == 200 and r.json().get("count", 0) > 0:
        print(f"   ✅ AI suggestions ({r.json()['count']} suggestions) (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 6. Reports (10 points)
print("\n6️⃣ REPORTS")
max_score += 10
try:
    r = requests.get(f"{BASE_URL}/api/reports/goal-progress", headers={"Authorization":f"Bearer {manager_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ Goal progress report (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 7. Notifications (10 points)
print("\n7️⃣ NOTIFICATIONS")
max_score += 10
try:
    r = requests.get(f"{BASE_URL}/api/notifications/", headers={"Authorization":f"Bearer {employee_token}"}, timeout=10)
    if r.status_code == 200:
        print("   ✅ Notifications (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 8. Templates (10 points)
print("\n8️⃣ TEMPLATES")
max_score += 10
try:
    r = requests.get(f"{BASE_URL}/api/templates/", headers={"Authorization":f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Templates ({len(r.json())} templates) (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 9. Thrust Areas (10 points)
print("\n9️⃣ THRUST AREAS")
max_score += 10
try:
    r = requests.get(f"{BASE_URL}/api/thrust-areas/", headers={"Authorization":f"Bearer {employee_token}"}, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Thrust areas ({len(r.json())} areas) (10)")
        score += 10
except Exception as e:
    print(f"   ❌ Error: {e}")

# 10. Security (10 points)
print("\n🔒 SECURITY")
max_score += 10
try:
    r = requests.get(f"{BASE_URL}/api/admin/users", timeout=10)
    if r.status_code in [401, 403]:
        print("   ✅ Unauthorized access blocked (5)")
        score += 5
    
    r = requests.get(f"{BASE_URL}/api/goals/my-goals", headers={"Authorization":"Bearer fake_token"}, timeout=10)
    if r.status_code in [401, 403]:
        print("   ✅ Invalid token rejected (5)")
        score += 5
except Exception as e:
    print(f"   ❌ Error: {e}")

# Final Score
print("\n" + "="*60)
print(f"🎯 FINAL SCORE: {score}/{max_score} ({score/max_score*100:.1f}%)")
print("="*60)

if score >= max_score * 0.95:
    print("🏆 GRADE: A+ (Excellent) - READY FOR SUBMISSION!")
elif score >= max_score * 0.90:
    print("🏆 GRADE: A (Excellent) - READY FOR SUBMISSION!")
elif score >= max_score * 0.85:
    print("✅ GRADE: A- (Very Good) - READY FOR SUBMISSION!")
elif score >= max_score * 0.80:
    print("✅ GRADE: B+ (Good) - READY FOR SUBMISSION!")
else:
    print("⚠️  GRADE: B or lower - Needs more work")

print()
