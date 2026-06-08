"""
Centralized Activity Tracking Service
Handles: Audit Logs, Notifications, and Event Tracking
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.controllers.audit_controller import create_audit_log
from app.controllers.notification_controller import create_notification


class ActivityTracker:
    """
    Centralized service for tracking all employee-related activities.
    Creates audit logs and notifications from a single source.
    """

    @staticmethod
    def track_event(
        db: Session,
        user_name: str,
        user_email: str,
        action: str,
        employee_name: Optional[str] = None,
        employee_email: Optional[str] = None,
        company_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        notification_recipients: Optional[List[str]] = None,
        notify: bool = True,
    ):
        """
        Track an activity as an audit entry and send notifications.

        Args:
            db: Database session
            user_name: Name of the user performing action
            user_email: Email of the user performing action
            action: The action string
            employee_name: Affected employee name or subject
            employee_email: Affected employee email or subject
            company_id: Optional company ID for isolation
            details: Additional details to include in audit and notification
            notification_recipients: Optional list of recipients to notify
            notify: Whether to create notifications for tracked actions
        """
        detail_str = None
        if details:
            detail_items = [f"{key}: {value}" for key, value in details.items()]
            detail_str = "; ".join(detail_items)

        audit_log = create_audit_log(
            db,
            user_name=user_name,
            action=action,
            related_name=employee_name,
            related_email=employee_email,
            company_id=company_id,
            details=detail_str,
        )

        if notify and ActivityTracker.is_activity_tracked(action):
            notification_message = ActivityTracker.get_activity_description(
                action,
                user_name,
                employee_name or "",
                details,
            )
            recipients = notification_recipients or [user_email]
            unique_recipients = list(dict.fromkeys([recipient for recipient in recipients if recipient]))

            for recipient in unique_recipients:
                create_notification(
                    db,
                    user_email=recipient,
                    message=notification_message,
                    action=action,
                    related_employee_name=employee_name,
                    related_employee_email=employee_email,
                    company_id=company_id,
                )

        return audit_log

    @staticmethod
    def get_activity_description(action: str, user_name: str, employee_name: str, details: Optional[Dict] = None) -> str:
        """
        Generate human-readable notification message from activity.

        Args:
            action: Action type
            user_name: User performing action
            employee_name: Employee affected
            details: Additional context

        Returns:
            Human-readable notification message
        """
        action_messages = {
            "Employee Created": f"{user_name} added employee {employee_name}",
            "Employee Updated": f"{user_name} updated employee {employee_name}",
            "Employee Deleted": f"{user_name} deleted employee {employee_name}",
            "Employee Status Changed": f"{user_name} changed {employee_name} status to {details.get('new_status', 'Unknown') if details else 'Unknown'}",
            "Employee Activated": f"{user_name} activated employee {employee_name}",
            "Employee Deactivated": f"{user_name} deactivated employee {employee_name}",
            "Employee Marked as On Leave": f"{user_name} marked {employee_name} as On Leave",
            "Employee Returned from Leave": f"{user_name} returned {employee_name} from leave",
            "Employee Department Changed": f"{user_name} changed {employee_name}'s department to {details.get('new_department', 'Unknown') if details else 'Unknown'}",
            "Employee Role Changed": f"{user_name} changed {employee_name}'s role to {details.get('new_role', 'Unknown') if details else 'Unknown'}",
            "Employee Information Edited": f"{user_name} edited {employee_name}'s information",
            "Role Change Requested": f"Role change request submitted for {employee_name}",
            "Role Change Approved": f"Role change approved for {employee_name}",
            "Role Change Rejected": f"Role change rejected for {employee_name}",
        }

        return action_messages.get(action, f"{user_name}: {action}")

    @staticmethod
    def is_activity_tracked(action: str) -> bool:
        """
        Check if an action type should create a notification.

        Args:
            action: Action type to check

        Returns:
            True if action should create notification
        """
        tracked_actions = {
            "Employee Created",
            "Employee Updated",
            "Employee Deleted",
            "Employee Status Changed",
            "Employee Activated",
            "Employee Deactivated",
            "Employee Marked as On Leave",
            "Employee Returned from Leave",
            "Employee Department Changed",
            "Employee Role Changed",
            "Employee Information Edited",
            "Role Change Requested",
            "Role Change Approved",
            "Role Change Rejected",
        }

        return action in tracked_actions
