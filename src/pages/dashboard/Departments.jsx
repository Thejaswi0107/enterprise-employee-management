import { useEffect, useMemo, useState } from "react";
import { getEmployees } from "../../services/api";
import "../../components/employees/Employees.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getEmployees();
        const employees = response.data || [];

        const departmentMap = employees.reduce((acc, employee) => {
          const department = employee.department || "Unknown";
          if (!acc[department]) {
            acc[department] = {
              id: department,
              name: department,
              employees: 0,
              manager: "Team Lead",
              status: "Active",
            };
          }
          acc[department].employees += 1;
          return acc;
        }, {});

        setDepartments(Object.values(departmentMap));
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError?.response?.data?.detail ||
            loadError?.message ||
            "Unable to load department data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) {
      return departments;
    }

    return departments.filter((department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const handleAddDepartment = () => {
    if (!departmentName || !managerName) {
      alert("Please fill all fields");
      return;
    }

    const newDepartment = {
      id: Date.now(),
      name: departmentName,
      employees: 0,
      manager: managerName,
      status: "Active",
    };

    setDepartments([newDepartment, ...departments]);
    setDepartmentName("");
    setManagerName("");
    setShowModal(false);
  };

  return (
    <div className="employees-page">
      {/* Header */}
      <div className="employees-header">
        <h1>Departments</h1>

        <p>
          Manage all company
          departments and department
          managers.
        </p>
      </div>

      {/* Controls */}
      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => setShowModal(true)}>
          + Add Department
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading departments...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="employee-table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Manager</th>
                <th>Total Employees</th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td>
                    <strong>{department.name}</strong>
                  </td>
                  <td>{department.manager}</td>
                  <td>{department.employees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add Department</h2>

            <div className="modal-grid">
              <input
                type="text"
                placeholder="Department Name"
                value={departmentName}
                onChange={(e) =>
                  setDepartmentName(
                    e.target.value
                  )
                }
              />

              <input
                type="text"
                placeholder="Manager Name"
                value={managerName}
                onChange={(e) =>
                  setManagerName(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={
                  handleAddDepartment
                }
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;