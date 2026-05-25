from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.employee_schema import EmployeeCreate, EmployeeResponse
from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    update_employee,
    delete_employee,
)

router = APIRouter()


@router.get("/employees", response_model=list[EmployeeResponse])
def fetch_employees(db: Session = Depends(get_db)):
    return get_all_employees(db)


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def fetch_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = get_employee_by_id(employee_id, db)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


@router.post("/employees", response_model=EmployeeResponse)
def add_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    return create_employee(employee, db)


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def edit_employee(employee_id: int, employee: EmployeeCreate, db: Session = Depends(get_db)):
    updated = update_employee(employee_id, employee, db)

    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")

    return updated


@router.delete("/employees/{employee_id}")
def remove_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = delete_employee(employee_id, db)

    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee deleted successfully"}