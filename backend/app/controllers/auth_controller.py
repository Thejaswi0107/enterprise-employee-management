from typing import Optional

AUTH_USERS = [
    {
        "email": "admin@gmail.com",
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
        "company_id": 1,
        "company": "Company A",
    },
    {
        "email": "user@gmail.com",
        "password": "user123",
        "name": "Normal User",
        "role": "user",
        "company_id": 1,
        "company": "Company A",
    },
    {
        "email": "adminb@gmail.com",
        "password": "admin123",
        "name": "Admin User B",
        "role": "admin",
        "company_id": 2,
        "company": "Company B",
    },
    {
        "email": "userb@gmail.com",
        "password": "user123",
        "name": "Normal User B",
        "role": "user",
        "company_id": 2,
        "company": "Company B",
    },
    {
        "email": "teju@gmail.com",
        "password": "test123",
        "name": "THEJASWI",
        "role": "user",
        "company_id": 1,
        "company": "Company A",
    },
    {
        "email": "keerthu@gmail.com",
        "password": "test123",
        "name": "keerthana",
        "role": "user",
        "company_id": 1,
        "company": "Company A",
    },
]


def authenticate_user(email: str, password: str, db=None) -> Optional[dict]:
    # First check AUTH_USERS (in-memory list)
    for user in AUTH_USERS:
        if user["email"] == email and user["password"] == password:
            return {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "company_id": user["company_id"],
                "company": user["company"],
            }

    # Then check Employee table in database (for users created via invitation)
    if db:
        from app.models.employee import Employee
        employee = db.query(Employee).filter(
            Employee.email == email,
            Employee.password == password
        ).first()
        
        if employee:
            return {
                "email": employee.email,
                "name": employee.name,
                "role": employee.role,
                "company_id": employee.company_id,
                "company": employee.company.name if employee.company else f"Company {employee.company_id}",
            }

    return None


def get_user_by_email(email: str) -> Optional[dict]:
    for user in AUTH_USERS:
        if user["email"] == email:
            return {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "company_id": user["company_id"],
                "company": user["company"],
            }

    return None
