"""
Member Controller - Manages company members and user deactivation
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.notification import Notification
from app.models.reactivation_request import ReactivationRequest
from app.controllers.audit_controller import AuditController
from typing import List


class MemberController:
    """Controller for managing company members"""

    @staticmethod
    def get_all_members(db: Session, company_id: int) -> dict:
        """Get all members in a company (active and deactivated)"""
        try:
            members = db.query(Employee).filter(
                Employee.company_id == company_id
            ).all()

            active_members = []
            deactivated_members = []

            for member in members:
                member_data = {
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "role": member.role,
                    "department": member.department.name if member.department else None,
                    "status": member.status,
                    "joined_date": member.joined_date,
                    "phone": member.phone,
                    "is_account_active": member.is_account_active,
                }

                if member.is_account_active:
                    active_members.append(member_data)
                else:
                    deactivated_member = member_data.copy()
                    deactivated_member.update({
                        "deactivated_at": member.deactivated_at.isoformat() if member.deactivated_at else None,
                        "deactivation_reason": member.deactivation_reason,
                        "deactivated_by_email": member.deactivated_by_email,
                    })
                    deactivated_members.append(deactivated_member)

            return {
                "success": True,
                "total_members": len(members),
                "active_members": len(active_members),
                "deactivated_members": len(deactivated_members),
                "members": active_members,
                "deactivated_members_list": deactivated_members
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving members: {str(e)}",
                "code": "RETRIEVAL_ERROR"
            }

    @staticmethod
    def get_active_members(db: Session, company_id: int) -> dict:
        """Get only active members in a company"""
        try:
            members = db.query(Employee).filter(
                Employee.company_id == company_id,
                Employee.is_account_active == True
            ).all()

            members_list = []
            for member in members:
                members_list.append({
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "role": member.role,
                    "department": member.department.name if member.department else None,
                    "status": member.status,
                    "joined_date": member.joined_date,
                    "phone": member.phone,
                })

            return {
                "success": True,
                "members": members_list,
                "count": len(members_list)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving active members: {str(e)}",
                "code": "RETRIEVAL_ERROR"
            }

    @staticmethod
    def get_deactivated_members(db: Session, company_id: int) -> dict:
        """Get only deactivated members in a company"""
        try:
            members = db.query(Employee).filter(
                Employee.company_id == company_id,
                Employee.is_account_active == False
            ).all()

            members_list = []
            for member in members:
                members_list.append({
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "role": member.role,
                    "is_account_active": member.is_account_active,
                    "deactivated_at": member.deactivated_at.isoformat() if member.deactivated_at else None,
                    "deactivation_reason": member.deactivation_reason,
                    "deactivated_by_email": member.deactivated_by_email,
                })

            return {
                "success": True,
                "members": members_list,
                "count": len(members_list)
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving deactivated members: {str(e)}",
                "code": "RETRIEVAL_ERROR"
            }

    @staticmethod
    def deactivate_user(
        db: Session,
        user_email: str,
        admin_email: str,
        admin_name: str,
        company_id: int,
        reason: str = None
    ) -> dict:
        """Deactivate a user account"""
        try:
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

            if not user.is_account_active:
                return {
                    "success": False,
                    "message": "User account is already deactivated",
                    "code": "ALREADY_DEACTIVATED"
                }

            # Deactivate the account
            user.is_account_active = False
            user.deactivated_at = datetime.now(timezone.utc)
            user.deactivated_by_email = admin_email
            user.deactivation_reason = reason

            db.commit()

            # Log audit event
            AuditController.log_action(
                db=db,
                user_name=admin_name,
                action="User Deactivated",
                related_name=user.name,
                related_email=user_email,
                company_id=company_id,
                details=f"Account deactivated. Reason: {reason}" if reason else "Account deactivated"
            )

            # Send notification to admin
            notification = Notification(
                user_email=admin_email,
                message=f"You have deactivated the account for {user.name} ({user_email})",
                action="User Deactivated",
                related_employee_name=user.name,
                related_employee_email=user_email,
                company_id=company_id
            )
            db.add(notification)
            db.commit()

            return {
                "success": True,
                "message": f"User {user.name} has been deactivated",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "is_account_active": user.is_account_active
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error deactivating user: {str(e)}",
                "code": "DEACTIVATION_ERROR"
            }

    @staticmethod
    def reactivate_user(
        db: Session,
        user_email: str,
        admin_email: str,
        admin_name: str,
        company_id: int
    ) -> dict:
        """Reactivate a deactivated user account"""
        try:
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
                    "message": "User account is already active",
                    "code": "ALREADY_ACTIVE"
                }

            # Reactivate the account
            user.is_account_active = True
            user.deactivated_at = None
            user.deactivated_by_email = None
            user.deactivation_reason = None

            db.commit()

            # Log audit event
            AuditController.log_action(
                db=db,
                user_name=admin_name,
                action="User Activated",
                related_name=user.name,
                related_email=user_email,
                company_id=company_id,
                details=f"Account reactivated"
            )

            # Send notification to user
            notification = Notification(
                user_email=user_email,
                message="Your account has been reactivated",
                action="Account Reactivated",
                related_employee_name=user.name,
                related_employee_email=user_email,
                company_id=company_id
            )
            db.add(notification)

            # Send notification to admin
            admin_notification = Notification(
                user_email=admin_email,
                message=f"You have reactivated the account for {user.name}",
                action="User Reactivated",
                related_employee_name=user.name,
                related_employee_email=user_email,
                company_id=company_id
            )
            db.add(admin_notification)
            db.commit()

            return {
                "success": True,
                "message": f"User {user.name} has been reactivated",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "is_account_active": user.is_account_active
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error reactivating user: {str(e)}",
                "code": "REACTIVATION_ERROR"
            }

    @staticmethod
    def get_user_deactivation_status(db: Session, user_email: str, company_id: int) -> dict:
        """Check if a user's account is deactivated"""
        try:
            user = db.query(Employee).filter(
                Employee.email == user_email,
                Employee.company_id == company_id
            ).first()

            print(f"[DEBUG] Querying deactivation status for {user_email} in company {company_id}")
            print(f"[DEBUG] Found user: {user}")
            
            if not user:
                print(f"[DEBUG] No employee record found for {user_email}")
                return {
                    "is_deactivated": False,
                    "message": "User not found"
                }

            is_deactivated = not user.is_account_active
            print(f"[DEBUG] User {user_email} is_account_active={user.is_account_active}, is_deactivated={is_deactivated}")
            
            return {
                "is_deactivated": is_deactivated,
                "deactivation_reason": user.deactivation_reason,
                "deactivated_at": user.deactivated_at.isoformat() if user.deactivated_at else None,
                "deactivated_by_email": user.deactivated_by_email
            }

        except Exception as e:
            print(f"[ERROR] Exception checking deactivation status: {str(e)}")
            return {
                "is_deactivated": False,
                "message": f"Error checking deactivation status: {str(e)}"
            }
