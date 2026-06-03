from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RoleChangeRequestCreate(BaseModel):
    user_email: str
    user_name: str
    requested_role: str = "Admin"
    admin_email: str
    password: str  # For verification


class RoleChangeRequestResponse(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_name: str
    requested_role: str
    admin_email: str
    status: str
    request_date: Optional[datetime]
    response_date: Optional[datetime]
    admin_comments: Optional[str]

    class Config:
        from_attributes = True


class RoleChangeRequestApprovalReject(BaseModel):
    status: str  # "Approved" or "Rejected"
    admin_comments: Optional[str] = None
