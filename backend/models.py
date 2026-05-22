from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default="Active")
    joined_date = db.Column(db.Date, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "department": self.department,
            "status": self.status,
            "joined_date": self.joined_date.strftime("%Y-%m-%d")
        }