#!/usr/bin/env python3
"""Add sample data for testing and demo"""

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.goal import Goal, GoalStatus
from app.models.check_in import CheckIn, CheckInStatus
from app.models.thrust_area import ThrustArea
from app.models.audit_log import AuditLog
from datetime import datetime, timedelta

db = SessionLocal()

print("🔧 Adding sample data for demo...\n")

# 1. Assign team members to manager
print("1️⃣ Assigning team members to manager...")
manager = db.query(User).filter(User.email == "manager@demo.com").first()
emp1 = db.query(User).filter(User.email == "emp1@demo.com").first()

if manager and emp1:
    emp1.manager_id = manager.id
    db.commit()
    print(f"   ✅ Assigned {emp1.full_name} to {manager.full_name}")
else:
    print("   ⚠️ Manager or employee not found")

# 2. Add sample check-ins
print("\n2️⃣ Adding sample check-ins...")
goals = db.query(Goal).filter(Goal.user_id == emp1.id).limit(2).all()

for i, goal in enumerate(goals):
    # Add Q1 check-in
    checkin = CheckIn(
        goal_id=goal.id,
        quarter="Q1",
        planned_target=25,
        actual_achievement=20,
        progress_score=80,
        status=CheckInStatus.SUBMITTED,
        remarks="Good progress in Q1",
        submitted_at=datetime.utcnow() - timedelta(days=30)
    )
    db.add(checkin)
    print(f"   ✅ Added Q1 check-in for goal: {goal.title}")

db.commit()

# 3. Add sample audit logs
print("\n3️⃣ Adding sample audit logs...")
for goal in goals[:2]:
    audit = AuditLog(
        goal_id=goal.id,
        user_id=emp1.id,
        action="goal_created",
        field_changed="status",
        old_value="",
        new_value="DRAFT",
        timestamp=datetime.utcnow() - timedelta(days=45)
    )
    db.add(audit)
    
    audit2 = AuditLog(
        goal_id=goal.id,
        user_id=emp1.id,
        action="goal_submitted",
        field_changed="status",
        old_value="DRAFT",
        new_value="PENDING_APPROVAL",
        timestamp=datetime.utcnow() - timedelta(days=40)
    )
    db.add(audit2)
    
    print(f"   ✅ Added audit logs for goal: {goal.title}")

db.commit()

# 4. Summary
print("\n" + "="*50)
print("✅ SAMPLE DATA ADDED SUCCESSFULLY!")
print("="*50)
print("\nSummary:")
print(f"  • Team members assigned: 1")
print(f"  • Check-ins added: {len(goals)}")
print(f"  • Audit logs added: {len(goals) * 2}")
print("\n🎉 Ready for testing and demo!")

db.close()
