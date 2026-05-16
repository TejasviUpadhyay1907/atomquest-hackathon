"""
Create all database tables
"""
from app.core.database import engine, Base
from app.models import user, thrust_area, goal, check_in, notification, audit_log, goal_template

print("🔨 Creating database tables...")

try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - thrust_areas")
    print("  - goals")
    print("  - check_ins")
    print("  - notifications")
    print("  - audit_logs")
    print("  - goal_templates")
    print("\n✅ Database is ready!")
    
except Exception as e:
    print(f"❌ Error creating tables: {e}")
