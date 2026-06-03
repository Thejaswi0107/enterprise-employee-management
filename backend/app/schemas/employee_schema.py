from pydantic import BaseModel
from typing import Optional


class EmployeeCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    department: str
    company_id: Optional[int] = 1
    status: str
    joined_date: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[float] = None
    manager_name: Optional[str] = None
    skills: Optional[str] = None


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        orm_mode = True


class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True