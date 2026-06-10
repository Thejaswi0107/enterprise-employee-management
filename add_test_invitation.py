import sqlite3
import secrets
from datetime import datetime, timedelta, timezone

# Connect to the ROOT database that the server is using
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create a fresh test invitation manually
token = secrets.token_urlsafe(32)
email = 'workflowtest@example.com'
expires_at = datetime.now(timezone.utc) + timedelta(days=7)

# First check if the table exists and has the columns
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_invitations'")
if cursor.fetchone():
    print('user_invitations table found')
    # Check columns
    cursor.execute('PRAGMA table_info(user_invitations)')
    cols = [col[1] for col in cursor.fetchall()]
    print(f'Columns: {cols}')
    
    if 'invitation_token' in cols:
        cursor.execute('''
            INSERT INTO user_invitations 
            (invitation_token, email, invited_by_email, company_id, role, status, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (token, email, 'admin@gmail.com', 1, 'user', 'pending', datetime.now(timezone.utc), expires_at))
        conn.commit()
        print(f'Created invitation:')
        print(f'Token: {token}')
        print(f'Email: {email}')
else:
    print('user_invitations table NOT found')

conn.close()
