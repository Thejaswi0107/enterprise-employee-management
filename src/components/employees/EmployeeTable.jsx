const EmployeeTable = ({
  employees,
  onDelete,
  onEdit,
  onStatusChange,
}) => {
  const getStatusClass = (status) => {
    if (status === "Active") return "status-active";
    if (status === "Inactive") return "status-inactive";
    if (status === "On Leave") return "status-leave";
    return "";
  };

  return (
    <div className="employee-table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <div className="employee-info">
                  <div className="employee-avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="employee-name">
                      {employee.name}
                    </div>

                    <div className="employee-email">
                      {employee.email}
                    </div>
                  </div>
                </div>
              </td>

              <td>{employee.role}</td>

              <td>{employee.department}</td>

              <td>
                <select
                  className={`status-select ${getStatusClass(
                    employee.status
                  )}`}
                  value={employee.status}
                  onChange={(e) =>
                    onStatusChange(
                      employee.id,
                      e.target.value
                    )
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </td>

              <td>{employee.joined_date}</td>

              <td>
                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      onEdit(employee.id)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDelete(employee.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;