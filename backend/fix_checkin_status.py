import psycopg2

conn = psycopg2.connect(
    'postgresql://postgres:tejasvi%40190701@db.fuclgltwplxyzoftudbp.supabase.co:5432/postgres'
)
cur = conn.cursor()

# Check what the team checkins endpoint returns for manager@demo.com (id=23)
# Manager 23 has Employee One (id=5) as team member
cur.execute("""
    SELECT 
        c.id,
        c.quarter,
        c.status,
        c.actual_achievement,
        c.progress_score,
        g.title as goal_title,
        u.full_name as employee_name
    FROM check_ins c
    JOIN goals g ON c.goal_id = g.id
    JOIN users u ON g.user_id = u.id
    WHERE u.manager_id = 23
    AND c.quarter = 'Q1'
    LIMIT 5
""")
print('Team check-ins for Manager User (Q1):')
for row in cur.fetchall():
    print(row)

cur.close()
conn.close()
