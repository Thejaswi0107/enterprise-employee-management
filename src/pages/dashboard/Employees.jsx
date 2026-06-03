import { useState, useEffect, useMemo } from "react";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import EmployeeTable from "../../components/employees/EmployeeTable";
import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import EmployeeStatCard from "../../components/employees/EmployeeStatCard";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Toast from "../../components/common/Toast";

import "../../components/employees/Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  useEffect(() => {
    if (!toast) return;

    const toastTimer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(toastTimer);
  }, [toast]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEmployees();
      const backendEmployees = response?.data || [];

      if (!response?.success) {
        throw new Error(response?.message || "Could not load employees");
      }

      setEmployees(backendEmployees);
      setDepartments(
        Array.from(
          new Set(backendEmployees.map((employee) => employee.department))
        ).filter(Boolean)
      );
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to load employees";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const { user, activeCompany } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchEmployees();
  }, [user?.company_id, activeCompany, user?.email]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          employee.name
            ?.toLowerCase()
            .includes(lowerSearch) ||
          employee.email
            ?.toLowerCase()
            .includes(lowerSearch) ||
          employee.role
            ?.toLowerCase()
            .includes(lowerSearch);

        const matchesDepartment =
          departmentFilter === "All Departments" ||
          employee.department === departmentFilter;

        return matchesSearch && matchesDepartment;
      }),
    [employees, departmentFilter, searchTerm]
  );

  const sortValue = (item) => {
    if (sortKey === "joined_date") {
      return new Date(item.joined_date).getTime() || 0;
    }

    return String(item[sortKey] || "").toLowerCase();
  };

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      const first = sortValue(a);
      const second = sortValue(b);

      if (first < second) return sortOrder === "asc" ? -1 : 1;
      if (first > second) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortKey, sortOrder]);

  useEffect(() => {
    if (!selectedEmployee && sortedEmployees.length) {
      setSelectedEmployee(sortedEmployees[0]);
    }

    if (
      selectedEmployee &&
      !sortedEmployees.some(
        (item) => item.id === selectedEmployee.id
      )
    ) {
      setSelectedEmployee(sortedEmployees[0] || null);
    }
  }, [sortedEmployees, selectedEmployee]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEmployees.length / employeesPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;

  const currentEmployees = sortedEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      detail: "All active records",
    },
    {
      title: "Active",
      value: employees.filter((emp) => emp.status === "Active").length,
      detail: "Currently working",
    },
    {
      title: "On Leave",
      value: employees.filter((emp) => emp.status === "On Leave").length,
      detail: "Out of office",
    },
    {
      title: "Departments",
      value: new Set(
        employees.map((emp) => emp.department)
      ).size,
      detail: "Team groups",
    },
  ];

  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await addEmployee(employeeData);

      if (response?.success && response?.data) {
        setEmployees((prev) => [response.data, ...prev]);
        setDepartments((prev) =>
          Array.from(new Set([response.data.department, ...prev])).filter(
            Boolean
          )
        );
        setToast({
          type: "success",
          message: "Employee added successfully",
        });
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to add employee";
      setToast({ type: "error", message });
    }
  };

  const handleEditEmployee = async (employeeData) => {
    try {
      const response = await updateEmployee(editingEmployee.id, employeeData);
      if (response?.success) {
        await fetchEmployees();
        setToast({
          type: "success",
          message: "Employee updated successfully",
        });
      }
      setEditingEmployee(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to update employee";
      setToast({ type: "error", message });
    }
  };

  const handleDeleteEmployee = (id) => {
    setDeleteEmployeeId(id);
  };

  const confirmDeleteEmployee = async () => {
    try {
      const response = await deleteEmployee(deleteEmployeeId);
      if (response?.success) {
        await fetchEmployees();
        setToast({
          type: "success",
          message: "Employee deleted successfully",
        });
      }
      setDeleteEmployeeId(null);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to delete employee";
      setToast({ type: "error", message });
    }
  };

  const cancelDeleteEmployee = () => {
    setDeleteEmployeeId(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!isAdmin) return;

    const employee = employees.find((emp) => emp.id === id);

    if (!employee) return;

    try {
      const response = await updateEmployee(id, {
        ...employee,
        status: newStatus,
      });

      if (response?.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id ? { ...emp, status: newStatus } : emp
          )
        );
        setToast({
          type: "success",
          message: "Employee status updated",
        });
      }
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to update status";
      setToast({ type: "error", message });
    }
  };

  const selectedDepartmentCount = selectedEmployee
    ? employees.filter(
        (emp) => emp.department === selectedEmployee.department
      ).length
    : 0;

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-title">Loading employees</div>
        <div className="loading-lines">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="loading-line" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button className="primary-btn" onClick={fetchEmployees}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <Toast message={toast?.message} type={toast?.type} />
      <div className="employees-header">
        <h1>Employees</h1>
        <p>
          Manage your team, review employee details, and monitor department
          activity from a single dashboard.
        </p>
      </div>

      <div className="stats-row">
        {stats.map((item) => (
          <EmployeeStatCard
            key={item.title}
            title={item.title}
            value={item.value}
            detail={item.detail}
          />
        ))}
      </div>

      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All Departments">All Departments</option>
          {[...new Set(employees.map((employee) => employee.department))].map(
            (department) => (
              <option key={department} value={department}>
                {department}
              </option>
            )
          )}
        </select>

        <div className="sort-group">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="department">Sort by Department</option>
            <option value="status">Sort by Status</option>
            <option value="joined_date">Sort by Join Date</option>
          </select>
          <button
            className="sort-order-btn"
            onClick={() =>
              setSortOrder((current) =>
                current === "asc" ? "desc" : "asc"
              )
            }
          >
            {sortOrder === "asc" ? "A → Z" : "Z → A"}
          </button>
        </div>

        {isAdmin ? (
          <button
            className="primary-btn"
            onClick={() => {
              setEditingEmployee(null);
              setShowModal(true);
            }}
          >
            + Add Employee
          </button>
        ) : (
          <div className="admin-note">
            View only: admin users can manage employees within their company.
          </div>
        )}
      </div>

      <div className="dashboard-main">
        <div className="dashboard-left">
          {currentEmployees.length > 0 ? (
            <EmployeeTable
              employees={currentEmployees}
              isAdmin={isAdmin}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setShowModal(true);
              }}
              onDelete={handleDeleteEmployee}
              onStatusChange={handleStatusChange}
              onSelect={setSelectedEmployee}
              selectedEmployeeId={selectedEmployee?.id}
            />
          ) : (
            <div className="empty-state">
              <h3>No employees found</h3>
              <p>
                There are no employees matching your filters or the backend
                returned no data.
              </p>
              <button className="primary-btn" onClick={fetchEmployees}>
                Refresh list
              </button>
            </div>
          )}

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={
                  currentPage === index + 1 ? "active-page" : ""
                }
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={Boolean(deleteEmployeeId)}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEmployee}
        onCancel={cancelDeleteEmployee}
      />

      {showModal && (
        <AddEmployeeModal
          show={showModal}
          employee={editingEmployee}
          departments={departments}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={
            editingEmployee ? handleEditEmployee : handleAddEmployee
          }
        />
      )}
    </div>
  );
};

export default Employees;
