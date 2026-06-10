"""
Reactivation Controller - Manages account reactivation requests and approvals
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.reactivation_request import ReactivationRequest
from app.models.notification import Notification
from app.controllers.audit_controller import AuditController
from app.controllers.member_controller import MemberController
from app.controllers.auth_controller import get_user_by_email
from typing import Optional


class ReactivationController:
    """Controller for managing account reactivation requests"""

    @staticmethod
    def submit_reactivation_request(
        db: Session,
        user_email: str,
        user_name: str,
        company_id: int,
        reason: str
    ) -> dict:
        """Submit a reactivation request for a deactivated account"""
        try:
            # Check if user exists and is deactivated
            user = db.query(Employee).filter(
                Employee.email == user_email,
                Employee.company_id == company_id
            ).first()

            if not user:
                return {
                    "success": False,
                    "message": "User not found",
                    "code": "NOT_FOUND"
                }

            if user.is_account_active:
                return {
                    "success": False,
                    "message": "Account is already active",
                    "code": "ALREADY_ACTIVE"
                }

            # Check if there's already a pending request
            pending_request = db.query(ReactivationRequest).filter(
                ReactivationRequest.user_email == user_email,
                ReactivationRequest.company_id == company_id,
                ReactivationRequest.status == "pending"
            ).first()

            if pending_request:
                return {
                    "success": False,
                    "message": "A reactivation request is already pending",
                    "code": "REQUEST_EXISTS"
                }

            # Create reactivation request
            reactivation_request = ReactivationRequest(
                user_email=user_email,
                user_name=user_name,
                company_id=company_id,
                deactivated_by_email=user.deactivated_by_email,
                deactivated_by_name="Admin",  # Would need to look this up
                reason=reason,
                status="pending"
            )

            db.add(reactivation_request)
            db.commit()
            db.refresh(reactivation_request)

            # Send notification to admin who deactivated the user
            admin_notification = Notification(
                user_email=user.deactivated_by_email,
                message=f"{user_name} ({user_email}) has submitted a reactivation request",
                action="Reactivation Request Submitted",
                related_employee_name=user_name,
                related_employee_email=user_email,
                company_id=company_id
            )
            db.add(admin_notification)

            # Log audit event
            AuditController.log_action(
                db=db,
                user_name=user_name,
                action="Reactivation Request Submitted",
                related_name=user_name,
                related_email=user_email,
                company_id=company_id,
                details=f"Reason: {reason}"
            )

            db.commit()

            return {
                "success": True,
                "message": "Reactivation request submitted successfully",
                "request": {
                    "id": reactivation_request.id,
                    "status": reactivation_request.status,
                    "requested_at": reactivation_request.requested_at.isoformat()
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error submitting reactivation request: {str(e)}",
                "code": "SUBMIT_ERROR"
            }

    @staticmethod
    def get_pending_requests(db: Session, company_id: int) -> dict:
        """Get all pending reactivation requests for a company"""
        try:
            requests = db.query(ReactivationRequest).filter(
                ReactivationRequest.company_id == company_id,
                ReactivationRequest.status == "pending"
            ).all()

            requests_list = []
            for req in requests:
                requests_list.append({
                    "id": req.id,
                    "user_email": req.user_email,
                    "user_name": req.user_name,
                    "deactivated_by_email": req.deactivated_by_email,
                    "deactivated_by_name": req.deactivated_by_name,
                    "reason": req.reason,
                    "requested_at": req.requested_at.isoformat(),
                    "status": req.status
                })

            return {
                "success": True,
                "requests": requests_list,
                "count": len(requests_list)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving pending requests: {str(e)}",
                "code": "RETRIEVAL_ERROR"
            }

    @staticmethod
    def approve_reactivation_request(
        db: Session,
        request_id: int,
        admin_email: str,
        admin_name: str,
        company_id: int,
        response: str = None
    ) -> dict:
        """Approve a reactivation request and reactivate the user"""
        try:
            reactivation_request = db.query(ReactivationRequest).filter(
                ReactivationRequest.id == request_id,
                ReactivationRequest.company_id == company_id,
                ReactivationRequest.status == "pending"
            ).first()

            if not reactivation_request:
                return {
                    "success": False,
                    "message": "Reactivation request not found or already processed",
                    "code": "NOT_FOUND"
                }

            # Update reactivation request
            reactivation_request.status = "approved"
            reactivation_request.responded_at = datetime.now(timezone.utc)
            reactivation_request.responded_by_email = admin_email
            reactivation_request.responded_by_name = admin_name
            reactivation_request.admin_response = response or "Reactivation approved"

            db.commit()

            # Reactivate the user
            result = MemberController.reactivate_user(
                db=db,
                user_email=reactivation_request.user_email,
                admin_email=admin_email,
                admin_name=admin_name,
                company_id=company_id
            )

            if not result["success"]:
                return result

            # Send notification to user
            user_notification = Notification(
                user_email=reactivation_request.user_email,
                message=f"Your reactivation request has been approved by {admin_name}",
                action="Reactivation Approved",
                related_employee_name=reactivation_request.user_name,
                related_employee_email=reactivation_request.user_email,
                company_id=company_id
            )
            db.add(user_notification)

            # Log audit event
            AuditController.log_action(
                db=db,
                user_name=admin_name,
                action="Reactivation Approved",
                related_name=reactivation_request.user_name,
                related_email=reactivation_request.user_email,
                company_id=company_id,
                details=f"Response: {response}" if response else "Reactivation approved"
            )

            db.commit()

            return {
                "success": True,
                "message": "Reactivation request approved and user account reactivated"
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error approving reactivation request: {str(e)}",
                "code": "APPROVAL_ERROR"
            }

    @staticmethod
    def reject_reactivation_request(
        db: Session,
        request_id: int,
        admin_email: str,
        admin_name: str,
        company_id: int,
        response: str
    ) -> dict:
        """Reject a reactivation request"""
        try:
            reactivation_request = db.query(ReactivationRequest).filter(
                ReactivationRequest.id == request_id,
                ReactivationRequest.company_id == company_id,
                ReactivationRequest.status == "pending"
            ).first()

            if not reactivation_request:
                return {
                    "success": False,
                    "message": "Reactivation request not found or already processed",
                    "code": "NOT_FOUND"
                }

            # Update reactivation request
            reactivation_request.status = "rejected"
            reactivation_request.responded_at = datetime.now(timezone.utc)
            reactivation_request.responded_by_email = admin_email
            reactivation_request.responded_by_name = admin_name
            reactivation_request.admin_response = response

            db.commit()

            # Send notification to user
            user_notification = Notification(
                user_email=reactivation_request.user_email,
                message=f"Your reactivation request has been rejected by {admin_name}",
                action="Reactivation Rejected",
                related_employee_name=reactivation_request.user_name,
                related_employee_email=reactivation_request.user_email,
                company_id=company_id
            )
            db.add(user_notification)

            # Log audit event
            AuditController.log_action(
                db=db,
                user_name=admin_name,
                action="Reactivation Rejected",
                related_name=reactivation_request.user_name,
                related_email=reactivation_request.user_email,
                company_id=company_id,
                details=f"Reason: {response}"
            )

            db.commit()

            return {
                "success": True,
                "message": "Reactivation request rejected"
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error rejecting reactivation request: {str(e)}",
                "code": "REJECTION_ERROR"
            }

    @staticmethod
    def get_request_history(db: Session, company_id: int) -> dict:
        """Get complete reactivation request history"""
        try:
            requests = db.query(ReactivationRequest).filter(
                ReactivationRequest.company_id == company_id
            ).all()

            grouped = {
                "pending": [],
                "approved": [],
                "rejected": []
            }

            for req in requests:
                data = {
                    "id": req.id,
                    "user_email": req.user_email,
                    "user_name": req.user_name,
                    "status": req.status,
                    "reason": req.reason,
                    "requested_at": req.requested_at.isoformat(),
                }

                if req.responded_at:
                    data["responded_at"] = req.responded_at.isoformat()
                    data["responded_by"] = req.responded_by_email
                    data["admin_response"] = req.admin_response

                if req.status in grouped:
                    grouped[req.status].append(data)

            return {
                "success": True,
                "history": grouped,
                "total": len(requests)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving request history: {str(e)}",
                "code": "HISTORY_ERROR"
            }

    @staticmethod
    def get_account_status(db: Session, user_email: str, company_id: int) -> dict:
        """Get account status for a user"""
        try:
            user = db.query(Employee).filter(
                Employee.email == user_email,
                Employee.company_id == company_id
            ).first()

            if not user:
                auth_user = get_user_by_email(user_email)
                if auth_user and auth_user.get("company_id") == company_id:
                    return {
                        "success": True,
                        "account": {
                            "email": auth_user["email"],
                            "name": auth_user["name"],
                            "is_active": True,
                            "deactivated_at": None,
                            "deactivation_reason": None,
                            "deactivated_by_email": None,
                        }
                    }

                return {
                    "success": False,
                    "message": "User not found",
                    "code": "NOT_FOUND"
                }

            # Get pending reactivation request if any
            pending_request = db.query(ReactivationRequest).filter(
                ReactivationRequest.user_email == user_email,
                ReactivationRequest.company_id == company_id,
                ReactivationRequest.status == "pending"
            ).first()

            account_data = {
                "email": user.email,
                "name": user.name,
                "is_active": user.is_account_active,
                "deactivated_at": user.deactivated_at.isoformat() if user.deactivated_at else None,
                "deactivation_reason": user.deactivation_reason,
                "deactivated_by_email": user.deactivated_by_email,
            }

            if pending_request:
                account_data["pending_reactivation_request"] = {
                    "id": pending_request.id,
                    "status": pending_request.status,
                    "reason": pending_request.reason,
                    "requested_at": pending_request.requested_at.isoformat()
                }

            return {
                "success": True,
                "account": account_data
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving account status: {str(e)}",
                "code": "STATUS_ERROR"
            }
