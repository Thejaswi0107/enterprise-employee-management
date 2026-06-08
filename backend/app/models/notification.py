"""
Notification Model for tracking user-facing notifications
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.database.db import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)  # User receiving notification
    message = Column(Text, nullable=False)  # Human-readable message
    action = Column(String, nullable=False)  # Action type for categorization
    related_employee_name = Column(String, nullable=True)  # Employee involved
    related_employee_email = Column(String, nullable=True)  # Employee email
    company_id = Column(Integer, nullable=True)  # Company isolation
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "message": self.message,
            "action": self.action,
            "related_employee_name": self.related_employee_name,
            "related_employee_email": self.related_employee_email,
            "company_id": self.company_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "is_read": self.is_read,
        }
