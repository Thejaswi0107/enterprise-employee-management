from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..controllers.auth_controller import get_user_by_email
from ..schemas.role_change_schema import RoleChangeRequestCreate, RoleChangeRequestResponse, RoleChangeRequestApprovalReject
from ..controllers.role_change_controller import (
    create_role_change_request,
    get_role_change_requests,
    get_pending_requests,
    approve_role_change_request,
    get_user_requests
)
from ..controllers.activity_service import ActivityTracker

router = APIRouter(prefix="/api/role-change", tags=["role-change"])


@router.post("/request", response_model=dict)
def submit_role_change_request(
    request_data: RoleChangeRequestCreate,
    db: Session = Depends(get_db),
    request_user_email: Optional[str] = Header(None, alias="X-User-Email")
):
    """User submits a role change request"""
    try:
        new_request = create_role_change_request(db, request_data)
        request_user = get_user_by_email(request_user_email) if request_user_email else None
        requester_name = request_user["name"] if request_user else request_data.user_name
        request_company_id = request_user["company_id"] if request_user else None

        ActivityTracker.track_event(
            db,
            user_name=requester_name,
            user_email=request_user_email or request_data.user_email,
            action="Role Change Requested",
            employee_name=request_data.user_name,
            employee_email=request_data.user_email,
            company_id=request_company_id,
            details={
                "requested_role": request_data.requested_role,
                "assigned_admin": request_data.admin_email,
            },
            notification_recipients=[request_user_email or request_data.user_email, request_data.admin_email],
        )
        
        return {
            "success": True,
            "data": new_request.to_dict(),
            "message": "Role change request submitted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/pending")
def get_pending_role_requests(
    admin_email: str = None,
    db: Session = Depends(get_db)
):
    """Get all pending role change requests (for admin)"""
    try:
        requests = get_pending_requests(db, admin_email)
        return {
            "success": True,
            "data": [req.to_dict() for req in requests],
            "message": "Pending requests retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user")
def get_user_role_requests(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get role change requests for a specific user"""
    try:
        requests = get_user_requests(db, user_email)
        return {
            "success": True,
            "data": [req.to_dict() for req in requests],
            "message": "User requests retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/request/{request_id}")
def respond_to_role_change_request(
    request_id: int,
    response_data: RoleChangeRequestApprovalReject,
    db: Session = Depends(get_db),
    admin_email_header: Optional[str] = Header(None, alias="X-User-Email")
):
    """Admin approves or rejects a role change request"""
    try:
        updated_request = approve_role_change_request(db, request_id, response_data)
        
        if not updated_request:
            raise HTTPException(status_code=404, detail="Request not found")

        request_user = get_user_by_email(updated_request.user_email)
        request_company_id = request_user["company_id"] if request_user else None
        audit_user_name = None
        if admin_email_header:
            admin_user = get_user_by_email(admin_email_header)
            audit_user_name = admin_user["name"] if admin_user else admin_email_header
        else:
            audit_user_name = updated_request.admin_email

        action = "Role Change Approved" if response_data.status == "Approved" else "Role Change Rejected"
        ActivityTracker.track_event(
            db,
            user_name=audit_user_name,
            user_email=admin_email_header or updated_request.admin_email,
            action=action,
            employee_name=updated_request.user_name,
            employee_email=updated_request.user_email,
            company_id=request_company_id,
            details={"admin_comments": response_data.admin_comments or "None"},
            notification_recipients=[updated_request.user_email, admin_email_header] if admin_email_header else [updated_request.user_email],
        )
        
        return {
            "success": True,
            "data": updated_request.to_dict(),
            "message": f"Role change request {response_data.status.lower()} successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all")
def get_all_role_requests(
    db: Session = Depends(get_db)
):
    """Get all role change requests"""
    try:
        requests = get_role_change_requests(db)
        return {
            "success": True,
            "data": [req.to_dict() for req in requests],
            "message": "All requests retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
