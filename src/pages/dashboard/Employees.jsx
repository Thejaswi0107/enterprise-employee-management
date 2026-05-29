import { useState, useEffect } from "react";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/api";

import EmployeeTable from "../../components/employees/EmployeeTable";
import AddEmployeeModal from "../../components/employees/AddEmployeeModal";

import "../../components/employees/Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEmployees();

      const backendEmployees =
        response?.data?.data || [];

      // Extra demo employees
      const extraResponse = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      const extraUsers = await extraResponse.json();

      const extraEmployees = extraUsers.map((user) => ({
        id: `api-${user.id}`,
        name: user.name,
        email: user.email,
        role: user.company.bs,
        department: user.company.name,
        status: "Active",
        joined_date: "2024-01-01",
      }));

      setEmployees([
        ...backendEmployees,
        ...extraEmployees,
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add Employee
  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await addEmployee(employeeData);

      if (response?.data?.data) {
        setEmployees((prev) => [
          response.data.data,
          ...prev,
        ]);
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    }
  };

  // Edit Employee
  const handleEditEmployee = async (employeeData) => {
    try {
      await updateEmployee(
        editingEmployee.id,
        employeeData
      );

      fetchEmployees();

      setEditingEmployee(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update employee");
    }
  };

  // Delete Employee
  const handleDeleteEmployee = (id) => {
    setDeleteEmployeeId(id);
  };

  const confirmDeleteEmployee = async () => {
    try {
      await deleteEmployee(deleteEmployeeId);

      fetchEmployees();

      setDeleteEmployeeId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  const cancelDeleteEmployee = () => {
    setDeleteEmployeeId(null);
  };

  // Status Change
  const handleStatusChange = async (
    id,
    newStatus
  ) => {
    const employee = employees.find(
      (emp) => emp.id === id
    );

    if (!employee) return;

    // Skip fake API employees
    if (String(id).startsWith("api-")) return;

    try {
      await updateEmployee(id, {
        ...employee,
        status: newStatus,
      });

      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Search + Filter
  const filteredEmployees = employees.filter(
    (employee) => {
      const matchesSearch =
        employee.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.role
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter ===
          "All Departments" ||
        employee.department ===
          departmentFilter;

      return (
        matchesSearch && matchesDepartment
      );
    }
  );

  // Pagination Logic
  const indexOfLastEmployee =
    currentPage * employeesPerPage;

  const indexOfFirstEmployee =
    indexOfLastEmployee - employeesPerPage;

  const currentEmployees =
    filteredEmployees.slice(
      indexOfFirstEmployee,
      indexOfLastEmployee
    );

  const totalPages = Math.ceil(
    filteredEmployees.length /
      employeesPerPage
  );

  // Loading
  if (loading) {
    return (
      <div className="loading-state">
        Loading employees...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>

        <button onClick={fetchEmployees}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employees-page">
      {/* Header */}
      <div className="employees-header">
        <h1>Employees</h1>

        <p>
          Manage your team members,
          search by name/role/email,
          and filter by department.
        </p>
      </div>

      {/* Controls */}
      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(
              e.target.value
            );

            setCurrentPage(1);
          }}
        />

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(
              e.target.value
            );

            setCurrentPage(1);
          }}
         >
          <option>
            All Departments
          </option>

          {[
            ...new Set(employees.map(
              (employee) => employee.department
            )),
          ].map((department,index) => (<option key={department} value={department}>{department}</option>))
          }

        </select>

        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Empty */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          No employees found
        </div>
      ) : (
        <>
          {/* Table */}
          <EmployeeTable
            employees={currentEmployees}
            onEdit={(employee) => {
              setEditingEmployee(
                employee
              );

              setShowModal(true);
            }}
            onDelete={
              handleDeleteEmployee
            }
            onStatusChange={
              handleStatusChange
            }
          />

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  currentPage - 1
                )
              }
            >
              Previous
            </button>

            {[...Array(totalPages)].map(
              (_, index) => (
                <button
                  key={index + 1}
                  className={
                    currentPage ===
                    index + 1
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(
                      index + 1
                    )
                  }
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {/* Delete Modal */}
        {deleteEmployeeId && (
            <div className="delete-modal-overlay">
                <div className="delete-modal">
                    <h3>Delete Employee</h3>

                    <p>
                     Are you sure you want to delete this employee?
                    </p>

                    <div className="delete-modal-buttons">
                        <button
                         className="cancel-delete-btn"
                         onClick={() =>setDeleteEmployeeId(null)}>
                         Cancel
                        </button>

                        <button
                            className="confirm-delete-btn"
                            onClick={async () => {
                            try {
                                await deleteEmployee(
                                    deleteEmployeeId
                                );

                                fetchEmployees();

                                setDeleteEmployeeId(
                                    null
                                );
                             } catch (err) {
                                 alert("Failed to delete employee");
                                }
                            }}
                            >
                             Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

      {/* Add/Edit Modal */}
      {showModal && (
        <AddEmployeeModal
          show={showModal}
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={
            editingEmployee
              ? handleEditEmployee
              : handleAddEmployee
          }
        />
      )}
    </div>
  );
};

export default Employees;