"""
Invitation Controller - Manages user invitations for company
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user_invitation import UserInvitation
from app.models.notification import Notification
from app.models.employee import Employee
from app.models.department_model import Department
from app.schemas.invitation_schema import CreateInvitationRequest, InvitationResponse, InvitationListResponse
from typing import List, Optional
import secrets
from app.controllers.auth_controller import AUTH_USERS


class InvitationController:
    """Controller for managing user invitations"""

    @staticmethod
    def create_invitation(
        db: Session,
        email: str,
        invited_by_email: str,
        invited_by_name: str,
        company_id: int,
        role: str = "user",
    ) -> dict:
        """
        Create a new invitation for a user
        Returns invitation details with token
        """
        try:
            # Check if user already has pending invitation
            existing = db.query(UserInvitation).filter(
                UserInvitation.email == email,
                UserInvitation.company_id == company_id,
                UserInvitation.status == "pending"
            ).first()

            if existing:
                return {
                    "success": False,
                    "message": "Pending invitation already exists for this email",
                    "code": "INVITATION_EXISTS"
                }

            # Generate unique token
            token = UserInvitation.generate_token()

            # Set expiration to 7 days from now
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)

            # Create invitation
            invitation = UserInvitation(
                invitation_token=token,
                email=email,
                invited_by_email=invited_by_email,
                company_id=company_id,
                role=role,
                status="pending",
                expires_at=expires_at
            )

            db.add(invitation)
            db.commit()
            db.refresh(invitation)

            # Create invitation link
            invitation_link = f"http://localhost:5174/accept-invitation/{token}"

            # Log audit event
            from app.controllers.audit_controller import AuditController
            AuditController.log_action(
                db=db,
                user_name=invited_by_name,
                action="Invitation Created",
                related_name=None,
                related_email=email,
                company_id=company_id,
                details=f"Invited {email} to join as {role}"
            )

            return {
                "success": True,
                "message": "Invitation created successfully",
                "invitation": {
                    "id": invitation.id,
                    "email": invitation.email,
                    "token": token,
                    "invitation_link": invitation_link,
                    "expires_at": expires_at.isoformat(),
                    "role": role
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error creating invitation: {str(e)}",
                "code": "CREATION_ERROR"
            }

    @staticmethod
    def get_active_invitations(db: Session, company_id: int) -> dict:
        """Get all active (pending) invitations for a company"""
        try:
            invitations = db.query(UserInvitation).filter(
                UserInvitation.company_id == company_id,
                UserInvitation.status == "pending"
            ).all()

            invitation_list = []
            for inv in invitations:
                invitation_list.append({
                    "id": inv.id,
                    "email": inv.email,
                    "role": inv.role,
                    "status": inv.status,
                    "created_at": inv.created_at.isoformat(),
                    "expires_at": inv.expires_at.isoformat(),
                    "invited_by_email": inv.invited_by_email,
                    "invitation_token": inv.invitation_token,
                })

            return {
                "success": True,
                "invitations": invitation_list,
                "count": len(invitation_list)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving invitations: {str(e)}",
                "code": "RETRIEVAL_ERROR"
            }

    @staticmethod
    def revoke_invitation(
        db: Session,
        invitation_id: int,
        revoked_by_email: str,
        revoked_by_name: str,
        company_id: int
    ) -> dict:
        """Revoke a pending invitation"""
        try:
            invitation = db.query(UserInvitation).filter(
                UserInvitation.id == invitation_id,
                UserInvitation.company_id == company_id,
                UserInvitation.status == "pending"
            ).first()

            if not invitation:
                return {
                    "success": False,
                    "message": "Invitation not found or already processed",
                    "code": "NOT_FOUND"
                }

            invitation.status = "revoked"
            invitation.revoked_at = datetime.now(timezone.utc)
            invitation.revoked_by_email = revoked_by_email

            db.commit()

            # Log audit event
            from app.controllers.audit_controller import AuditController
            AuditController.log_action(
                db=db,
                user_name=revoked_by_name,
                action="Invitation Revoked",
                related_name=None,
                related_email=invitation.email,
                company_id=company_id,
                details=f"Revoked invitation for {invitation.email}"
            )

            return {
                "success": True,
                "message": "Invitation revoked successfully"
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error revoking invitation: {str(e)}",
                "code": "REVOKE_ERROR"
            }

    @staticmethod
    def verify_invitation_token(db: Session, token: str) -> dict:
        """Verify invitation token and check if valid"""
        try:
            invitation = db.query(UserInvitation).filter(
                UserInvitation.invitation_token == token
            ).first()

            if not invitation:
                return {
                    "success": False,
                    "message": "Invalid invitation token",
                    "code": "INVALID_TOKEN"
                }

            if invitation.status != "pending":
                return {
                    "success": False,
                    "message": f"Invitation has already been {invitation.status}",
                    "code": "INVALID_STATUS"
                }

            # Check if expired
            expires_at = invitation.expires_at
            # Ensure expires_at is timezone-aware for comparison
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if datetime.now(timezone.utc) > expires_at:
                invitation.status = "expired"
                db.commit()
                return {
                    "success": False,
                    "message": "Invitation has expired",
                    "code": "EXPIRED"
                }

            return {
                "success": True,
                "invitation": {
                    "email": invitation.email,
                    "role": invitation.role,
                    "company_id": invitation.company_id
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error verifying token: {str(e)}",
                "code": "VERIFICATION_ERROR"
            }

    @staticmethod
    def accept_invitation(
        db: Session,
        token: str,
        email: str,
        name: str,
        password: str,
        company_id: int,
        role: str
    ) -> dict:
        """Accept invitation, mark as accepted, and create user account"""
        try:
            invitation = db.query(UserInvitation).filter(
                UserInvitation.invitation_token == token,
                UserInvitation.email == email,
                UserInvitation.company_id == company_id
            ).first()

            if not invitation:
                return {
                    "success": False,
                    "message": "Invalid invitation",
                    "code": "INVALID_INVITATION"
                }

            if invitation.status != "pending":
                return {
                    "success": False,
                    "message": f"Invitation has already been {invitation.status}",
                    "code": "INVALID_STATUS"
                }

            expires_at = invitation.expires_at
            # Ensure expires_at is timezone-aware for comparison
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if datetime.now(timezone.utc) > expires_at:
                invitation.status = "expired"
                db.commit()
                return {
                    "success": False,
                    "message": "Invitation has expired",
                    "code": "EXPIRED"
                }

            # Create user account in AUTH_USERS
            new_user = {
                "email": email,
                "password": password,
                "name": name,
                "role": role,
                "company_id": company_id,
                "company": f"Company {chr(64 + company_id)}" if company_id <= 2 else f"Company {company_id}"
            }
            AUTH_USERS.append(new_user)

            # Create Employee record so user appears in Members
            # Get or create default department
            department = db.query(Department).filter(
                Department.company_id == company_id,
                Department.name == "General"
            ).first()
            
            if not department:
                # Create default department if it doesn't exist
                department = Department(
                    name="General",
                    company_id=company_id
                )
                db.add(department)
                db.commit()
                db.refresh(department)

            # Check if employee already exists
            existing_employee = db.query(Employee).filter(
                Employee.email == email,
                Employee.company_id == company_id
            ).first()

            if existing_employee:
                # Update existing employee instead of creating new one
                existing_employee.name = name
                existing_employee.role = role
                existing_employee.password = password
                existing_employee.is_account_active = True
                existing_employee.status = "Active"
                existing_employee.joined_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                if existing_employee.department_id is None:
                    existing_employee.department_id = department.id
                db.commit()
                employee = existing_employee
            else:
                # Create new employee record
                employee = Employee(
                    name=name,
                    email=email,
                    role=role,
                    department_id=department.id,
                    company_id=company_id,
                    status="Active",
                    joined_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    is_account_active=True,  # Account is active when created
                    password=password,
                    phone=None,
                    date_of_birth=None,
                    address=None,
                    salary=None,
                    manager_name=None,
                    skills=None
                )
                db.add(employee)
                db.commit()

            # Mark invitation as accepted
            invitation.status = "accepted"
            invitation.accepted_at = datetime.now(timezone.utc)
            db.commit()

            return {
                "success": True,
                "message": "Invitation accepted successfully",
                "role": invitation.role,
                "company_id": invitation.company_id,
                "email": email,
                "name": name
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error accepting invitation: {str(e)}",
                "code": "ACCEPT_ERROR"
            }

    @staticmethod
    def get_invitation_history(db: Session, company_id: int) -> dict:
        """Get complete invitation history (pending, accepted, revoked, expired)"""
        try:
            invitations = db.query(UserInvitation).filter(
                UserInvitation.company_id == company_id
            ).all()

            grouped = {
                "pending": [],
                "accepted": [],
                "revoked": [],
                "expired": []
            }

            for inv in invitations:
                data = {
                    "id": inv.id,
                    "email": inv.email,
                    "role": inv.role,
                    "created_at": inv.created_at.isoformat(),
                    "expires_at": inv.expires_at.isoformat(),
                    "invited_by_email": inv.invited_by_email,
                }

                if inv.status in grouped:
                    if inv.accepted_at:
                        data["accepted_at"] = inv.accepted_at.isoformat()
                    if inv.revoked_at:
                        data["revoked_at"] = inv.revoked_at.isoformat()
                        data["revoked_by"] = inv.revoked_by_email

                    grouped[inv.status].append(data)

            return {
                "success": True,
                "history": grouped,
                "total": len(invitations)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving invitation history: {str(e)}",
                "code": "HISTORY_ERROR"
            }
