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


def authenticate_user(email: str, password: str) -> Optional[dict]:
    for user in AUTH_USERS:
        if user["email"] == email and user["password"] == password:
            return {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "company_id": user["company_id"],
                "company": user["company"],
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
