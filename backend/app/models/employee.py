from sqlalchemy import Column, ForeignKey, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.db import Base
from datetime import datetime, timezone


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    status = Column(String, nullable=False)
    joined_date = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    address = Column(String, nullable=True)
    salary = Column(Float, nullable=True)
    manager_name = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Comma-separated skills
    password = Column(String, nullable=True)  # Password for users who signed up via invitation
    is_account_active = Column(Boolean, nullable=False, default=True)  # Account deactivation status
    deactivated_at = Column(DateTime, nullable=True)  # When account was deactivated
    deactivated_by_email = Column(String, nullable=True)  # Admin who deactivated
    deactivation_reason = Column(String, nullable=True)  # Reason for deactivation

    department = relationship("Department", back_populates="employees")
    company = relationship("Company", back_populates="employees")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "department": self.department.name if self.department else None,
            "company_id": self.company_id,
            "company": self.company.name if self.company else None,
            "status": self.status,
            "joined_date": self.joined_date,
            "date_of_birth": self.date_of_birth,
            "address": self.address,
            "salary": self.salary,
            "manager_name": self.manager_name,
            "skills": self.skills,
            "is_account_active": self.is_account_active,
            "deactivated_at": self.deactivated_at.isoformat() if self.deactivated_at else None,
            "deactivated_by_email": self.deactivated_by_email,
            "deactivation_reason": self.deactivation_reason,
        }