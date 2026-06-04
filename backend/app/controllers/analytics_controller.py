from typing import Optional
from sqlalchemy import func
from ..models.employee import Employee
from ..models.department_model import Department
from ..models.role_change_request import RoleChangeRequest


def count_total_employees(db, company_id: Optional[int] = None):
    query = db.query(func.count(Employee.id))
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    return query.scalar() or 0


def count_active_employees(db, company_id: Optional[int] = None):
    query = db.query(func.count(Employee.id)).filter(Employee.status == "Active")
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    return query.scalar() or 0


def list_employees_by_department(db, company_id: Optional[int] = None):
    query = (
        db.query(Department.name, func.count(Employee.id).label("count"))
        .join(Employee, Employee.department_id == Department.id)
    )
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    results = query.group_by(Department.name).all()
    return [{"department": name, "count": count} for name, count in results]


def list_employees_by_role(db, company_id: Optional[int] = None):
    query = db.query(Employee.role, func.count(Employee.id).label("count"))
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    results = query.group_by(Employee.role).all()
    return [{"role": role, "count": count} for role, count in results]


def employee_status_overview(db, company_id: Optional[int] = None):
    query = db.query(Employee.status, func.count(Employee.id).label("count"))
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    results = query.group_by(Employee.status).all()
    return [{"status": status, "count": count} for status, count in results]


def count_pending_role_requests(db):
    return db.query(func.count(RoleChangeRequest.id)).filter(RoleChangeRequest.status == "Pending").scalar() or 0
