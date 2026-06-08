"""
Notification Controller for managing notifications
"""

from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(
    db: Session,
    user_email: str,
    message: str,
    action: str,
    related_employee_name: Optional[str] = None,
    related_employee_email: Optional[str] = None,
    company_id: Optional[int] = None
) -> Notification:
    """Create a new notification for a user"""
    
    notification = Notification(
        user_email=user_email,
        message=message,
        action=action,
        related_employee_name=related_employee_name,
        related_employee_email=related_employee_email,
        company_id=company_id,
        timestamp=datetime.now(timezone.utc),
        is_read=False
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


def list_notifications(
    db: Session,
    user_email: str,
    company_id: Optional[int] = None,
    limit: Optional[int] = None,
    unread_only: bool = False
) -> List[Notification]:
    """List notifications for a user"""
    
    query = db.query(Notification).filter(Notification.user_email == user_email)
    
    if company_id is not None:
        query = query.filter(Notification.company_id == company_id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    query = query.order_by(Notification.timestamp.desc())
    if limit is not None:
        query = query.limit(limit)
    return query.all()


def get_unread_count(
    db: Session,
    user_email: str,
    company_id: Optional[int] = None
) -> int:
    """Get count of unread notifications for user"""
    
    query = db.query(Notification).filter(
        Notification.user_email == user_email,
        Notification.is_read == False
    )
    
    if company_id is not None:
        query = query.filter(Notification.company_id == company_id)
    
    return query.count()


def mark_notification_as_read(db: Session, notification_id: int) -> bool:
    """Mark a notification as read"""
    
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        return False
    
    notification.is_read = True
    db.commit()
    
    return True


def clear_notifications(
    db: Session,
    user_email: str,
    company_id: Optional[int] = None
) -> int:
    """Delete all notifications for a user"""
    
    query = db.query(Notification).filter(Notification.user_email == user_email)
    
    if company_id is not None:
        query = query.filter(Notification.company_id == company_id)
    
    count = query.delete(synchronize_session=False)
    db.commit()
    
    return count


def mark_all_notifications_read(
    db: Session,
    user_email: str,
    company_id: Optional[int] = None
) -> int:
    """Mark all notifications as read for a user"""
    
    query = db.query(Notification).filter(
        Notification.user_email == user_email,
        Notification.is_read == False
    )
    
    if company_id is not None:
        query = query.filter(Notification.company_id == company_id)
    
    count = query.update({"is_read": True})
    db.commit()
    
    return count
