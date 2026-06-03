from sqlalchemy.orm import Session
from app.controllers.department_controller import get_or_create_department
from app.models.employee import Employee
from app.schemas.employee_schema import EmployeeCreate


def get_all_employees(db: Session, company_id: int):
    return db.query(Employee).filter(Employee.company_id == company_id).all()


def get_employee_by_id(employee_id: int, db: Session, company_id: int):
    return (
        db.query(Employee)
        .filter(Employee.id == employee_id, Employee.company_id == company_id)
        .first()
    )


def create_employee(employee: EmployeeCreate, company_id: int, db: Session):
    department = get_or_create_department(employee.department, company_id, db)

    new_employee = Employee(
        name=employee.name,
        email=employee.email,
        role=employee.role,
        department_id=department.id,
        company_id=company_id,
        status=employee.status,
        joined_date=employee.joined_date,
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


def update_employee(employee_id: int, employee_data: EmployeeCreate, company_id: int, db: Session):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id, Employee.company_id == company_id)
        .first()
    )

    if not employee:
        return None

    department = get_or_create_department(employee_data.department, company_id, db)

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.role = employee_data.role
    employee.department_id = department.id
    employee.status = employee_data.status
    employee.joined_date = employee_data.joined_date

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(employee_id: int, company_id: int, db: Session):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id, Employee.company_id == company_id)
        .first()
    )

    if not employee:
        return None

    db.delete(employee)
    db.commit()

    return employee