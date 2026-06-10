"""
Member Routes - API endpoints for managing company members and user deactivation
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controllers.member_controller import MemberController
from app.routes.employee_routes import get_current_user
from app.schemas.member_schema import MemberResponse, MembersListResponse, DeactivateUserRequest
from typing import List

router = APIRouter(prefix="/api/members", tags=["members"])


def verify_admin(current_user: dict = None):
    """Verify that the user is an admin"""
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/all")
def get_all_members(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all members in the user's company (active and deactivated)
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = MemberController.get_all_members(
            db=db,
            company_id=admin.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active")
def get_active_members(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get only active members in the user's company
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = MemberController.get_active_members(
            db=db,
            company_id=admin.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/deactivated")
def get_deactivated_members(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get only deactivated members in the user's company
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = MemberController.get_deactivated_members(
            db=db,
            company_id=admin.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deactivate/{user_email}")
def deactivate_user(
    user_email: str,
    request: DeactivateUserRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Deactivate a user account (user can still login but sees deactivation page)
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = MemberController.deactivate_user(
            db=db,
            user_email=user_email,
            admin_email=admin.get("email"),
            admin_name=admin.get("name"),
            company_id=admin.get("company_id"),
            reason=request.reason
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reactivate/{user_email}")
def reactivate_user(
    user_email: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Reactivate a deactivated user account
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = MemberController.reactivate_user(
            db=db,
            user_email=user_email,
            admin_email=admin.get("email"),
            admin_name=admin.get("name"),
            company_id=admin.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
