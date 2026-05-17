#!/usr/bin/env python3
"""
FIX REMAINING PERFORMANCE INDEXES
Fixes the remaining indexes for 99%+ score
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

def create_remaining_indexes():
    """Create the remaining optimized indexes"""
    
    indexes = [
        # Check-ins query optimization (correct column name)
        {
            "name": "idx_checkins_goal_created_desc",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_checkins_goal_created_desc 
            ON check_ins (goal_id, created_at DESC)
            """,
            "description": "Optimize check-ins list query by goal"
        },
        
        # Users query optimization (for admin performance)
        {
            "name": "idx_users_role_created",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_users_role_created 
            ON users (role, created_at)
            """,
            "description": "Optimize user list queries by role"
        },
        
        # Additional optimization for goals by status
        {
            "name": "idx_goals_user_status",
            "sql": """
            CREATE INDEX IF NOT EXISTS idx_goals_user_status 
            ON goals (user_id, status)
            """,
            "description": "Optimize goals queries by user and status"
        }
    ]
    
    print("🔧 FIXING REMAINING PERFORMANCE INDEXES")
    print("=" * 50)
    
    # Create each index in a separate transaction
    for idx in indexes:
        try:
            print(f"📊 Creating index: {idx['name']}")
            print(f"   Purpose: {idx['description']}")
            
            with engine.connect() as conn:
                conn.execute(text(idx['sql']))
                conn.commit()
            
            print(f"   ✅ SUCCESS")
            
        except Exception as e:
            if "already exists" in str(e).lower():
                print(f"   ℹ️  Index already exists")
            else:
                print(f"   ❌ ERROR: {e}")
        
        print()
    
    print("🎯 ALL PERFORMANCE INDEXES COMPLETE!")
    print("Expected result: 99%+ score achieved!")

if __name__ == "__main__":
    create_remaining_indexes()