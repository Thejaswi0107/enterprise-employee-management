# Notification System - Quick Reference

## What's New

### Frontend
1. **Notification Bell** (Navbar)
   - Shows unread notification count
   - Click to see all notifications
   - Auto-refreshes every 20 seconds
   - Manual refresh button available

2. **Notification Messages**
   - "Admin added employee John Doe"
   - "Admin updated employee John Doe"
   - "Admin deleted employee John Doe"
   - "Role change approved for John Doe"
   - "Role change rejected for John Doe"

### Backend
1. **New Notification Table** - Stores all user notifications
2. **Activity Tracking Service** - Centralizes audit log and notification creation
3. **Enhanced Endpoints** - POST/PUT/DELETE employees now create notifications
4. **Role Change Tracking** - Requests and approvals create notifications

---

## How Notifications Work

### When an Employee is Created
```
1. Admin clicks "Add Employee"
2. Backend creates audit log entry
3. Backend creates notification: "{admin_name} added employee {employee_name}"
4. Notification appears in admin's notification center
5. Unread count badge updates
```

### When a Role Change is Requested
```
1. Employee submits role change request
2. Backend creates 2 notifications:
   - To requester: "Role change request submitted for {employee_name}"
   - To admin: "Role change request for {employee_name} needs your approval"
3. Both users see notification immediately
```

### When a Role Change is Approved/Rejected
```
1. Admin approves or rejects request
2. Backend creates 2 notifications:
   - To requester: "Role change approved/rejected for {employee_name}"
   - To admin: "You approved/rejected role change for {employee_name}"
3. Both users informed of decision
```

---

## Company Isolation

### How It Works
- **Company A Admin** → Sees only Company A notifications
- **Company B Admin** → Sees only Company B notifications
- **Super Admin** (company_id=None) → Can see global notifications

### Example
- Admin A creates employee in Company A
- Notification appears only in Admin A's notification center
- Admin B (Company B) does NOT see this notification
- Secure data separation maintained

---

## Key Features

### Notification Center UI
✓ Real-time unread count badge (shows "99+" if over 99 unread)
✓ Dropdown list of all notifications
✓ Time-relative display ("5m ago", "2h ago", etc.)
✓ Visual icons for action types
✓ "New" badge for unread notifications
✓ Manual refresh button
✓ Auto-refresh every 20 seconds
✓ Max 50 notifications displayed

### Audit Logs Integration
✓ Every notification corresponds to an audit log entry
✓ Both show same timestamp and employee information
✓ Synchronized action types
✓ Company isolation maintained

### Dashboard Updates
✓ Refresh button to manually update stats
✓ Employee counts update when employees are added/deleted
✓ Department counts update when assignments change
✓ Real-time data from database (no hardcoded values)

---

## Tracked Activities

### Employee Management
- [ ] Employee Created → Notification sent to admin
- [ ] Employee Updated → Notification sent to admin
- [ ] Employee Deleted → Notification sent to admin

### Role Change Management
- [ ] Role Change Requested → Notifications to requester + admin
- [ ] Role Change Approved → Notifications to requester + admin
- [ ] Role Change Rejected → Notifications to requester + admin

### Status Changes
- [ ] Employee Status Changed
- [ ] Employee Activated
- [ ] Employee Deactivated
- [ ] Employee On Leave
- [ ] Employee Returned

---

## API Integration

### getNotifications()
```javascript
// Fetch user's notifications
const response = await getNotifications();

// Returns
{
  success: true,
  data: [
    {
      id: 1,
      user_email: "admin@company.com",
      message: "Admin added employee John Doe",
      action: "Employee Created",
      related_employee_name: "John Doe",
      timestamp: "2025-06-05T10:30:00",
      is_read: false
    }
  ],
  unread_count: 5,
  pending_approvals: 2
}
```

---

## Known Behavior

1. **Polling Interval**: 20 seconds
   - Notifications update automatically every 20 seconds
   - Manual refresh available immediately

