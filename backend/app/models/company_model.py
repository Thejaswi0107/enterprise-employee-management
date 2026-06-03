from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.db import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    departments = relationship("Department", back_populates="company")
    employees = relationship("Employee", back_populates="company")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }
