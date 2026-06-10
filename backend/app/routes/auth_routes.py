import secrets
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.controllers.auth_controller import authenticate_user
from app.controllers.member_controller import MemberController
from app.schemas.auth_schema import LoginRequest
from app.database.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(credentials.email, credentials.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if user's account is deactivated
    result = MemberController.get_user_deactivation_status(db, credentials.email, user["company_id"])
    
    print(f"[DEBUG] Login deactivation check for {credentials.email}: {result}")
    
    if result.get("is_deactivated"):
        # Return special response indicating user is deactivated
        print(f"[DEBUG] User {credentials.email} is deactivated, sending deactivation response")
        return {
            "success": True,
            "user": user,
            "token": None,
            "is_deactivated": True,
            "deactivation_reason": result.get("deactivation_reason"),
            "deactivated_at": result.get("deactivated_at"),
            "deactivated_by_email": result.get("deactivated_by_email")
        }

    return {
        "success": True,
        "user": user,
        "token": secrets.token_hex(16),
        "is_deactivated": False
    }
