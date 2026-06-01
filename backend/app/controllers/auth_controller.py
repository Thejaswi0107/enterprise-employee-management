from typing import Optional

AUTH_USERS = [
    {
        "email": "admin@gmail.com",
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
    },
    {
        "email": "user@gmail.com",
        "password": "user123",
        "name": "Normal User",
        "role": "user",
    },
]


def authenticate_user(email: str, password: str) -> Optional[dict]:
    for user in AUTH_USERS:
        if user["email"] == email and user["password"] == password:
            return {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
            }

    return None
