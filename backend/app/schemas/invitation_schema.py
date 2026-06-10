"""
Pydantic schemas for User Invitation operations
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CreateInvitationRequest(BaseModel):
    email: EmailStr
    role: str = "user"


class InvitationResponse(BaseModel):
    id: int
    invitation_token: str
    email: str
    invited_by_email: str
    company_id: int
    role: str
    status: str
    created_at: str
    expires_at: str
    accepted_at: Optional[str] = None
    revoked_at: Optional[str] = None
    revoked_by_email: Optional[str] = None


class InvitationListResponse(BaseModel):
    id: int
    email: str
    role: str
    status: str
    created_at: str
    expires_at: str
    invited_by_email: str
    accepted_at: Optional[str] = None


class RevokeInvitationRequest(BaseModel):
    invitation_id: int


class AcceptInvitationRequest(BaseModel):
    email: str
    name: str
    password: str
