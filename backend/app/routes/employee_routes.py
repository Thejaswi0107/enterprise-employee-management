from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controllers.department_controller import list_departments
from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    update_employee as update_employee_controller,
    delete_employee as delete_employee_controller,
)
from app.models.employee import Employee
from app.schemas.employee_schema import EmployeeCreate

router = APIRouter()


@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = get_all_employees(db)
    return {
        "success": True,
        "data": [employee.to_dict() for employee in employees]
    }


@router.get("/employees/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = get_employee_by_id(employee_id, db)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "data": employee.to_dict()
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

    new_employee = create_employee(employee, db)

    return {
        "success": True,
        "message": "Employee added successfully",
        "data": new_employee.to_dict()
    }


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    updated = update_employee_controller(employee_id, employee, db)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "message": "Employee updated successfully",
        "data": updated.to_dict()
    }


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    removed = delete_employee_controller(employee_id, db)

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "message": "Employee deleted successfully"
    }


@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = list_departments(db)
    return {
        "success": True,
        "data": [department.to_dict() for department in departments]
    }