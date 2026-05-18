#!/usr/bin/env python3
"""
Prepare manager@demo.com for end-to-end demo:
- Balance goal weightages to 100%
- Approve draft/pending goals (admin skip-level)
- Add Q1 check-ins for approved goals missing them
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.models.check_in import CheckIn, CheckInStatus, Quarter
from app.services.progress_calculation_service import ProgressCalculationService

MANAGER_EMAIL = "manager@demo.com"


def ensure_manager_demo():
    db: Session = SessionLocal()
    try:
        manager = db.query(User).filter(User.email == MANAGER_EMAIL).first()
        if not manager:
            print(f"No user found: {MANAGER_EMAIL}")
            return

        goals = db.query(Goal).filter(Goal.user_id == manager.id).all()
        print(f"Manager: {manager.full_name} (id={manager.id}), goals={len(goals)}")

        if not goals:
            print("No goals — create goals as Manager User in My Goals first.")
            return

        total_w = sum(g.weightage for g in goals)
        if total_w != 100 and len(goals) > 0:
            each = round(100 / len(goals), 2)
            remainder = round(100 - each * (len(goals) - 1), 2)
            for i, g in enumerate(goals):
                g.weightage = remainder if i == len(goals) - 1 else each
            print(f"Adjusted weightages from {total_w}% to 100%")

        approved = 0
        for g in goals:
            if g.status in (GoalStatus.DRAFT, GoalStatus.PENDING_APPROVAL):
                g.status = GoalStatus.APPROVED
                g.is_locked = True
                approved += 1
                print(f"  Approved: {g.title}")

        checkins_added = 0
        for g in goals:
            if g.status != GoalStatus.APPROVED:
                continue
            existing = (
                db.query(CheckIn)
                .filter(CheckIn.goal_id == g.id, CheckIn.quarter == Quarter.Q1)
                .first()
            )
            if existing:
                continue
            achievement = str(int(float(g.target) * 0.35)) if g.target.replace(".", "").isdigit() else "25"
            progress = ProgressCalculationService.calculate_progress(
                g.uom_type, g.target, achievement
            )
            db.add(
                CheckIn(
                    goal_id=g.id,
                    quarter=Quarter.Q1,
                    planned_target=g.target,
                    actual_achievement=achievement,
                    status=CheckInStatus.ON_TRACK,
                    progress_score=progress,
                )
            )
            checkins_added += 1
            print(f"  Q1 check-in: {g.title} ({achievement}/{g.target})")

        db.commit()
        print(f"Done. Approved {approved} goal(s), added {checkins_added} Q1 check-in(s).")
        print("Test: login as manager@demo.com → Check-ins → Q1")
    finally:
        db.close()


if __name__ == "__main__":
    ensure_manager_demo()
