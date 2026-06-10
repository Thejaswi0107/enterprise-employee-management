"""
Pydantic schemas for Reactivation Request operations
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class DeactivateUserRequest(BaseModel):
    user_email: str
    reason: Optional[str] = None


class ReactivationRequestCreate(BaseModel):
    reason: str


class ReactivationRequestResponse(BaseModel):
    id: int
    user_email: str
    user_name: str
    company_id: int
    deactivated_by_email: str
    deactivated_by_name: str
    status: str
    reason: Optional[str]
    admin_response: Optional[str]
    requested_at: str
    responded_at: Optional[str]
    responded_by_email: Optional[str]
    responded_by_name: Optional[str]


class ReactivationApprovalRequest(BaseModel):
    response: Optional[str] = None


class ReactivationRejectionRequest(BaseModel):
    response: str


class AccountStatusResponse(BaseModel):
    email: str
    name: str
    is_active: bool
    deactivated_at: Optional[str] = None
    deactivation_reason: Optional[str] = None
    deactivated_by_email: Optional[str] = None
    deactivated_by_name: Optional[str] = None
    pending_reactivation_request: Optional[dict] = None
