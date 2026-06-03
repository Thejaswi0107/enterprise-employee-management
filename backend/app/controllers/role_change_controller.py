from datetime import datetime
from ..models.role_change_request import RoleChangeRequest
from ..schemas.role_change_schema import RoleChangeRequestCreate, RoleChangeRequestApprovalReject


def create_role_change_request(db, request_data: RoleChangeRequestCreate):
    """Create a new role change request"""
    new_request = RoleChangeRequest(
        user_id=request_data.user_email.split("@")[0].__hash__() % 10000,
        user_email=request_data.user_email,
        user_name=request_data.user_name,
        requested_role=request_data.requested_role,
        admin_email=request_data.admin_email,
        status="Pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


def get_role_change_requests(db, admin_email: str = None):
    """Get all role change requests, optionally filtered by admin email"""
    query = db.query(RoleChangeRequest)
    
    if admin_email:
        query = query.filter(RoleChangeRequest.admin_email == admin_email)
    
    return query.all()


def get_pending_requests(db, admin_email: str = None):
    """Get pending role change requests"""
    query = db.query(RoleChangeRequest).filter(RoleChangeRequest.status == "Pending")
    
    if admin_email:
        query = query.filter(RoleChangeRequest.admin_email == admin_email)
    
    return query.all()


def approve_role_change_request(db, request_id: int, approval_data: RoleChangeRequestApprovalReject):
    """Approve a role change request"""
    role_request = db.query(RoleChangeRequest).filter(RoleChangeRequest.id == request_id).first()
    
    if not role_request:
        return None
    
    role_request.status = approval_data.status
    role_request.response_date = datetime.utcnow()
    role_request.admin_comments = approval_data.admin_comments
    
    db.commit()
    db.refresh(role_request)
    return role_request


def get_user_requests(db, user_email: str):
    """Get role change requests for a specific user"""
    return db.query(RoleChangeRequest).filter(
        RoleChangeRequest.user_email == user_email
    ).all()
