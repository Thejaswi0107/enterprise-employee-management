from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    user_name: str
    action: str
    timestamp: datetime
    related_name: Optional[str] = None
    related_email: Optional[str] = None
    company_id: Optional[int] = None
    details: Optional[str] = None

    class Config:
        orm_mode = True
