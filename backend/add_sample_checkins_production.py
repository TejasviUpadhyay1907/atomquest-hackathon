#!/usr/bin/env python3
"""
Add sample check-ins to PRODUCTION database (Supabase)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.goal import Goal
from app.models.check_in import CheckIn
from datetime import datetime, timedelta
import random

# Production database URL
DATABASE_URL = "postgresql://postgres:tejasvi%40190701@db.fuclgltwplxyzoftudbp.supabase.co:5432/postgres"

def add_sample_checkins():
    # Create engine for production database
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("🎯 Adding Sample Check-ins to PRODUCTION Database...")
        print("=" * 60)
        
        # Get all approved goals
        goals = db.query(Goal).filter(Goal.status == "Approved").all()
        
        if not goals:
            print("❌ No approved goals found in production database.")
            return
        
        print(f"✅ Found {len(goals)} approved goals in production")
        
        # Add check-ins for each goal across all quarters
        quarters = ["Q1", "Q2", "Q3", "Q4"]
        checkins_added = 0
        
        for goal in goals:
            print(f"\n📊 Adding check-ins for goal: {goal.title}")
            
            # Simulate progress across quarters
            cumulative_progress = 0
            
            for i, quarter in enumerate(quarters):
                # Check if check-in already exists
                existing = db.query(CheckIn).filter(
                    CheckIn.goal_id == goal.id,
                    CheckIn.quarter == quarter
                ).first()
                
                if existing:
                    print(f"  ⏭️  {quarter}: Already exists (skipping)")
                    continue
                
                # Calculate realistic progress
                if i == 0:  # Q1
                    progress_increase = random.randint(15, 30)
                elif i == 1:  # Q2
                    progress_increase = random.randint(20, 35)
                elif i == 2:  # Q3
                    progress_increase = random.randint(15, 25)
                else:  # Q4
                    progress_increase = 100 - cumulative_progress  # Complete in Q4
                
                cumulative_progress = min(cumulative_progress + progress_increase, 100)
                
                # Calculate current value based on UoM type
                if goal.uom_type == "Percentage":
                    current_value = cumulative_progress
                elif goal.uom_type == "Number (Min is Best)":
                    # For min, lower is better - start high and decrease
                    current_value = goal.target + (100 - cumulative_progress) * 0.5
                elif goal.uom_type == "Number (Max is Best)":
                    # For max, higher is better
                    current_value = goal.target * (cumulative_progress / 100)
                else:  # Timeline
                    current_value = cumulative_progress
                
                # Create check-in
                checkin = CheckIn(
                    goal_id=goal.id,
                    quarter=quarter,
                    planned_target=str(goal.target),
                    actual_achievement=str(round(current_value, 2)),
                    status="Completed" if cumulative_progress >= 100 else "On Track" if cumulative_progress > 0 else "Not Started",
                    progress_score=float(cumulative_progress),
                    manager_comment=f"Q{i+1} progress update - {cumulative_progress}% complete. " + 
                                  (f"Minor challenges in {quarter}" if cumulative_progress < 80 else "Excellent progress!"),
                    created_at=datetime.now() - timedelta(days=(4-i)*30)  # Spread across time
                )
                
                db.add(checkin)
                checkins_added += 1
                print(f"  ✅ {quarter}: {cumulative_progress}% (achievement: {current_value})")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print(f"🎉 Successfully added {checkins_added} check-ins to PRODUCTION!")
        print("=" * 60)
        
        # Verify data
        total_checkins = db.query(CheckIn).count()
        print(f"\n📊 Total check-ins in PRODUCTION database: {total_checkins}")
        
        # Show summary by quarter
        print("\n📈 Check-ins by Quarter:")
        for quarter in quarters:
            count = db.query(CheckIn).filter(CheckIn.quarter == quarter).count()
            print(f"  {quarter}: {count} check-ins")
        
        print("\n✅ Analytics Dashboard should now show data!")
        print("   Refresh your browser to see the changes.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_checkins()
