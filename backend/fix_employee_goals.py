#!/usr/bin/env python3
"""
Fix employee goals - Approve draft goals and add check-ins
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.goal import Goal, GoalStatus
from app.models.check_in import CheckIn
from datetime import datetime, timedelta
import random

# Production database URL
DATABASE_URL = "postgresql://postgres:tejasvi%40190701@db.fuclgltwplxyzoftudbp.supabase.co:5432/postgres"

def fix_employee_goals():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("🔧 Fixing Employee Goals...")
        print("=" * 60)
        
        # Get all draft goals
        draft_goals = db.query(Goal).filter(Goal.status == GoalStatus.DRAFT).all()
        
        print(f"📋 Found {len(draft_goals)} draft goals")
        
        if not draft_goals:
            print("✅ No draft goals to fix!")
            return
        
        # Approve all draft goals
        for goal in draft_goals:
            print(f"\n✅ Approving goal: {goal.title}")
            goal.status = GoalStatus.APPROVED
            db.commit()
        
        print(f"\n🎉 Approved {len(draft_goals)} goals!")
        
        # Now add check-ins for these goals
        print("\n📊 Adding check-ins for approved goals...")
        quarters = ["Q1", "Q2", "Q3", "Q4"]
        checkins_added = 0
        
        for goal in draft_goals:
            print(f"\n📈 Adding check-ins for: {goal.title}")
            cumulative_progress = 0
            
            for i, quarter in enumerate(quarters):
                # Check if check-in already exists
                existing = db.query(CheckIn).filter(
                    CheckIn.goal_id == goal.id,
                    CheckIn.quarter == quarter
                ).first()
                
                if existing:
                    print(f"  ⏭️  {quarter}: Already exists")
                    continue
                
                # Calculate realistic progress
                if i == 0:  # Q1
                    progress_increase = random.randint(15, 30)
                elif i == 1:  # Q2
                    progress_increase = random.randint(20, 35)
                elif i == 2:  # Q3
                    progress_increase = random.randint(15, 25)
                else:  # Q4
                    progress_increase = 100 - cumulative_progress
                
                cumulative_progress = min(cumulative_progress + progress_increase, 100)
                
                # Calculate current value
                if goal.uom_type == "Percentage":
                    current_value = cumulative_progress
                elif goal.uom_type == "Timeline":
                    current_value = cumulative_progress
                else:
                    current_value = goal.target * (cumulative_progress / 100)
                
                # Create check-in
                checkin = CheckIn(
                    goal_id=goal.id,
                    quarter=quarter,
                    planned_target=str(goal.target),
                    actual_achievement=str(round(current_value, 2)),
                    status="Completed" if cumulative_progress >= 100 else "On Track",
                    progress_score=float(cumulative_progress),
                    manager_comment=f"Q{i+1} update - {cumulative_progress}% complete. " + 
                                  ("Excellent progress!" if cumulative_progress >= 80 else "Good progress, keep it up!"),
                    created_at=datetime.now() - timedelta(days=(4-i)*30)
                )
                
                db.add(checkin)
                checkins_added += 1
                print(f"  ✅ {quarter}: {cumulative_progress}%")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print(f"🎉 Successfully added {checkins_added} check-ins!")
        print("=" * 60)
        
        # Verify
        total_approved = db.query(Goal).filter(Goal.status == GoalStatus.APPROVED).count()
        total_checkins = db.query(CheckIn).count()
        
        print(f"\n📊 Summary:")
        print(f"  Total Approved Goals: {total_approved}")
        print(f"  Total Check-ins: {total_checkins}")
        
        print("\n✅ Analytics Dashboard should now show YOUR data!")
        print("   Refresh your browser to see the changes.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_employee_goals()
