from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from io import StringIO
import csv
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_manager
from app.models.user import User, UserRole
from app.models.goal import Goal, GoalStatus
from app.models.check_in import CheckIn
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse

router = APIRouter()


@router.get("/achievement-report")
def get_achievement_report(
    quarter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get achievement report (JSON format)"""
    # Managers see their team, Admins see all
    if current_user.role == UserRole.ADMIN:
        goals = db.query(Goal).filter(Goal.status == GoalStatus.APPROVED).all()
    elif current_user.role == UserRole.MANAGER:
        team_member_ids = [member.id for member in current_user.team_members]
        goals = db.query(Goal).filter(
            Goal.user_id.in_(team_member_ids),
            Goal.status == GoalStatus.APPROVED
        ).all()
    else:
        goals = db.query(Goal).filter(
            Goal.user_id == current_user.id,
            Goal.status == GoalStatus.APPROVED
        ).all()
    
    report_data = []
    
    for goal in goals:
        employee = goal.user
        
        # Get check-ins
        check_ins_query = db.query(CheckIn).filter(CheckIn.goal_id == goal.id)
        if quarter:
            check_ins_query = check_ins_query.filter(CheckIn.quarter == quarter)
        
        check_ins = check_ins_query.all()
        
        for check_in in check_ins:
            report_data.append({
                "employee_id": employee.id,
                "employee_name": employee.full_name,
                "department": employee.department,
                "goal_id": goal.id,
                "goal_title": goal.title,
                "uom_type": goal.uom_type,
                "planned_target": check_in.planned_target,
                "actual_achievement": check_in.actual_achievement,
                "progress_score": check_in.progress_score,
                "status": check_in.status,
                "quarter": check_in.quarter
            })
    
    return report_data


@router.get("/achievement-report/export")
def export_achievement_report(
    quarter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export achievement report as CSV"""
    # Get report data
    if current_user.role == UserRole.ADMIN:
        goals = db.query(Goal).filter(Goal.status == GoalStatus.APPROVED).all()
    elif current_user.role == UserRole.MANAGER:
        team_member_ids = [member.id for member in current_user.team_members]
        goals = db.query(Goal).filter(
            Goal.user_id.in_(team_member_ids),
            Goal.status == GoalStatus.APPROVED
        ).all()
    else:
        goals = db.query(Goal).filter(
            Goal.user_id == current_user.id,
            Goal.status == GoalStatus.APPROVED
        ).all()
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Employee ID",
        "Employee Name",
        "Department",
        "Goal Title",
        "UoM Type",
        "Planned Target",
        "Actual Achievement",
        "Progress %",
        "Status",
        "Quarter"
    ])
    
    # Write data
    for goal in goals:
        employee = goal.user
        
        check_ins_query = db.query(CheckIn).filter(CheckIn.goal_id == goal.id)
        if quarter:
            check_ins_query = check_ins_query.filter(CheckIn.quarter == quarter)
        
        check_ins = check_ins_query.all()
        
        for check_in in check_ins:
            writer.writerow([
                employee.id,
                employee.full_name,
                employee.department or "",
                goal.title,
                goal.uom_type,
                check_in.planned_target,
                check_in.actual_achievement or "",
                check_in.progress_score or "",
                check_in.status,
                check_in.quarter
            ])
    
    # Return CSV file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=achievement_report_{quarter or 'all'}.csv"}
    )


@router.get("/completion-dashboard")
def get_completion_dashboard(
    quarter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get completion dashboard showing who completed check-ins"""
    # Get scope based on role
    if current_user.role == UserRole.ADMIN:
        employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).all()
    elif current_user.role == UserRole.MANAGER:
        employees = current_user.team_members
    else:
        employees = [current_user]
    
    completion_data = []
    
    for employee in employees:
        # Get approved goals
        approved_goals = db.query(Goal).filter(
            Goal.user_id == employee.id,
            Goal.status == GoalStatus.APPROVED
        ).all()
        
        total_goals = len(approved_goals)
        
        if total_goals == 0:
            continue
        
        # Get check-ins
        goal_ids = [g.id for g in approved_goals]
        check_ins_query = db.query(CheckIn).filter(CheckIn.goal_id.in_(goal_ids))
        
        if quarter:
            check_ins_query = check_ins_query.filter(CheckIn.quarter == quarter)
        
        check_ins = check_ins_query.all()
        completed_goals = len(set(c.goal_id for c in check_ins))
        
        completion_percentage = (completed_goals / total_goals * 100) if total_goals > 0 else 0
        
        completion_data.append({
            "employee_id": employee.id,
            "employee_name": employee.full_name,
            "department": employee.department,
            "total_goals": total_goals,
            "completed_check_ins": completed_goals,
            "completion_percentage": round(completion_percentage, 2),
            "status": "Completed" if completed_goals == total_goals else "Pending"
        })
    
    return {
        "quarter": quarter or "All",
        "total_employees": len(completion_data),
        "fully_completed": len([d for d in completion_data if d["status"] == "Completed"]),
        "employees": completion_data
    }


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    goal_id: int = None,
    user_id: int = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get audit logs"""
    # Only managers and admins can view audit logs
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    
    query = db.query(AuditLog)
    
    if goal_id:
        query = query.filter(AuditLog.goal_id == goal_id)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    # Managers can only see logs for their team's goals
    if current_user.role == UserRole.MANAGER:
        team_member_ids = [member.id for member in current_user.team_members]
        team_goal_ids = [g.id for g in db.query(Goal).filter(Goal.user_id.in_(team_member_ids)).all()]
        query = query.filter(AuditLog.goal_id.in_(team_goal_ids))
    
    audit_logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return audit_logs


@router.get("/analytics/goal-distribution")
def get_goal_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get goal distribution by thrust area"""
    from sqlalchemy import func
    from app.models.thrust_area import ThrustArea
    
    # Get scope
    if current_user.role == UserRole.ADMIN:
        goals_query = db.query(Goal)
    elif current_user.role == UserRole.MANAGER:
        team_member_ids = [member.id for member in current_user.team_members]
        goals_query = db.query(Goal).filter(Goal.user_id.in_(team_member_ids))
    else:
        goals_query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    # Group by thrust area
    distribution = db.query(
        ThrustArea.name,
        func.count(Goal.id).label('count')
    ).join(Goal).filter(
        Goal.id.in_([g.id for g in goals_query.all()])
    ).group_by(ThrustArea.name).all()
    
    return [
        {"thrust_area": name, "count": count}
        for name, count in distribution
    ]


@router.get("/analytics/status-overview")
def get_status_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview of goal statuses"""
    from sqlalchemy import func
    
    # Get scope
    if current_user.role == UserRole.ADMIN:
        goals_query = db.query(Goal)
    elif current_user.role == UserRole.MANAGER:
        team_member_ids = [member.id for member in current_user.team_members]
        goals_query = db.query(Goal).filter(Goal.user_id.in_(team_member_ids))
    else:
        goals_query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    # Group by status
    status_counts = db.query(
        Goal.status,
        func.count(Goal.id).label('count')
    ).filter(
        Goal.id.in_([g.id for g in goals_query.all()])
    ).group_by(Goal.status).all()
    
    return [
        {"status": status, "count": count}
        for status, count in status_counts
    ]
