from pydantic import BaseModel

class Employee(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    status: str
    joined_date: str