2. **Unread Count**: Tracked per notification
   - Badge shows total unread count
   - Individual notifications marked with "New" badge

3. **Time Display**: Relative format
   - "Just now" - 0-60 seconds
   - "5m ago" - minutes
   - "2h ago" - hours
   - "06/05/2025" - older than 24 hours

4. **Company Filtering**: Automatic
   - User sees only their company's notifications
   - No manual filtering needed

---

## Updated Notification System Behavior (Refined Requirement)

### Clear All Button Behavior (IMPORTANT CHANGE)

- The “Clear All” button must immediately remove all existing notifications from the notification bar.
- After clicking “Clear All”: the notification bar must become completely empty (blank state UI).
- No old notifications should reappear under any condition.
- The system must NOT re-load or restore previous notifications after clearing.

### New Notification Flow After Clearing

- After clearing, the notification bar stays empty.
- Only new incoming events AFTER the clear action should appear as notifications.
- No historical or cached notifications must be shown again unless triggered as a new event.

### Important Rule

- Clearing notifications does NOT affect audit logs (audit logs remain permanent and unchanged).

---

## Backend Files

### New Files
- `backend/app/models/notification.py` - Notification model
- `backend/app/controllers/activity_service.py` - Activity tracking
- `backend/app/controllers/notification_controller.py` - Notification CRUD

### Modified Files
- `backend/run.py` - Added Notification import
- `backend/app/routes/employee_routes.py` - Added notifications to CRUD
- `backend/app/routes/role_change_routes.py` - Added notifications to role changes
- `backend/app/routes/employee_routes.py` - Added missing imports (RoleChangeRequest, AuditLog)

## Frontend Files

### Modified Files
- `src/components/layout/Navbar.jsx` - Integrated NotificationCenter
- `src/components/layout/NotificationCenter.jsx` - Rewritten for notification list display
- `src/services/api.js` - Enhanced getNotifications() function

---

## Troubleshooting

### Q: Notifications not appearing?
**A**: 
1. Check backend is running (should see no errors on http://localhost:8000)
2. Try clicking "Refresh" button manually
3. Wait 20 seconds for auto-refresh
4. Check browser console for errors

### Q: Only seeing old notifications?
**A**: 
1. Backend has old notifications in database
2. Click "Refresh" to re-fetch from server
3. Check your browser's dev tools (F12) → Network tab

### Q: Notifications from other company appearing?
**A**: 
1. This should NOT happen - report as bug
2. Check company_id is set correctly (localStorage in browser console)
3. Try logging out and logging back in

### Q: Unread count not updating?
**A**: 
1. Click "Refresh" button to force update
2. Try navigating to another page and back
3. Check browser console for errors

---

## Performance Tips

1. **For Admins with Many Employees**
   - Notifications are paginated (max 50 shown)
   - Older notifications pushed down
   - Refresh button available for latest

2. **Notification Cleanup**
   - Long-term: Old notifications archived (90+ days)
   - Users can manually manage via is_read flag

3. **Auto-Refresh Frequency**
   - Set to 20 seconds for balance
   - Can adjust in NotificationCenter.jsx if needed

---

## Database Schema

```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_email VARCHAR NOT NULL,
    message TEXT NOT NULL,
    action VARCHAR NOT NULL,
    related_employee_name VARCHAR,
    related_employee_email VARCHAR,
    company_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT 0
);

-- Recommended indexes
CREATE INDEX idx_notifications_user_company 
ON notifications(user_email, company_id);

CREATE INDEX idx_notifications_timestamp 
ON notifications(timestamp DESC);
```

---

## Related Documentation

- [NOTIFICATION_IMPLEMENTATION_SUMMARY.md](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md) - Full technical implementation
- [AUDIT_SYSTEM.md](./AUDIT_SYSTEM.md) - Audit logging system
- [README.md](./README.md) - General project documentation

