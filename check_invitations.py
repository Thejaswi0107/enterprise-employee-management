import sqlite3

conn = sqlite3.connect('backend/database.db')
cursor = conn.cursor()

# Get all recent invitations
cursor.execute("SELECT invitation_token, email, status, role, company_id FROM user_invitations ORDER BY created_at DESC LIMIT 20")
rows = cursor.fetchall()
print(f'All recent invitations ({len(rows)} total):')
for row in rows:
    print(f'  {row[1]} ({row[3]}, company {row[4]}) - Status: {row[2]} - Token: {row[0][:20]}...')

# Specifically check for test emails
cursor.execute("SELECT invitation_token, email, status FROM user_invitations WHERE email LIKE ? OR email LIKE ?", ('%test%', '%invite%'))
test_rows = cursor.fetchall()
print(f'\nTest email invitations ({len(test_rows)} total):')
for row in test_rows:
    print(f'  {row[1]} - Status: {row[2]} - Token: {row[0]}')

conn.close()
