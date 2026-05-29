from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from models import Employee
from pydantic import BaseModel

router = APIRouter()


class EmployeeCreate(BaseModel):
    name: str
    email: str
    role: str
    department: str
    status: str
    joined_date: str


@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()

    return {
        "success": True,
        "data": employees
    }


@router.get("/employees/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "data": employee
    }


@router.post("/employees")
def add_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Employee).filter(
        Employee.email == employee.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists"
        )

    new_employee = Employee(
        name=employee.name,
        email=employee.email,
        role=employee.role,
        department=employee.department,
        status=employee.status,
        joined_date=employee.joined_date
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "success": True,
        "message": "Employee added successfully",
        "data": new_employee
    }


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    existing.name = employee.name
    existing.email = employee.email
    existing.role = employee.role
    existing.department = employee.department
    existing.status = employee.status
    existing.joined_date = employee.joined_date

    db.commit()
    db.refresh(existing)

    return {
        "success": True,
        "message": "Employee updated successfully",
        "data": existing
    }


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "success": True,
        "message": "Employee deleted successfully"
    }