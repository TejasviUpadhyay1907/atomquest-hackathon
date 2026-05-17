#!/usr/bin/env python3
"""
Add progress tracking fields to goals table
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)

print(f"🔗 Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("✅ Connected to database")
        
        # Check if columns already exist
        print("\n📋 Checking existing columns...")
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'goals' 
            AND column_name IN ('current_value', 'progress')
        """))
        existing_columns = [row[0] for row in result]
        
        if 'current_value' in existing_columns and 'progress' in existing_columns:
            print("✅ Progress fields already exist!")
        else:
            # Add current_value column if not exists
            if 'current_value' not in existing_columns:
                print("\n➕ Adding current_value column...")
                conn.execute(text("""
                    ALTER TABLE goals 
                    ADD COLUMN IF NOT EXISTS current_value VARCHAR DEFAULT '0'
                """))
                conn.commit()
                print("✅ Added current_value column")
            else:
                print("✅ current_value column already exists")
            
            # Add progress column if not exists
            if 'progress' not in existing_columns:
                print("\n➕ Adding progress column...")
                conn.execute(text("""
                    ALTER TABLE goals 
                    ADD COLUMN IF NOT EXISTS progress FLOAT DEFAULT 0.0
                """))
                conn.commit()
                print("✅ Added progress column")
            else:
                print("✅ progress column already exists")
        
        # Update existing goals with default values
        print("\n🔄 Updating existing goals with default values...")
        conn.execute(text("""
            UPDATE goals 
            SET current_value = COALESCE(current_value, '0'),
                progress = COALESCE(progress, 0.0)
            WHERE current_value IS NULL OR progress IS NULL
        """))
        conn.commit()
        print("✅ Updated existing goals")
        
        # Verify the changes
        print("\n✅ Verifying changes...")
        result = conn.execute(text("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'goals' 
            AND column_name IN ('current_value', 'progress')
            ORDER BY column_name
        """))
        
        print("\n📊 Goal table columns:")
        for row in result:
            print(f"  • {row[0]}: {row[1]} (default: {row[2]})")
        
        # Count goals
        result = conn.execute(text("SELECT COUNT(*) FROM goals"))
        goal_count = result.scalar()
        print(f"\n📈 Total goals in database: {goal_count}")
        
        print("\n🎉 Migration completed successfully!")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
