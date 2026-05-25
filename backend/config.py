import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

APP_NAME = "Enterprise Employee Management API"
APP_VERSION = "1.0.0"

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False