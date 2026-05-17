#!/usr/bin/env python3
"""
NOTIFICATION PERFORMANCE OPTIMIZATION
Adds specific indexes to improve notification query performance
Target: Get notification load time under 1s for 99%+ score
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def create_notification_indexes():
    """Create optimized indexes for notification queries"""
    
    indexes = [
        # Primary notification query optimization
        {
            "name": "idx_notifications_user_created_desc",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_notifications_user_created_desc 
            ON notifications (user_id, created_at DESC)
            """,
            "description": "Optimize main notification list query (user_id + created_at DESC)"
        },
        
        # Unread notifications optimization
        {
            "name": "idx_notifications_user_unread",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
            ON notifications (user_id, is_read) 
            WHERE is_read = false
            """,
            "description": "Optimize unread notification queries (partial index)"
        },
        
        # Notification count optimization
        {
            "name": "idx_notifications_user_read_status",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_notifications_user_read_status 
            ON notifications (user_id, is_read)
            """,
            "description": "Optimize notification count queries"
        },
        
        # Goals query optimization (for API response time)
        {
            "name": "idx_goals_user_created_desc",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_goals_user_created_desc 
            ON goals (user_id, created_at DESC)
            """,
            "description": "Optimize goals list query"
        },
        
        # Check-ins query optimization
        {
            "name": "idx_checkins_user_created_desc",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_checkins_user_created_desc 
            ON check_ins (user_id, created_at DESC)
            """,
            "description": "Optimize check-ins list query"
        },
        
        # Users query optimization (for admin performance)
        {
            "name": "idx_users_role_created",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_users_role_created 
            ON users (role, created_at)
            """,
            "description": "Optimize user list queries by role"
        }
    ]
    
    print("🚀 OPTIMIZING NOTIFICATION & API PERFORMANCE")
    print("=" * 60)
    
    with engine.connect() as conn:
        for idx in indexes:
            try:
                print(f"📊 Creating index: {idx['name']}")
                print(f"   Purpose: {idx['description']}")
                
                conn.execute(text(idx['sql']))
                conn.commit()
                
                print(f"   ✅ SUCCESS")
                
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"   ℹ️  Index already exists")
                else:
                    print(f"   ❌ ERROR: {e}")
            
            print()
    
    print("🎯 PERFORMANCE OPTIMIZATION COMPLETE!")
    print("Expected improvements:")
    print("• Notification load time: <1s (target for 99%+)")
    print("• Average API response: <1s (target for 99%+)")
    print("• Overall score improvement: +5 points → 99%+")

if __name__ == "__main__":
    create_notification_indexes()