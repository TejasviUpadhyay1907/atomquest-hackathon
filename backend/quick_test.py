#!/usr/bin/env python3
"""Quick test script for tomorrow's fixes"""

import requests
import json

BASE_URL = "https://atomquest-backend-33sg.onrender.com"

print("🧪 QUICK TEST SUITE\n")
print("="*60)

# Get tokens
print("\n1. Getting authentication tokens...")
tokens = {}
for role, email in [("admin", "admin@demo.com"), ("manager", "manager@demo.com"), ("employee", "emp1@demo.com")]:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": "password123"}
    )
    if response.status_code == 200:
        tokens[role] = response.json()["access_token"]
        print(f"   ✅ {role.capitalize()} token obtained")
    else:
        print(f"   ❌ {role.capitalize()} login failed")

# Test AI suggestions
print("\n2. Testing AI Goal Suggestions...")
if "employee" in tokens:
    response = requests.post(
        f"{BASE_URL}/api/ai/suggest-goals",
        json={"role": "Employee", "department": "Engineering"},
        headers={"Authorization": f"Bearer {tokens['employee']}"}
    )
    if response.status_code == 200:
        suggestions = response.json().get("suggestions", [])
        print(f"   ✅ AI working - {len(suggestions)} suggestions")
    else:
        print(f"   ❌ AI failed - {response.status_code}")

# Test goal creation
print("\n3. Testing Goal Creation...")
if "employee" in tokens:
    goal_data = {
        "title": "Test Goal - Quick Check",
        "description": "Testing goal creation",
        "thrust_area_id": 1,
        "uom_type": "Percentage",
        "target": 100,
        "weightage": 15
    }
    response = requests.post(
        f"{BASE_URL}/api/goals/",
        json=goal_data,
        headers={"Authorization": f"Bearer {tokens['employee']}"}
    )
    if response.status_code in [200, 201]:
        print(f"   ✅ Goal creation working")
    else:
        print(f"   ❌ Goal creation failed - {response.status_code}")
        print(f"      Error: {response.text[:100]}")

# Test reports
print("\n4. Testing Reports...")
if "manager" in tokens:
    response = requests.get(
        f"{BASE_URL}/api/reports/goal-progress",
        headers={"Authorization": f"Bearer {tokens['manager']}"}
    )
    if response.status_code == 200:
        print(f"   ✅ Reports working")
    else:
        print(f"   ❌ Reports failed - {response.status_code}")

# Test audit logs
print("\n5. Testing Audit Logs...")
if "admin" in tokens:
    response = requests.get(
        f"{BASE_URL}/api/admin/audit-logs",
        headers={"Authorization": f"Bearer {tokens['admin']}"}
    )
    if response.status_code == 200:
        logs = response.json()
        print(f"   ✅ Audit logs working - {len(logs)} entries")
    else:
        print(f"   ❌ Audit logs failed - {response.status_code}")

# Test team members
print("\n6. Testing Manager Team...")
if "manager" in tokens:
    response = requests.get(
        f"{BASE_URL}/api/manager/team",
        headers={"Authorization": f"Bearer {tokens['manager']}"}
    )
    if response.status_code == 200:
        team = response.json()
        print(f"   ✅ Team endpoint working - {len(team)} members")
    else:
        print(f"   ❌ Team failed - {response.status_code}")

print("\n" + "="*60)
print("✅ QUICK TEST COMPLETE!")
print("="*60)
