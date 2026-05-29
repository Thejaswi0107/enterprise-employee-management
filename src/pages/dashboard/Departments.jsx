import { useState } from "react";
import "../../components/employees/Employees.css";

const Departments = () => {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "HR",
      employees: 12,
      manager: "Rahul Sharma",
      status: "Active",
    },
    {
      id: 2,
      name: "IT",
      employees: 35,
      manager: "Anjali Verma",
      status: "Active",
    },
    {
      id: 3,
      name: "Finance",
      employees: 10,
      manager: "Keerthu",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Design",
      employees: 8,
      manager: "Pushpa",
      status: "Active",
    },
  ]);

  const [showModal, setShowModal] =
    useState(false);

  const [departmentName, setDepartmentName] =
    useState("");

  const [managerName, setManagerName] =
    useState("");

  const handleAddDepartment = () => {
    if (
      !departmentName ||
      !managerName
    ) {
      alert("Please fill all fields");
      return;
    }

    const newDepartment = {
      id: Date.now(),
      name: departmentName,
      employees: 11,
      manager: managerName,
      status: "Active",
    };

    setDepartments([
      newDepartment,
      ...departments,
    ]);

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
        />

        <button
          onClick={() =>
            setShowModal(true)
          }
        >
          + Add Department
        </button>
      </div>

      {/* Table */}
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
            {departments.map(
              (department) => (
                <tr key={department.id}>
                  <td>
                    <strong>
                      {department.name}
                    </strong>
                  </td>

                  <td>
                    {department.manager}
                  </td>

                  <td>
                    {
                      department.employees
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

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