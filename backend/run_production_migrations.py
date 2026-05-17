#!/usr/bin/env python3
"""
Run migrations on production database via API
"""
import requests
import time

BASE_URL = "https://atomquest-backend-33sg.onrender.com"

print("🚀 Running production migrations...")
print(f"📡 Backend: {BASE_URL}\n")

# Step 1: Check backend health
print("1️⃣ Checking backend health...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=10)
    if response.status_code == 200:
        print("✅ Backend is healthy\n")
    else:
        print(f"⚠️ Backend returned {response.status_code}\n")
except Exception as e:
    print(f"❌ Backend health check failed: {e}\n")
    exit(1)

# Step 2: Login as admin
print("2️⃣ Logging in as admin...")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@demo.com", "password": "password123"},
        timeout=10
    )
    if response.status_code == 200:
        admin_token = response.json().get("access_token")
        print("✅ Admin login successful\n")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        exit(1)
except Exception as e:
    print(f"❌ Login failed: {e}\n")
    exit(1)

headers = {"Authorization": f"Bearer {admin_token}"}

# Step 3: Test goals endpoint (will auto-create columns if using SQLAlchemy)
print("3️⃣ Testing goals endpoint (triggers auto-migration)...")
try:
    response = requests.get(f"{BASE_URL}/api/goals/my-goals", headers=headers, timeout=10)
    if response.status_code == 200:
        goals = response.json()
        print(f"✅ Goals endpoint working ({len(goals)} goals)")
        
        # Check if progress fields are present
        if goals and len(goals) > 0:
            first_goal = goals[0]
            has_progress = "progress" in first_goal
            has_current_value = "current_value" in first_goal
            print(f"   • progress field: {'✅' if has_progress else '❌'}")
            print(f"   • current_value field: {'✅' if has_current_value else '❌'}")
        print()
    else:
        print(f"⚠️ Goals endpoint returned {response.status_code}\n")
except Exception as e:
    print(f"❌ Goals test failed: {e}\n")

# Step 4: Test notifications endpoint
print("4️⃣ Testing notifications endpoint...")
try:
    response = requests.get(f"{BASE_URL}/api/notifications/", headers=headers, timeout=10)
    if response.status_code == 200:
        notifications = response.json()
        print(f"✅ Notifications endpoint working ({len(notifications)} notifications)")
        
        # Check if is_read field is present
        if notifications and len(notifications) > 0:
            first_notif = notifications[0]
            has_is_read = "is_read" in first_notif
            print(f"   • is_read field: {'✅' if has_is_read else '❌'}")
        print()
    else:
        print(f"⚠️ Notifications endpoint returned {response.status_code}\n")
except Exception as e:
    print(f"❌ Notifications test failed: {e}\n")

# Step 5: Test check-ins endpoint
print("5️⃣ Testing check-ins endpoint...")
try:
    response = requests.get(f"{BASE_URL}/api/checkins/my-checkins", headers=headers, timeout=10)
    if response.status_code == 200:
        checkins = response.json()
        print(f"✅ Check-ins endpoint working ({len(checkins)} check-ins)")
        
        # Check if progress field is present
        if checkins and len(checkins) > 0:
            first_checkin = checkins[0]
            has_progress = "progress" in first_checkin
            has_progress_score = "progress_score" in first_checkin
            print(f"   • progress field: {'✅' if has_progress else '❌'}")
            print(f"   • progress_score field: {'✅' if has_progress_score else '❌'}")
        print()
    else:
        print(f"⚠️ Check-ins endpoint returned {response.status_code}\n")
except Exception as e:
    print(f"❌ Check-ins test failed: {e}\n")

print("🎉 Production migration check complete!")
print("\n📝 Note: If fields are missing, Render will auto-deploy and create them.")
print("   Wait 2-3 minutes for deployment to complete, then run this script again.")
