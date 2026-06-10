"""
Invitation Routes - API endpoints for managing user invitations
Only accessible to Admin users
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controllers.invitation_controller import InvitationController
from app.routes.employee_routes import get_current_user
from app.schemas.invitation_schema import CreateInvitationRequest, InvitationListResponse, AcceptInvitationRequest
from typing import List

router = APIRouter(prefix="/api/invitations", tags=["invitations"])


# Dependency to check if user is admin
def verify_admin(current_user: dict = None):
    """Verify that the user is an admin"""
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.post("/create")
def create_invitation(
    request: CreateInvitationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new invitation for a user
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = InvitationController.create_invitation(
            db=db,
            email=request.email,
            invited_by_email=admin.get("email"),
            invited_by_name=admin.get("name"),
            company_id=admin.get("company_id"),
            role=request.role
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active")
def get_active_invitations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all active (pending) invitations for the user's company
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = InvitationController.get_active_invitations(
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


@router.post("/revoke/{invitation_id}")
def revoke_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Revoke a pending invitation
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = InvitationController.revoke_invitation(
            db=db,
            invitation_id=invitation_id,
            revoked_by_email=admin.get("email"),
            revoked_by_name=admin.get("name"),
            company_id=admin.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/verify/{token}")
def verify_invitation_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify an invitation token (public endpoint)
    Returns invitation details if valid
    """
    try:
        result = InvitationController.verify_invitation_token(
            db=db,
            token=token
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/accept/{token}")
def accept_invitation(
    token: str,
    request: AcceptInvitationRequest,
    db: Session = Depends(get_db)
):
    """
    Accept an invitation and complete signup
    Public endpoint for new users
    """
    try:
        # Get invitation details first
        verify_result = InvitationController.verify_invitation_token(db, token)
        if not verify_result["success"]:
            raise HTTPException(status_code=400, detail=verify_result["message"])

        invitation_data = verify_result["invitation"]

        result = InvitationController.accept_invitation(
            db=db,
            token=token,
            email=request.email,
            name=request.name,
            password=request.password,
            company_id=invitation_data["company_id"],
            role=invitation_data["role"]
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_invitation_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get complete invitation history (pending, accepted, revoked, expired)
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = InvitationController.get_invitation_history(
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
