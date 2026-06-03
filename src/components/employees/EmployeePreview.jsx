const EmployeePreview = ({ employee, departmentCount }) => {
  if (!employee) {
    return (
      <div className="profile-card placeholder-card">
        <h2>Employee Preview</h2>
        <p>
          Select an employee from the table to see details, department insights,
          and attendance placeholders.
        </p>
        <div className="placeholder-section">
          <h4>Employee Details</h4>
          <p>Details will appear once an employee is selected.</p>
        </div>

        <div className="placeholder-section">
          <h4>Department Section</h4>
          <p>Department activity and group metrics will appear here.</p>
        </div>

        <div className="placeholder-section">
          <h4>Attendance Section</h4>
          <p>Attendance summaries and trends will be available soon.</p>
        </div>
      </div>
    );
  }

  const statusClass = employee.status
    .toLowerCase()
    .replace(/\s+/g, "");

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {employee.name?.charAt(0)}
        </div>
        <div>
          <h2>{employee.name}</h2>
          <p className="profile-role">{employee.role}</p>
          <span className={`status-badge status-${statusClass}`}>
            {employee.status}
          </span>
        </div>
      </div>

      <div className="profile-block">
        <h4>Employee Details</h4>
        <div className="details-grid">
          <p>
            <strong>Email:</strong> {employee.email}
          </p>
          <p>
            <strong>Phone:</strong> {employee.phone || "N/A"}
          </p>
          <p>
            <strong>Department:</strong> {employee.department}
          </p>
          <p>
            <strong>Joined:</strong> {employee.joined_date || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong> {employee.date_of_birth || "N/A"}
          </p>
          <p>
            <strong>Manager:</strong> {employee.manager_name || "N/A"}
          </p>
        </div>
      </div>

      {employee.address && (
        <div className="profile-block">
          <h4>Contact Information</h4>
          <p>
            <strong>Address:</strong> {employee.address}
          </p>
        </div>
      )}

      {employee.salary && (
        <div className="profile-block">
          <h4>Compensation</h4>
          <p>
            <strong>Salary:</strong> ${employee.salary.toLocaleString()}
          </p>
        </div>
      )}

      {employee.skills && (
        <div className="profile-block">
          <h4>Skills</h4>
          <div className="skills-container">
            {employee.skills.split(",").map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="profile-block">
        <h4>Department Section</h4>
        <p>
          {employee.department} currently has {departmentCount} team member
          {departmentCount === 1 ? "" : "s"}.
        </p>
        <p>Department analytics and capacity planning live here.</p>
      </div>

      <div className="profile-block">
        <h4>Attendance Section</h4>
        <ul>
          <li>Attendance view is available in the next release.</li>
          <li>Today's working status will appear here.</li>
          <li>Leave and absence summaries are prepared.</li>
        </ul>
      </div>
    </div>
  );
};

export default EmployeePreview;
