from fastapi import FastAPI
from app.routes.employee_routes import router
from app.config.settings import APP_NAME, APP_VERSION

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Employee API running successfully"}