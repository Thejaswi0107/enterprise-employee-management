"""
Reactivation Request Model for managing user account deactivation and reactivation
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.db import Base


class ReactivationRequest(Base):
    __tablename__ = "reactivation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)  # User requesting reactivation
    user_name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    deactivated_by_email = Column(String, nullable=False)  # Admin who deactivated
    deactivated_by_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, approved, rejected
    reason = Column(Text, nullable=True)  # Reason for reactivation request
    admin_response = Column(Text, nullable=True)  # Admin's response to request
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    responded_at = Column(DateTime, nullable=True)  # When admin responded
    responded_by_email = Column(String, nullable=True)  # Admin who approved/rejected
    responded_by_name = Column(String, nullable=True)

    company = relationship("Company", foreign_keys=[company_id])

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "user_name": self.user_name,
            "company_id": self.company_id,
            "deactivated_by_email": self.deactivated_by_email,
            "deactivated_by_name": self.deactivated_by_name,
            "status": self.status,
            "reason": self.reason,
            "admin_response": self.admin_response,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "responded_at": self.responded_at.isoformat() if self.responded_at else None,
            "responded_by_email": self.responded_by_email,
            "responded_by_name": self.responded_by_name,
        }
