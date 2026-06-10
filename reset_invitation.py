import sqlite3

conn = sqlite3.connect('backend/database.db')
cursor = conn.cursor()

# Set one invitation back to pending for testing
cursor.execute("UPDATE user_invitations SET status='pending' WHERE email='newuser@gmail.com'")
conn.commit()

# Verify it was updated
cursor.execute("SELECT email, status FROM user_invitations WHERE email='newuser@gmail.com'")
row = cursor.fetchone()
print(f"Updated: {row[0]} - Status: {row[1]}")

conn.close()
