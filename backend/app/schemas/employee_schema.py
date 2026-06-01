from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    name: str
    email: str
    role: str
    department: str
    status: str
    joined_date: str


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        orm_mode = True


class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True