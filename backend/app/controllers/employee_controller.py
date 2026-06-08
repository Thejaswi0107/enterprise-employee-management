from http.client import HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from app.controllers.department_controller import get_or_create_department
from app.models.employee import Employee
from app.schemas.employee_schema import EmployeeCreate


def get_all_employees(db: Session, company_id: Optional[int] = None):
    query = db.query(Employee)
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    return query.all()


def get_employee_by_id(employee_id: int, db: Session, company_id: Optional[int] = None):
    query = db.query(Employee).filter(Employee.id == employee_id)
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    return query.first()


def create_employee(employee: EmployeeCreate, company_id: int, db: Session):
    existing_employee = db.query(Employee).filter(
        Employee.email == employee.email,
        Employee.company_id == company_id
    ).first()
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")
    
    department = get_or_create_department(employee.department, company_id, db)

    new_employee = Employee(
        name=employee.name,
        email=employee.email,
        phone=employee.phone,
        role=employee.role,
        department_id=department.id,
        company_id=company_id,
        status=employee.status,
        joined_date=employee.joined_date,
        date_of_birth=employee.date_of_birth,
        address=employee.address,
        salary=employee.salary,
        manager_name=employee.manager_name,
        skills=employee.skills,
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


def update_employee(employee_id: int, employee_data: EmployeeCreate, company_id: Optional[int], db: Session):
    query = db.query(Employee).filter(Employee.id == employee_id)
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)

    employee = query.first()
    if not employee:
        return None

    target_company_id = employee_data.company_id if employee_data.company_id is not None else employee.company_id
    department = get_or_create_department(employee_data.department, target_company_id, db)

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.phone = employee_data.phone
    employee.role = employee_data.role
    employee.department_id = department.id
    employee.company_id = target_company_id
    employee.status = employee_data.status
    employee.joined_date = employee_data.joined_date
    employee.date_of_birth = employee_data.date_of_birth
    employee.address = employee_data.address
    employee.salary = employee_data.salary
    employee.manager_name = employee_data.manager_name
    employee.skills = employee_data.skills

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(employee_id: int, company_id: Optional[int], db: Session):
    query = db.query(Employee).filter(Employee.id == employee_id)
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)

    employee = query.first()
    if not employee:
        return None

    db.delete(employee)
    db.commit()

    return employee