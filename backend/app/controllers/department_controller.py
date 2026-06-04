from typing import Optional
from sqlalchemy.orm import Session
from app.models.department_model import Department


def get_or_create_department(name: str, company_id: int, db: Session) -> Department:
    department = (
        db.query(Department)
        .filter(Department.name == name, Department.company_id == company_id)
        .first()
    )

    if department is None:
        department = Department(name=name, company_id=company_id)
        db.add(department)
        db.commit()
        db.refresh(department)

    return department


def list_departments(db: Session, company_id: Optional[int] = None):
    query = db.query(Department)
    if company_id is not None:
        query = query.filter(Department.company_id == company_id)
    return query.all()


def get_department_by_id(department_id: int, db: Session):
    return db.query(Department).filter(Department.id == department_id).first()
