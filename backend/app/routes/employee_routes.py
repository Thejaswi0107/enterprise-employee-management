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
from app.controllers.audit_controller import list_audit_logs
from app.controllers.notification_controller import clear_notifications
from app.controllers.activity_service import ActivityTracker
from app.controllers.analytics_controller import (
    count_total_employees,
    count_active_employees,
    count_inactive_employees,
    list_employees_by_department,
    list_employees_by_role,
    employee_status_overview,
    count_pending_role_requests,
    list_pending_requesters,
)
from app.models.employee import Employee
from app.models.role_change_request import RoleChangeRequest
from app.models.audit_log import AuditLog
from app.schemas.employee_schema import EmployeeCreate

router = APIRouter()


def get_current_user(
    user_email: str = Header(None, alias="X-User-Email"),
    user_role: Optional[str] = Header(None, alias="X-User-Role"),
    requested_company_id: Optional[int] = Header(None, alias="X-User-Company-Id"),
):
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user authentication header")

    user = get_user_by_email(user_email)
    if not user and user_role in ("admin", "user"):
        user = {
            "email": user_email,
            "name": user_email,
            "role": user_role,
            "company_id": None,
            "company": None,
        }

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
        if user["company_id"] is None and requested_company_id is not None:
            user["company_id"] = requested_company_id
            user["company"] = "Company A" if requested_company_id == 1 else "Company B"
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
    ActivityTracker.track_event(
        db,
        user_name=current_user["name"],
        user_email=current_user["email"],
        action="Employee Created",
        employee_name=new_employee.name,
        employee_email=new_employee.email,
        company_id=company_id,
        details={
            "role": new_employee.role,
            "department": new_employee.department.name if new_employee.department else None,
            "status": new_employee.status,
        }
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

    # Get the current employee to check for status changes
    current_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not current_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    old_status = current_employee.status
    new_status = employee.status

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

    current_department = current_employee.department.name if current_employee.department else None
    old_role = current_employee.role
    old_department = current_department
    current_employee_details = {
        "old_status": old_status,
        "new_status": new_status,
        "old_role": old_role,
        "new_role": employee.role,
        "old_department": old_department,
        "new_department": employee.department,
    }

    status_changed = old_status != new_status
    role_changed = old_role != employee.role
    department_changed = old_department != employee.department

    if status_changed and not role_changed and not department_changed:
        action = "Employee Status Changed"
    elif role_changed and not status_changed and not department_changed:
        action = "Employee Role Changed"
    elif department_changed and not status_changed and not role_changed:
        action = "Employee Department Changed"
    else:
        action = "Employee Updated"

    ActivityTracker.track_event(
        db,
        user_name=current_user["name"],
        user_email=current_user["email"],
        action=action,
        employee_name=updated.name,
        employee_email=updated.email,
        company_id=company_id,
        details={
            key: value
            for key, value in current_employee_details.items()
            if value is not None
        }
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

    ActivityTracker.track_event(
        db,
        user_name=current_user["name"],
        user_email=current_user["email"],
        action="Employee Deleted",
        employee_name=removed.name,
        employee_email=removed.email,
        company_id=removed.company_id,
        details={"company_id": removed.company_id}
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
    inactive_employees = count_inactive_employees(db, current_user["company_id"])
    departments = list_employees_by_department(db, current_user["company_id"])
    roles = list_employees_by_role(db, current_user["company_id"])
    status_overview = employee_status_overview(db, current_user["company_id"])
    pending_requests = count_pending_role_requests(db, current_user["company_id"])
    requesters = list_pending_requesters(db, current_user["company_id"])

    return {
        "success": True,
        "data": {
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "inactiveEmployees": inactive_employees,
            "totalDepartments": len(departments),
            "pendingRequests": pending_requests,
            "pendingRequesters": requesters,
            "employeesByDepartment": departments,
            "employeesByRole": roles,
            "statusOverview": status_overview,
        }
    }


@router.get("/employees/search")
def search_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    search: str = "",
    role: str = "",
    department: str = "",
    page: int = 1,
    limit: int = 10
):
    query = db.query(Employee)
    if current_user["company_id"] is not None:
        query = query.filter(Employee.company_id == current_user["company_id"])

    if search:
        query = query.filter(
            (Employee.name.ilike(f"%{search}%")) |
            (Employee.email.ilike(f"%{search}%"))
        )

    if role:
        query = query.filter(Employee.role.ilike(f"%{role}%"))

    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))

    total = query.count()
    skip = (page - 1) * limit
    employees = query.offset(skip).limit(limit).all()

    return {
        "success": True,
        "data": [employee.to_dict() for employee in employees],
        "total": total,
        "page": page,
        "limit": limit,
        "message": "Search completed"
    }


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 1000
):
    from app.controllers.notification_controller import list_notifications, get_unread_count

    # Admin users should see all notifications for their email across companies.
    notification_company_id = None if current_user["role"] == "admin" else current_user["company_id"]

    # Get notifications for current user
    notifications = list_notifications(
        db,
        user_email=current_user["email"],
        company_id=notification_company_id,
        limit=limit,
        unread_only=unread_only
    )
    
    # Get unread count
    unread_count = get_unread_count(
        db,
        user_email=current_user["email"],
        company_id=notification_company_id
    )
    
    # Get pending role change requests for dashboard
    pending_requests = db.query(RoleChangeRequest).filter(
        RoleChangeRequest.status == "Pending"
    ).count()

    return {
        "success": True,
        "data": [notification.to_dict() for notification in notifications],
        "unread_count": unread_count,
        "pending_approvals": pending_requests,
        "message": "Notifications retrieved"
    }


@router.post("/notifications/clear-all")
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    notification_company_id = None if current_user["role"] == "admin" else current_user["company_id"]

    count = clear_notifications(
        db,
        user_email=current_user["email"],
        company_id=notification_company_id
    )
    return {
        "success": True,
        "cleared": count,
        "message": f"Cleared {count} notifications"
    }
