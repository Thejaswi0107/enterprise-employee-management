"""
Pydantic schemas for Member Management operations
"""

from pydantic import BaseModel
from typing import Optional


class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    status: str
    joined_date: Optional[str] = None
    phone: Optional[str] = None
    is_account_active: bool


class MembersListResponse(BaseModel):
    total_members: int
    active_members: int
    deactivated_members: int
    members: list[MemberResponse]


class DeactivatedMemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_account_active: bool
    deactivated_at: str
    deactivation_reason: Optional[str] = None
    deactivated_by_email: str
    deactivated_by_name: str


class DeactivateUserRequest(BaseModel):
    reason: Optional[str] = None
