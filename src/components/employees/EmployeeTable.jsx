// React import not required with the new JSX transform

const EmployeeTable = ({
  employees,
  isAdmin,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
  selectedEmployeeId,
}) => {
  return (
    <div className="employee-table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className={
                selectedEmployeeId === employee.id
                  ? "selected-row"
                  : ""
              }
              onClick={() => onSelect?.(employee)}
            >
              {/* Employee */}
              <td>
                <div className="employee-info">
                  <div className="employee-avatar">
                    {employee.name?.charAt(0)}
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

              {/* Role */}
              <td>{employee.role}</td>

              {/* Department */}
              <td>{employee.department}</td>

              {/* Status */}
              <td>
                <select
                  value={employee.status}
                  onChange={(e) => {
                    if (!isAdmin) return;
                    onStatusChange(
                      employee.id,
                      e.target.value
                    );
                  }}
                  disabled={!isAdmin}
                  className={`status-select ${
                    employee.status === "Active"
                      ? "status-active"
                      : employee.status ===
                        "Inactive"
                      ? "status-inactive"
                      : "status-leave"
                  } ${!isAdmin ? "status-disabled" : ""}`}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                  <option value="On Leave">
                    On Leave
                  </option>
                </select>
              </td>

              {/* Joined Date */}
              <td>
                {employee.joined_date}
              </td>

              {/* Actions */}
              <td>
                <div className="action-buttons">
                  {isAdmin ? (
                    <>
                      <button
                        className="edit-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(employee);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(employee.id);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="view-only-label">View only</span>
                  )}
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