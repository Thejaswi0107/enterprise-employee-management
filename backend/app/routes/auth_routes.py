import secrets
from fastapi import APIRouter, HTTPException
from app.controllers.auth_controller import authenticate_user
from app.schemas.auth_schema import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(credentials: LoginRequest):
    user = authenticate_user(credentials.email, credentials.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "success": True,
        "user": user,
        "token": secrets.token_hex(16),
    }
