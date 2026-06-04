from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controllers.auth_controller import get_user_by_email
from app.controllers.department_controller import get_or_create_department, list_departments
from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    update_employee as update_employee_controller,
    delete_employee as delete_employee_controller,
)
from app.controllers.audit_controller import create_audit_log, list_audit_logs
from app.controllers.analytics_controller import (
    count_total_employees,
    count_active_employees,
    list_employees_by_department,
    list_employees_by_role,
    employee_status_overview,
    count_pending_role_requests,
)
from app.models.employee import Employee
from app.schemas.employee_schema import EmployeeCreate

router = APIRouter()


def get_current_user(
    user_email: str = Header(None, alias="X-User-Email"),
    requested_company_id: Optional[int] = Header(None, alias="X-User-Company-Id"),
):
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user authentication header")

    user = get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    if user["role"] == "admin":
        if requested_company_id is not None:
            if requested_company_id not in (1, 2):
                raise HTTPException(status_code=400, detail="Invalid company selection")

            user["company_id"] = requested_company_id
            user["company"] = "Company A" if requested_company_id == 1 else "Company B"
        else:
            user["company_id"] = None
    else:
        if requested_company_id is not None and requested_company_id != user["company_id"]:
            raise HTTPException(status_code=403, detail="Company access denied")

    return user


@router.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    employees = get_all_employees(db, current_user["company_id"])
    return {
        "success": True,
        "data": [employee.to_dict() for employee in employees]
    }


@router.get("/employees/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    employee = get_employee_by_id(employee_id, db, current_user["company_id"])

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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Use company_id from request if provided, otherwise use current user's company
    company_id = employee.company_id if employee.company_id else current_user["company_id"]
    
    # Validate that the company_id is one of the allowed companies
    if company_id not in (1, 2):
        raise HTTPException(status_code=400, detail="Invalid company selection")

    existing = db.query(Employee).filter(
        Employee.email == employee.email,
        Employee.company_id == company_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists"
        )

    new_employee = create_employee(employee, company_id, db)
    create_audit_log(
        db,
        user_name=current_user["name"],
        action="Employee Created",
        related_name=new_employee.name,
        related_email=new_employee.email,
        company_id=company_id,
    )

    return {
        "success": True,
        "message": "Employee added successfully",
        "data": new_employee.to_dict()
    }


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Use company_id from request if provided, otherwise use current user's company
    company_id = employee.company_id if employee.company_id else current_user["company_id"]
    
    # Validate that the company_id is one of the allowed companies
    if company_id not in (1, 2):
        raise HTTPException(status_code=400, detail="Invalid company selection")

    updated = update_employee_controller(
        employee_id,
        employee,
        None if current_user["role"] == "admin" else company_id,
        db,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    create_audit_log(
        db,
        user_name=current_user["name"],
        action="Employee Updated",
        related_name=updated.name,
        related_email=updated.email,
        company_id=company_id,
    )

    return {
        "success": True,
        "message": "Employee updated successfully",
        "data": updated.to_dict()
    }


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    removed = delete_employee_controller(
        employee_id,
        None if current_user["role"] == "admin" else current_user["company_id"],
        db,
    )

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    create_audit_log(
        db,
        user_name=current_user["name"],
        action="Employee Deleted",
        related_name=removed.name,
        related_email=removed.email,
        company_id=removed.company_id,
    )

    return {
        "success": True,
        "message": "Employee deleted successfully"
    }


@router.get("/departments")
def get_departments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    departments = list_departments(db, current_user["company_id"])
    return {
        "success": True,
        "data": [department.to_dict() for department in departments]
    }


@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    logs = list_audit_logs(db, current_user["company_id"])
    return {
        "success": True,
        "data": [log.to_dict() for log in logs]
    }


@router.get("/analytics/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_employees = count_total_employees(db, current_user["company_id"])
    active_employees = count_active_employees(db, current_user["company_id"])
    departments = list_employees_by_department(db, current_user["company_id"])
    roles = list_employees_by_role(db, current_user["company_id"])
    status_overview = employee_status_overview(db, current_user["company_id"])
    pending_requests = count_pending_role_requests(db)

    return {
        "success": True,
        "data": {
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "totalDepartments": len(departments),
            "pendingRequests": pending_requests,
            "employeesByDepartment": departments,
            "employeesByRole": roles,
            "statusOverview": status_overview,
        }
    }
