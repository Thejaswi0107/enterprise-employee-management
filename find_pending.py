import sqlite3

conn = sqlite3.connect('backend/database.db')
cursor = conn.cursor()

# Get pending invitations
cursor.execute("SELECT invitation_token, email, status, expires_at FROM user_invitations WHERE status='pending' ORDER BY created_at DESC LIMIT 3")
rows = cursor.fetchall()
print('Pending invitations:')
if rows:
    for row in rows:
        print(f'  Token: {row[0]}')
        print(f'  Email: {row[1]}')
        print(f'  Status: {row[2]}')
        print(f'  Expires: {row[3]}')
        print()
else:
    print('  No pending invitations found')
    # Try to find all invitations
    print('\nAll invitations:')
    cursor.execute("SELECT invitation_token, email, status, role, company_id FROM user_invitations ORDER BY created_at DESC LIMIT 10")
    rows = cursor.fetchall()
    for row in rows:
        print(f'  {row[1]} ({row[3]}) - Status: {row[2]}')

conn.close()
