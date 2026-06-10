from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.db import get_db
from app.controllers.auth_controller import AUTH_USERS, get_user_by_email
from app.models.company_model import Company
from app.models.employee import Employee

router = APIRouter(prefix="/api/companies", tags=["companies"])


def get_current_user(
    user_email: str = Header(None, alias="X-User-Email")
):
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user authentication header")

    user = get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return user


@router.get("/companies")
def list_companies(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    company_counts = {
        1: {"slug": "company-a", "status": "Active"},
        2: {"slug": "company-b", "status": "Active"},
    }

    companies = db.query(Company).all()
    results = []

    for company in companies:
        employee_count = db.query(func.count(Employee.id)).filter(Employee.company_id == company.id).scalar() or 0
        user_count = len([user for user in AUTH_USERS if user["company_id"] == company.id])
        results.append(
            {
                "id": company.id,
                "name": company.name,
                "slug": company_counts.get(company.id, {}).get("slug", company.name.lower().replace(" ", "-")),
                "employeeCount": employee_count,
                "userCount": user_count,
                "status": company_counts.get(company.id, {}).get("status", "Active"),
            }
        )

    return {"success": True, "data": results}
