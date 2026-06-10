import sys
from pathlib import Path

# Ensure backend/app is importable when running from the workspace root.
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.database.db import engine, Base, SessionLocal
from app.routes.employee_routes import router as employee_router
from app.routes.auth_routes import router as auth_router
from app.routes.role_change_routes import router as role_change_router
from app.routes.company_routes import router as company_router
from app.routes.invitation_routes import router as invitation_router
from app.routes.member_routes import router as member_router
from app.routes.reactivation_routes import router as reactivation_router
from app.models.employee import Employee
from app.models.department_model import Department
from app.models.company_model import Company
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.database.mock_data import employees as mock_employees

Base.metadata.create_all(bind=engine)


def migrate_legacy_schema():
    inspector = inspect(engine)
    if "employees" not in inspector.get_table_names():
        return

    employee_columns = [column["name"] for column in inspector.get_columns("employees")]
    companies_exist = "companies" in inspector.get_table_names()

    with engine.begin() as conn:
        if not companies_exist:
            conn.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS companies ("
                    "id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL)"
                )
            )
            conn.execute(
                text(
                    "INSERT OR IGNORE INTO companies (id, name) VALUES (1, 'Company A')"
                )
            )

        if "department_id" not in employee_columns:
            legacy_rows = conn.execute(
                text(
                    "SELECT id, name, email, role, department, status, joined_date FROM employees"
                )
            ).fetchall()

            # Upgrade legacy departments to include company_id when needed
            if "departments" in inspector.get_table_names():
                department_columns = [column["name"] for column in inspector.get_columns("departments")]
                if "company_id" not in department_columns:
                    conn.execute(
                        text(
                            "CREATE TABLE IF NOT EXISTS departments_temp ("
                            "id INTEGER PRIMARY KEY, name TEXT NOT NULL, company_id INTEGER NOT NULL, "
                            "FOREIGN KEY(company_id) REFERENCES companies(id))"
                        )
                    )
                    conn.execute(
                        text(
                            "INSERT INTO departments_temp (id, name, company_id) "
                            "SELECT id, name, 1 FROM departments"
                        )
                    )
                    conn.execute(text("DROP TABLE departments"))
                    conn.execute(text("ALTER TABLE departments_temp RENAME TO departments"))

            # Create departments from legacy employee data
            department_map = {}
            for row in legacy_rows:
                if row["department"] not in department_map:
                    conn.execute(
                        text(
                            "INSERT OR IGNORE INTO departments (name, company_id) VALUES (:name, 1)"
                        ),
                        {"name": row["department"]},
                    )
                    department_map[row["department"]] = None

            departments = conn.execute(text("SELECT id, name FROM departments")).fetchall()
            department_map = {row["name"]: row["id"] for row in departments}

            conn.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS employees_temp ("
                    "id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, "
                    "role TEXT NOT NULL, department_id INTEGER NOT NULL, company_id INTEGER NOT NULL, "
                    "status TEXT NOT NULL, joined_date TEXT NOT NULL, "
                    "FOREIGN KEY(department_id) REFERENCES departments(id), "
                    "FOREIGN KEY(company_id) REFERENCES companies(id))"
                )
            )

            for row in legacy_rows:
                conn.execute(
                    text(
                        "INSERT INTO employees_temp (id, name, email, role, department_id, company_id, status, joined_date) "
                        "VALUES (:id, :name, :email, :role, :department_id, :company_id, :status, :joined_date)"
                    ),
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "email": row["email"],
                        "role": row["role"],
                        "department_id": department_map[row["department"]],
                        "company_id": 1,
                        "status": row["status"],
                        "joined_date": row["joined_date"],
                    },
                )

            conn.execute(text("DROP TABLE employees"))
            conn.execute(text("ALTER TABLE employees_temp RENAME TO employees"))
            employee_columns = [column["name"] for column in inspector.get_columns("employees")]

        if "company_id" not in employee_columns:
            conn.execute(
                text(
                    "INSERT OR IGNORE INTO companies (id, name) VALUES (1, 'Company A')"
                )
            )
            conn.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS employees_temp ("
                    "id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, "
                    "role TEXT NOT NULL, department_id INTEGER NOT NULL, company_id INTEGER NOT NULL, "
                    "status TEXT NOT NULL, joined_date TEXT NOT NULL, "
                    "FOREIGN KEY(department_id) REFERENCES departments(id), "
                    "FOREIGN KEY(company_id) REFERENCES companies(id))"
                )
            )
            conn.execute(
                text(
                    "INSERT INTO employees_temp (id, name, email, role, department_id, company_id, status, joined_date) "
                    "SELECT id, name, email, role, department_id, 1, status, joined_date FROM employees"
                )
            )
            conn.execute(text("DROP TABLE employees"))
            conn.execute(text("ALTER TABLE employees_temp RENAME TO employees"))

            employee_columns = [column["name"] for column in inspector.get_columns("employees")]

        if "is_account_active" not in employee_columns:
            conn.execute(text("ALTER TABLE employees ADD COLUMN is_account_active BOOLEAN NOT NULL DEFAULT 1"))
        if "deactivated_at" not in employee_columns:
            conn.execute(text("ALTER TABLE employees ADD COLUMN deactivated_at TEXT"))
        if "deactivated_by_email" not in employee_columns:
            conn.execute(text("ALTER TABLE employees ADD COLUMN deactivated_by_email TEXT"))
        if "deactivation_reason" not in employee_columns:
            conn.execute(text("ALTER TABLE employees ADD COLUMN deactivation_reason TEXT"))

        department_columns = [column["name"] for column in inspector.get_columns("departments")]
        if "company_id" not in department_columns:
            conn.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS departments_temp ("
                    "id INTEGER PRIMARY KEY, name TEXT NOT NULL, company_id INTEGER NOT NULL, "
                    "FOREIGN KEY(company_id) REFERENCES companies(id))"
                )
            )
            conn.execute(
                text(
                    "INSERT INTO departments_temp (id, name, company_id) "
                    "SELECT id, name, 1 FROM departments"
                )
            )
            conn.execute(text("DROP TABLE departments"))
            conn.execute(text("ALTER TABLE departments_temp RENAME TO departments"))


