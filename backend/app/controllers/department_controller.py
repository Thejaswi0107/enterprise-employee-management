from sqlalchemy.orm import Session
from app.models.department_model import Department


def get_or_create_department(name: str, db: Session) -> Department:
    department = db.query(Department).filter(Department.name == name).first()

    if department is None:
        department = Department(name=name)
        db.add(department)
        db.commit()
        db.refresh(department)

    return department


def list_departments(db: Session):
    return db.query(Department).all()


def get_department_by_id(department_id: int, db: Session):
    return db.query(Department).filter(Department.id == department_id).first()
