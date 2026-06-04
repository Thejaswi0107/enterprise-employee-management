from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database.db import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    related_name = Column(String, nullable=True)
    related_email = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    details = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_name": self.user_name,
            "action": self.action,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "related_name": self.related_name,
            "related_email": self.related_email,
            "company_id": self.company_id,
            "details": self.details,
        }
