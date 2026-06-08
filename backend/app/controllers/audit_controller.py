from ..models.audit_log import AuditLog


def create_audit_log(
    db,
    user_name: str,
    action: str,
    related_name: str = None,
    related_email: str = None,
    company_id: int = None,
    details: str = None,
):
    log = AuditLog(
        user_name=user_name,
        action=action,
        related_name=related_name,
        related_email=related_email,
        company_id=company_id,
        details=details,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_audit_logs(db, company_id: int = None, limit: int = None):
    query = db.query(AuditLog)
    if company_id is not None:
        query = query.filter(AuditLog.company_id == company_id)
    query = query.order_by(AuditLog.timestamp.desc())
    if limit is not None:
        query = query.limit(limit)
    return query.all()
