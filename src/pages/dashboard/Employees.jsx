import { useState, useEffect } from "react";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../../services/api";

import EmployeeTable from "../../components/employees/EmployeeTable";
import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import "../../components/employees/Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add employee
  const handleAddEmployee = async (newEmployee) => {
    try {
      await createEmployee(newEmployee);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // Status update
  const handleStatusChange = async (id, newStatus) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) return;

    try {
      await updateEmployee(id, {
        ...employee,
        status: newStatus,
      });

      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit employee
  const handleEdit = (id) => {
    alert(`Edit employee ${id} implementation next`);
  };

  // Departments
  const departments = [
    ...new Set(employees.map((employee) => employee.department)),
  ];

  // Search + filter
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.role.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search);

    const matchesDepartment =
      selectedDepartment === "" ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="loading-state">
        Loading employees...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchEmployees}>Retry</button>
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="empty-state">
        No employees found
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <h1>Employees</h1>
        <p>
          Manage your team members, search by
          name/role/email, and filter by department.
        </p>
      </div>

      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={selectedDepartment}
          onChange={(e) =>
            setSelectedDepartment(e.target.value)
          }
        >
          <option value="">All Departments</option>

          {departments.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowModal(true)}
        >
          + Add Employee
        </button>
      </div>

      <EmployeeTable
        employees={filteredEmployees}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />

      <AddEmployeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddEmployee}
      />
    </div>
  );
};

export default Employees;