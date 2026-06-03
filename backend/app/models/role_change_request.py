from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from ..database.db import Base


class RoleChangeRequest(Base):
    __tablename__ = "role_change_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_email = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    requested_role = Column(String, default="Admin", nullable=False)
    admin_email = Column(String, nullable=False)
    status = Column(String, default="Pending", nullable=False)  # Pending, Approved, Rejected
    request_date = Column(DateTime, default=datetime.utcnow)
    response_date = Column(DateTime, nullable=True)
    admin_comments = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "user_name": self.user_name,
            "requested_role": self.requested_role,
            "admin_email": self.admin_email,
            "status": self.status,
            "request_date": self.request_date.isoformat() if self.request_date else None,
            "response_date": self.response_date.isoformat() if self.response_date else None,
            "admin_comments": self.admin_comments
        }
