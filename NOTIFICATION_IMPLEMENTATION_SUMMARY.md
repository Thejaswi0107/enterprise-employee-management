# Notification, Activity Tracking & Dashboard Real-Time Updates Implementation

## Overview
Implemented a centralized activity tracking system that synchronizes audit logs, notifications, and dashboard updates. All employee-related activities now create both audit log entries and user-facing notifications.

---

## Backend Implementation

### 1. New Models

#### `app/models/notification.py`
- **Purpose**: Store user-facing notifications separately from audit logs
- **Fields**:
  - `id`: Primary key
  - `user_email`: Recipient email (for multi-user notifications)
  - `message`: Human-readable notification message
  - `action`: Action type for categorization
  - `related_employee_name`: Employee involved
  - `related_employee_email`: Employee email
  - `company_id`: Company isolation for multi-tenant security
  - `timestamp`: When notification was created
  - `is_read`: Track notification read status

### 2. New Controllers

#### `app/controllers/activity_service.py` (Centralized Activity Tracker)
- **`ActivityTracker.track_employee_activity()`**
  - Single method for creating audit logs from all activities
  - Parameters: user_name, action, employee details, company_id, details dict
  - Returns: Created AuditLog instance
  - Ensures consistent audit logging across all endpoints

- **`ActivityTracker.get_activity_description()`**
  - Converts action type + context into human-readable message
  - Used for notification messages
  - Supports all tracked action types

- **`ActivityTracker.is_activity_tracked()`**
  - Validates if an action type should create a notification
  - Prevents unintended notifications

#### `app/controllers/notification_controller.py`
- **`create_notification()`**: Create new notification entry
- **`list_notifications()`**: Retrieve notifications with filtering (unread_only, company_id)
- **`get_unread_count()`**: Get unread notification count for user
- **`mark_notification_as_read()`**: Mark single notification as read
- **`mark_all_notifications_read()`**: Bulk mark all notifications as read

### 3. Updated Routes

#### `app/routes/employee_routes.py`
**POST /employees** (Create Employee)
- Creates audit log entry
- Creates notification: "{user_name} added employee {employee_name}"
- Notification sent to creating admin

**PUT /employees/{employee_id}** (Update Employee)
- Creates audit log entry
- Creates notification: "{user_name} updated employee {employee_name}"
- Notification sent to updating admin

**DELETE /employees/{employee_id}** (Delete Employee)
- Creates audit log entry
- Creates notification: "{user_name} deleted employee {employee_name}"
- Notification sent to deleting admin

**GET /notifications** (Enhanced)
- Returns paginated list of Notification objects
- Filters by user_email and company_id for security
- Returns unread_count and pending_approvals
- Supports unread_only filter parameter

#### `app/routes/role_change_routes.py`
**POST /api/role-change/request** (Submit Role Change)
- Creates audit log: "Role Change Requested"
- Creates 2 notifications:
  - To requester: "Role change request submitted for {employee_name}"
  - To assigned admin: "Role change request for {employee_name} needs your approval"

**PUT /api/role-change/request/{id}** (Approve/Reject)
- Creates audit log: "Role Change Approved" or "Role Change Rejected"
- Creates 2 notifications:
  - To requester: "Role change approved/rejected for {employee_name}"
  - To admin: "You approved/rejected role change for {employee_name}"

### 4. Database Schema
- Added `notifications` table with company isolation
- All notifications include `company_id` for secure data separation
- Timestamp tracked for each notification

---

## Frontend Implementation

### 1. Enhanced NotificationCenter Component
**Location**: `src/components/layout/NotificationCenter.jsx`

**Features**:
- Real-time notification display with unread count badge
- Visual indicators for different action types (approved, rejected, info)
- Time-relative display ("5m ago", "2h ago", "Just now")
- Auto-refresh every 20 seconds
- Manual refresh button
- "New" badge for unread notifications
- Sticky header for easy navigation

**Actions Shown**:
- Employee Created
- Employee Updated
- Employee Deleted
- Role Change Requested
- Role Change Approved
- Role Change Rejected

### 2. Updated Navbar Integration
**Location**: `src/components/layout/Navbar.jsx`

- Replaced hardcoded notification bell with NotificationCenter component
- Dynamic unread count display
- Smooth dropdown with notifications list

### 3. API Integration
**Location**: `src/services/api.js`

- **`getNotifications()`**: Fetches user's notifications with company isolation
- Returns notification list with unread count
- Handles error cases gracefully

---

## Activity Types Tracked

### Employee Actions
1. **Employee Created**
   - Message: "{admin_name} added employee {employee_name}"

2. **Employee Updated**
   - Message: "{admin_name} updated employee {employee_name}"
   - Details: role, department, status changes

3. **Employee Deleted**
   - Message: "{admin_name} deleted employee {employee_name}"

### Role Actions
1. **Role Change Requested**
   - Message: "Role change request submitted for {employee_name}"
   - Notifies: Requester and assigned admin

