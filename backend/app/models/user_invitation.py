"""
User Invitation Model for managing user invitations to join company
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.db import Base
import secrets


class UserInvitation(Base):
    __tablename__ = "user_invitations"

    id = Column(Integer, primary_key=True, index=True)
    invitation_token = Column(String, unique=True, nullable=False, index=True)  # Unique token for invitation link
    email = Column(String, nullable=False)  # Email of invited user
    invited_by_email = Column(String, nullable=False)  # Email of admin who sent invitation
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role = Column(String, nullable=False, default="user")  # Role to assign after signup
    status = Column(String, nullable=False, default="pending")  # pending, accepted, revoked, expired
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=False)  # Expiration time for invitation link
    accepted_at = Column(DateTime, nullable=True)  # When user accepted invitation
    revoked_at = Column(DateTime, nullable=True)  # When invitation was revoked
    revoked_by_email = Column(String, nullable=True)  # Admin who revoked it

    company = relationship("Company", foreign_keys=[company_id])

    def to_dict(self):
        return {
            "id": self.id,
            "invitation_token": self.invitation_token,
            "email": self.email,
            "invited_by_email": self.invited_by_email,
            "company_id": self.company_id,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "accepted_at": self.accepted_at.isoformat() if self.accepted_at else None,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
            "revoked_by_email": self.revoked_by_email,
        }

    @staticmethod
    def generate_token():
        """Generate a secure random token for invitation link"""
        return secrets.token_urlsafe(32)
