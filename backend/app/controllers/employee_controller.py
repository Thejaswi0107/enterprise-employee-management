from app.database.mock_data import employees

def get_all_employees():
    return employees

def get_employee_by_id(employee_id: int):
    for employee in employees:
        if employee["id"] == employee_id:
            return employee
    return None