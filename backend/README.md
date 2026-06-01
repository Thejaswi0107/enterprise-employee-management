# Backend - Enterprise Employee Management

This backend uses FastAPI and a simple SQLite database seeded with mock JSON data.

Structure
```
backend/
├── app/                 # FastAPI app package (routes, controllers, models, database)
├── requirements.txt
├── run.py               # FastAPI application entrypoint (uvicorn: `run:app`)
└── README.md
```

Available endpoints
- GET `/employees` - list employees (returns JSON)
- GET `/employees/{id}` - get employee by id (returns JSON)
- GET `/departments` - list departments (returns JSON)

Database and API flow
1. `run.py` creates the SQLite database using SQLAlchemy and `Base.metadata.create_all(bind=engine)`.
2. Data is seeded from `app/database/mock_data.py` only when the `employees` table is empty.
3. `app/database/db.py` provides `SessionLocal` and `get_db()` for request-scoped DB sessions.
4. `app/routes/employee_routes.py` handles API requests and delegates CRUD operations to controllers.
5. `app/controllers/employee_controller.py` performs database operations on the `Employee` model.
6. `app/models/department_model.py` stores unique departments and connects employees through `department_id`.
7. Responses are returned as JSON wrappers with `success` and `data` fields.

The project seeds initial mock data from `app/database/mock_data.py` into SQLite on first run.

Run locally

1. Create a virtual env and install dependencies:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start the server with uvicorn:

```powershell
py -m uvicorn run:app --reload
```

3. Test endpoints (example):

```powershell
curl http://127.0.0.1:8000/employees
curl http://127.0.0.1:8000/employees/1
```

Notes
- The FastAPI app is the supported backend now. A legacy Flask-based `app.py` existed and has been archived under `backend/legacy/`.
