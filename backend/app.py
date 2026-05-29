from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Employee
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/api/employees", methods=["GET"])
def get_employees():
    employees = Employee.query.all()
    return jsonify([employee.to_dict() for employee in employees])

@app.route("/api/employees/<int:id>", methods=["GET"])
def get_employee(id):
    employee = Employee.query.get_or_404(id)
    return jsonify(employee.to_dict())

@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.json

    employee = Employee(
        name=data["name"],
        email=data["email"],
        role=data["role"],
        department=data["department"],
        status=data.get("status", "Active"),
        joined_date=datetime.strptime(data["joined_date"], "%Y-%m-%d")
    )

    db.session.add(employee)
    db.session.commit()

    return jsonify({
        "message": "Employee added successfully"
    }), 201


@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    employee = Employee.query.get_or_404(id)
    data = request.json

    employee.name = data["name"]
    employee.email = data["email"]
    employee.role = data["role"]
    employee.department = data["department"]
    employee.status = data["status"]

    db.session.commit()

    return jsonify({
        "message": "Employee updated successfully"
    })


@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    employee = Employee.query.get_or_404(id)

    db.session.delete(employee)
    db.session.commit()

    return jsonify({
        "message": "Employee deleted successfully"
    })


@app.route("/api/employees/<int:id>/status", methods=["PATCH"])
def update_status(id):
    employee = Employee.query.get_or_404(id)
    data = request.json

    employee.status = data["status"]
    db.session.commit()

    return jsonify({
        "message": "Status updated successfully"
    })

@app.route("/api/departments", methods=["GET"])
def get_departments():
    departments = db.session.query(Employee.department).distinct().all()
    dept_list = [dept[0] for dept in departments]

    return jsonify(dept_list)

@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    total = Employee.query.count()
    active = Employee.query.filter_by(status="Active").count()
    inactive = Employee.query.filter_by(status="Inactive").count()
    on_leave = Employee.query.filter_by(status="On Leave").count()

    return jsonify({
        "totalEmployees": total,
        "activeEmployees": active,
        "inactiveEmployees": inactive,
        "onLeaveEmployees": on_leave
    })


if __name__ == "__main__":
    app.run(debug=True)