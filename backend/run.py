from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.database.db import engine, Base, SessionLocal
from app.routes.employee_routes import router as employee_router
from app.routes.auth_routes import router as auth_router
from app.models.employee import Employee
from app.models.department_model import Department
from app.database.mock_data import employees as mock_employees

Base.metadata.create_all(bind=engine)


def migrate_legacy_schema():
    inspector = inspect(engine)
    if "employees" not in inspector.get_table_names():
        return

    columns = [column["name"] for column in inspector.get_columns("employees")]
    if "department_id" in columns:
        return

    with engine.begin() as conn:
        legacy_rows = conn.execute(
            text(
                "SELECT id, name, email, role, department, status, joined_date FROM employees"
            )
        ).fetchall()

        # Create departments from legacy employee data
        department_map = {}
        for row in legacy_rows:
            if row["department"] not in department_map:
                result = conn.execute(
                    text("INSERT OR IGNORE INTO departments (name) VALUES (:name)"),
                    {"name": row["department"]},
                )
                department_map[row["department"]] = None

        departments = conn.execute(text("SELECT id, name FROM departments")).fetchall()
        department_map = {row["name"]: row["id"] for row in departments}

        conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS employees_temp ("
                "id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, "
                "role TEXT NOT NULL, department_id INTEGER NOT NULL, status TEXT NOT NULL, "
                "joined_date TEXT NOT NULL, FOREIGN KEY(department_id) REFERENCES departments(id))"
            )
        )

        for row in legacy_rows:
            conn.execute(
                text(
                    "INSERT INTO employees_temp (id, name, email, role, department_id, status, joined_date) "
                    "VALUES (:id, :name, :email, :role, :department_id, :status, :joined_date)"
                ),
                {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "role": row["role"],
                    "department_id": department_map[row["department"]],
                    "status": row["status"],
                    "joined_date": row["joined_date"],
                },
            )

        conn.execute(text("DROP TABLE employees"))
        conn.execute(text("ALTER TABLE employees_temp RENAME TO employees"))


migrate_legacy_schema()


def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(Employee).count() == 0:
            department_cache = {}

            for item in mock_employees:
                department_name = item["department"]
                department = department_cache.get(department_name)

                if department is None:
                    department = db.query(Department).filter(
                        Department.name == department_name
                    ).first()

                    if department is None:
                        department = Department(name=department_name)
                        db.add(department)
                        db.commit()
                        db.refresh(department)

                    department_cache[department_name] = department

                db.add(
                    Employee(
                        name=item["name"],
                        email=item["email"],
                        role=item["role"],
                        department_id=department.id,
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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "Employee API running successfully"
    }