migrate_legacy_schema()


def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(Employee).count() == 0:
            company_a = db.query(Company).filter(Company.name == "Company A").first()
            company_b = db.query(Company).filter(Company.name == "Company B").first()

            if company_a is None:
                company_a = Company(name="Company A")
                db.add(company_a)
                db.commit()
                db.refresh(company_a)

            if company_b is None:
                company_b = Company(name="Company B")
                db.add(company_b)
                db.commit()
                db.refresh(company_b)

            department_cache = {}

            for item in mock_employees:
                company_name = item.get("company", "Company A")
                company = company_a if company_name == "Company A" else company_b

                department_key = (company.id, item["department"])
                department = department_cache.get(department_key)

                if department is None:
                    department = (
                        db.query(Department)
                        .filter(
                            Department.name == item["department"],
                            Department.company_id == company.id,
                        )
                        .first()
                    )

                    if department is None:
                        department = Department(
                            name=item["department"],
                            company_id=company.id,
                        )
                        db.add(department)
                        db.commit()
                        db.refresh(department)

                    department_cache[department_key] = department

                db.add(
                    Employee(
                        name=item["name"],
                        email=item["email"],
                        role=item["role"],
                        department_id=department.id,
                        company_id=company.id,
                        status=item["status"],
                        joined_date=item["joined_date"],
                    )
                )
            db.commit()
    finally:
        db.close()


seed_initial_data()

app = FastAPI(
    title="Enterprise Employee Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(auth_router)
app.include_router(role_change_router)
app.include_router(company_router)
app.include_router(invitation_router)
app.include_router(member_router)
app.include_router(reactivation_router)

@app.get("/")
def home():
    return {
        "message": "Employee API running successfully"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)