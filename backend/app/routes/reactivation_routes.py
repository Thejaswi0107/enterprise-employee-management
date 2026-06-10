"""
Reactivation Routes - API endpoints for managing account deactivation and reactivation requests
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controllers.reactivation_controller import ReactivationController
from app.routes.employee_routes import get_current_user
from app.schemas.reactivation_schema import (
    ReactivationRequestCreate,
    ReactivationApprovalRequest,
    ReactivationRejectionRequest,
    AccountStatusResponse
)
from typing import Optional

router = APIRouter(prefix="/api/reactivation", tags=["reactivation"])


def verify_admin(current_user: dict = None):
    """Verify that the user is an admin"""
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def get_user_from_token(current_user: dict = None):
    """Get authenticated user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user


@router.post("/request")
def submit_reactivation_request(
    request: ReactivationRequestCreate,
    db: Session = Depends(get_db),
    x_user_email: Optional[str] = Header(None),
    x_user_company_id: Optional[int] = Header(None)
):
    """
    Submit a reactivation request for a deactivated account
    Can be called by deactivated users without full authentication
    Requires X-User-Email and X-User-Company-Id headers
    """
    try:
        if not x_user_email or x_user_company_id is None:
            raise HTTPException(status_code=400, detail="Missing required headers: X-User-Email, X-User-Company-Id")

        # Get user details from database
        from app.models.employee import Employee
        user = db.query(Employee).filter(
            Employee.email == x_user_email,
            Employee.company_id == x_user_company_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        result = ReactivationController.submit_reactivation_request(
            db=db,
            user_email=x_user_email,
            user_name=user.name,
            company_id=x_user_company_id,
            reason=request.reason
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all pending reactivation requests for the user's company
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = ReactivationController.get_pending_requests(
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


@router.post("/approve/{request_id}")
def approve_reactivation_request(
    request_id: int,
    approval_request: ReactivationApprovalRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Approve a reactivation request and reactivate the user
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = ReactivationController.approve_reactivation_request(
            db=db,
            request_id=request_id,
            admin_email=admin.get("email"),
            admin_name=admin.get("name"),
            company_id=admin.get("company_id"),
            response=approval_request.response
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reject/{request_id}")
def reject_reactivation_request(
    request_id: int,
    rejection_request: ReactivationRejectionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Reject a reactivation request
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = ReactivationController.reject_reactivation_request(
            db=db,
            request_id=request_id,
            admin_email=admin.get("email"),
            admin_name=admin.get("name"),
            company_id=admin.get("company_id"),
            response=rejection_request.response
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_request_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get complete reactivation request history
    Only accessible to admins
    """
    try:
        admin = verify_admin(current_user)

        result = ReactivationController.get_request_history(
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


@router.get("/account-status")
def get_account_status(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get account status for the current user
    Used to check if account is deactivated and show appropriate page
    """
    try:
        user = get_user_from_token(current_user)

        result = ReactivationController.get_account_status(
            db=db,
            user_email=user.get("email"),
            company_id=user.get("company_id")
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
