"""
Seed script to populate database with demo data
Run this after setting up the database
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.thrust_area import ThrustArea
from app.models.goal import Goal, GoalStatus, UoMType
from app.models.check_in import CheckIn, Quarter, CheckInStatus
from app.models.goal_template import GoalTemplate
from datetime import datetime

def seed_database():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding database...")
        
        # 1. Create Thrust Areas
        print("Creating thrust areas...")
        thrust_areas = [
            ThrustArea(name="Revenue Growth", description="Goals related to increasing revenue and sales"),
            ThrustArea(name="Quality Improvement", description="Goals focused on improving product/service quality"),
            ThrustArea(name="Innovation", description="Goals for innovation and new initiatives"),
            ThrustArea(name="Customer Satisfaction", description="Goals to improve customer experience"),
            ThrustArea(name="Operational Efficiency", description="Goals to optimize operations and reduce costs"),
            ThrustArea(name="Team Development", description="Goals for team growth and skill development"),
        ]
        
        for ta in thrust_areas:
            existing = db.query(ThrustArea).filter(ThrustArea.name == ta.name).first()
            if not existing:
                db.add(ta)
        
        db.commit()
        print("✅ Thrust areas created")
        
        # 2. Create Users
        print("Creating users...")
        
        # Admin
        admin = User(
            email="admin@demo.com",
            password_hash=get_password_hash("password123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            department="HR"
        )
        db.add(admin)
        db.flush()
        
        # Managers
        manager1 = User(
            email="manager1@demo.com",
            password_hash=get_password_hash("password123"),
            full_name="John Manager",
            role=UserRole.MANAGER,
            department="Engineering"
        )
        db.add(manager1)
        db.flush()
        
        manager2 = User(
            email="manager2@demo.com",
            password_hash=get_password_hash("password123"),
            full_name="Sarah Manager",
            role=UserRole.MANAGER,
            department="Sales"
        )
        db.add(manager2)
        db.flush()
        
        manager3 = User(
            email="manager3@demo.com",
            password_hash=get_password_hash("password123"),
            full_name="Mike Manager",
            role=UserRole.MANAGER,
            department="Marketing"
        )
        db.add(manager3)
        db.flush()
        
        # Employees
        employees = [
            # Engineering team
            User(email="emp1@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Alice Engineer", role=UserRole.EMPLOYEE, department="Engineering", manager_id=manager1.id),
            User(email="emp2@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Bob Developer", role=UserRole.EMPLOYEE, department="Engineering", manager_id=manager1.id),
            User(email="emp3@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Carol Coder", role=UserRole.EMPLOYEE, department="Engineering", manager_id=manager1.id),
            User(email="emp4@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="David Dev", role=UserRole.EMPLOYEE, department="Engineering", manager_id=manager1.id),
            User(email="emp5@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Eve Engineer", role=UserRole.EMPLOYEE, department="Engineering", manager_id=manager1.id),
            
            # Sales team
            User(email="emp6@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Frank Sales", role=UserRole.EMPLOYEE, department="Sales", manager_id=manager2.id),
            User(email="emp7@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Grace Seller", role=UserRole.EMPLOYEE, department="Sales", manager_id=manager2.id),
            User(email="emp8@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Henry Hunter", role=UserRole.EMPLOYEE, department="Sales", manager_id=manager2.id),
            User(email="emp9@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Iris Sales", role=UserRole.EMPLOYEE, department="Sales", manager_id=manager2.id),
            User(email="emp10@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Jack Closer", role=UserRole.EMPLOYEE, department="Sales", manager_id=manager2.id),
            
            # Marketing team
            User(email="emp11@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Kate Marketer", role=UserRole.EMPLOYEE, department="Marketing", manager_id=manager3.id),
            User(email="emp12@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Leo Brand", role=UserRole.EMPLOYEE, department="Marketing", manager_id=manager3.id),
            User(email="emp13@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Mary Content", role=UserRole.EMPLOYEE, department="Marketing", manager_id=manager3.id),
            User(email="emp14@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Nick Social", role=UserRole.EMPLOYEE, department="Marketing", manager_id=manager3.id),
            User(email="emp15@demo.com", password_hash=get_password_hash("password123"), 
                 full_name="Olivia Digital", role=UserRole.EMPLOYEE, department="Marketing", manager_id=manager3.id),
        ]
        
        for emp in employees:
            db.add(emp)
        
        db.commit()
        print("✅ Users created (1 admin, 3 managers, 15 employees)")
        
        # 3. Create Goal Templates
        print("Creating goal templates...")
        templates = [
            GoalTemplate(
                role="Software Engineer",
                department="Engineering",
                thrust_area_name="Quality Improvement",
                title="Reduce Bug Count",
                description="Reduce production bugs by improving code quality and testing",
                uom_type=UoMType.NUMERIC,
                suggested_target="10",
                suggested_weightage=20.0
            ),
            GoalTemplate(
                role="Software Engineer",
                department="Engineering",
                thrust_area_name="Innovation",
                title="Implement New Feature",
                description="Design and implement a new product feature",
                uom_type=UoMType.TIMELINE,
                suggested_target="2024-12-31",
                suggested_weightage=25.0
            ),
            GoalTemplate(
                role="Sales Representative",
                department="Sales",
                thrust_area_name="Revenue Growth",
                title="Achieve Sales Target",
                description="Meet or exceed quarterly sales targets",
                uom_type=UoMType.PERCENTAGE,
                suggested_target="100",
                suggested_weightage=30.0
            ),
        ]
        
        for template in templates:
            db.add(template)
        
        db.commit()
        print("✅ Goal templates created")
        
        # 4. Create Sample Goals
        print("Creating sample goals...")
        
        # Get thrust areas
        revenue_ta = db.query(ThrustArea).filter(ThrustArea.name == "Revenue Growth").first()
        quality_ta = db.query(ThrustArea).filter(ThrustArea.name == "Quality Improvement").first()
        innovation_ta = db.query(ThrustArea).filter(ThrustArea.name == "Innovation").first()
        
        # Create goals for first employee (approved)
        emp1 = db.query(User).filter(User.email == "emp1@demo.com").first()
        
        goals_emp1 = [
            Goal(
                user_id=emp1.id,
                thrust_area_id=quality_ta.id,
                title="Reduce Bug Count by 50%",
                description="Improve code quality and reduce production bugs",
                uom_type=UoMType.PERCENTAGE,
                target="50",
                weightage=30.0,
                status=GoalStatus.APPROVED,
                is_locked=True,
                approved_at=datetime.utcnow()
            ),
            Goal(
                user_id=emp1.id,
                thrust_area_id=innovation_ta.id,
                title="Implement AI Feature",
                description="Design and implement AI-powered recommendations",
                uom_type=UoMType.TIMELINE,
                target="2024-12-31",
                weightage=40.0,
                status=GoalStatus.APPROVED,
                is_locked=True,
                approved_at=datetime.utcnow()
            ),
            Goal(
                user_id=emp1.id,
                thrust_area_id=quality_ta.id,
                title="Improve Test Coverage",
                description="Increase unit test coverage to 80%",
                uom_type=UoMType.PERCENTAGE,
                target="80",
                weightage=30.0,
                status=GoalStatus.APPROVED,
                is_locked=True,
                approved_at=datetime.utcnow()
            ),
        ]
        
        for goal in goals_emp1:
            db.add(goal)
        
        db.flush()
        
        # Create check-ins for emp1
        for goal in goals_emp1:
            check_in = CheckIn(
                goal_id=goal.id,
                quarter=Quarter.Q1,
                planned_target=goal.target,
                actual_achievement="25" if goal.uom_type == UoMType.PERCENTAGE else "2024-06-30",
                status=CheckInStatus.ON_TRACK,
                progress_score=50.0
            )
            db.add(check_in)
        
        # Create pending goals for emp2
        emp2 = db.query(User).filter(User.email == "emp2@demo.com").first()
        
        goals_emp2 = [
            Goal(
                user_id=emp2.id,
                thrust_area_id=revenue_ta.id,
                title="Increase API Performance",
                description="Optimize API response time by 30%",
                uom_type=UoMType.PERCENTAGE,
                target="30",
                weightage=35.0,
                status=GoalStatus.PENDING_APPROVAL,
                submitted_at=datetime.utcnow()
            ),
            Goal(
                user_id=emp2.id,
                thrust_area_id=quality_ta.id,
                title="Code Review Quality",
                description="Conduct thorough code reviews for all PRs",
                uom_type=UoMType.NUMERIC,
                target="50",
                weightage=25.0,
                status=GoalStatus.PENDING_APPROVAL,
                submitted_at=datetime.utcnow()
            ),
        ]
        
        for goal in goals_emp2:
            db.add(goal)
        
        db.commit()
        print("✅ Sample goals and check-ins created")
        
        print("\n✅ Database seeded successfully!")
        print("\n📧 Demo Credentials:")
        print("Admin: admin@demo.com / password123")
        print("Manager 1: manager1@demo.com / password123")
        print("Manager 2: manager2@demo.com / password123")
        print("Manager 3: manager3@demo.com / password123")
        print("Employee 1: emp1@demo.com / password123")
        print("Employee 2: emp2@demo.com / password123")
        print("... (emp3-emp15@demo.com / password123)")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