2. **Role Change Approved**
   - Message: "Role change approved for {employee_name}"
   - Notifies: Requester and approving admin

3. **Role Change Rejected**
   - Message: "Role change rejected for {employee_name}"
   - Notifies: Requester and rejecting admin

---

## Multi-Tenant Security

### Company Isolation
1. **All notifications filtered by company_id**
   - Company A users see only Company A notifications
   - Company B users see only Company B notifications
   - Admin users with company_id=None see global notifications

2. **Audit logs maintain company_id**
   - Audit logs scoped to company_id
   - Access validated at endpoint level

3. **Dashboard updates**
   - Analytics reflect only company-specific data
   - Real-time updates maintain company isolation

---

## Database Changes

### New Table: notifications
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_email VARCHAR NOT NULL,
    message TEXT NOT NULL,
    action VARCHAR NOT NULL,
    related_employee_name VARCHAR,
    related_employee_email VARCHAR,
    company_id INTEGER,
    timestamp DATETIME DEFAULT (datetime('now')),
    is_read BOOLEAN DEFAULT FALSE
);
```

---

## API Endpoints

### GET /notifications
**Query Parameters**:
- `unread_only`: boolean (default: false)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_email": "admin@company.com",
      "message": "Admin added employee John Doe",
      "action": "Employee Created",
      "related_employee_name": "John Doe",
      "related_employee_email": "john@company.com",
      "company_id": 1,
      "timestamp": "2025-06-05T10:30:00",
      "is_read": false
    }
  ],
  "unread_count": 5,
  "pending_approvals": 2,
  "message": "Notifications retrieved"
}
```

---

## Real-Time Dashboard Updates

### Dashboard Cards (Automatic)
- **Total Employees**: Updates when employee created/deleted
- **Active Employees**: Updates when status changes
- **Employees On Leave**: Updates when status changes
- **Departments**: Updates when employee department changes

### Dashboard Charts (Automatic)
- **Employee Overview**: Reflects current count
- **Department Distribution**: Recalculates from live data
- **Role Distribution**: Recalculates from live data
- **Status Overview**: Recalculates from live roles

### Refresh Button
- Added to Dashboard header
- Manual refresh of all statistics and charts
- Shows "Refreshing..." state during fetch

---

## Synchronization Between Components

### Audit Logs ↔ Notifications
1. Both created from same activity
2. Same timestamp and company_id
3. Related employee name/email match

### Notification Center ↔ Dashboard
1. Notification badge updates in real-time
2. Dashboard refresh button updates all metrics
3. Company switching updates all displays

---

## Files Modified

### Backend
- `backend/run.py` - Added Notification model import
- `backend/app/routes/employee_routes.py` - Added notification creation to CRUD operations
- `backend/app/routes/role_change_routes.py` - Added notification creation to approval/rejection

### Backend New Files
- `backend/app/models/notification.py` - Notification model
- `backend/app/controllers/activity_service.py` - Centralized activity tracking
- `backend/app/controllers/notification_controller.py` - Notification CRUD operations

### Frontend
- `src/components/layout/Navbar.jsx` - Integrated NotificationCenter
- `src/components/layout/NotificationCenter.jsx` - Enhanced with notification list
- `src/services/api.js` - getNotifications() endpoint

---

## Testing Checklist

✅ Backend Python compilation passes
✅ Frontend ESLint validation passes
✅ Notification table created in database
✅ Employee creation creates notification
✅ Employee update creates notification
✅ Employee deletion creates notification
✅ Role change request creates dual notifications
✅ Role change approval creates dual notifications
✅ Notifications display in NotificationCenter
✅ Company isolation maintained
✅ Unread count displays correctly
✅ Time formatting works ("5m ago", etc.)
✅ Manual refresh button works
✅ Auto-refresh every 20 seconds works

---

## Future Enhancements

1. **Email Notifications**: Send email alerts for important events
2. **Notification Preferences**: Allow users to customize which notifications they receive
3. **Notification History**: Archive old notifications for compliance
4. **Batch Notifications**: Group similar notifications
5. **WebSocket Real-Time**: Use WebSocket instead of polling for instant updates
6. **Notification Categories**: Filter by notification type in UI
7. **Sound Alerts**: Optional audio notification on important events
8. **Mobile Push Notifications**: Send to mobile apps

---

## Performance Considerations

1. **Polling Interval**: Set to 20 seconds (configurable)
2. **Notification Limit**: Default 50 per user (configurable)
3. **Database Indexes**: Consider adding index on (user_email, company_id) for faster queries
4. **Cleanup Job**: Archive notifications older than 90 days

---

## Security Notes

1. All notifications filtered by user email and company_id
2. Users cannot see notifications from other companies
3. Notifications use same multi-tenant validation as audit logs
4. Timestamps in UTC for consistency
5. Notification messages do not expose sensitive data

