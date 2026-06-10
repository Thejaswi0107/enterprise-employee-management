import sqlite3

conn = sqlite3.connect('backend/database.db')
cursor = conn.cursor()

# Get table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:')
for table in tables:
    print(f'  {table[0]}')

# Try to get invitations - check different possible table names
for table_name in ['user_invitation', 'userinvitation', 'invitation', 'user_invitations']:
    try:
        cursor.execute(f"SELECT invitation_token, email FROM {table_name} ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        print(f'\n{table_name}:')
        for row in rows:
            print(f'  {row[1]}: {row[0]}')
        break
    except:
        pass

conn.close()
