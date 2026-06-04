from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..schemas.role_change_schema import RoleChangeRequestCreate, RoleChangeRequestResponse, RoleChangeRequestApprovalReject
from ..controllers.role_change_controller import (
    create_role_change_request,
    get_role_change_requests,
    get_pending_requests,
    approve_role_change_request,
    get_user_requests
)
from ..controllers.audit_controller import create_audit_log

router = APIRouter(prefix="/api/role-change", tags=["role-change"])


@router.post("/request", response_model=dict)
def submit_role_change_request(
    request_data: RoleChangeRequestCreate,
    db: Session = Depends(get_db)
):
    """User submits a role change request"""
    try:
        new_request = create_role_change_request(db, request_data)
        create_audit_log(
            db,
            user_name=request_data.user_name,
            action="Role Change Requested",
            related_name=request_data.user_name,
            related_email=request_data.user_email,
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
    db: Session = Depends(get_db)
):
    """Admin approves or rejects a role change request"""
    try:
        updated_request = approve_role_change_request(db, request_id, response_data)
        
        if not updated_request:
            raise HTTPException(status_code=404, detail="Request not found")

        create_audit_log(
            db,
            user_name=updated_request.admin_email,
            action=("Role Change Approved" if response_data.status == "Approved" else "Role Change Rejected"),
            related_name=updated_request.user_name,
            related_email=updated_request.user_email,
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
