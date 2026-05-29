import { useState } from "react";
import "../../components/styles/Attendance.css";

const Attendance = () => {
  const [attendance, setAttendance] = useState([
    {
      id: 1,
      name: "Thejaswi",
      department: "ASE",
      status: "Present",
      date: "2026-05-28",
    },
    {
      id: 2,
      name: "Pushpa",
      department: "Design",
      status: "Absent",
      date: "2026-05-28",
    },
    {
      id: 3,
      name: "Anjali",
      department: "Management",
      status: "Leave",
      date: "2026-05-28",
    },
    {
      id: 4,
      name: "Keerthu",
      department: "Finance",
      status: "Present",
      date: "2026-05-28",
    },
  ]);

  const handleStatusChange = (id, value) => {
    const updatedAttendance = attendance.map((employee) =>
      employee.id === id
        ? { ...employee, status: value }
        : employee
    );

    setAttendance(updatedAttendance);
  };

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header">
        <h1>Attendance</h1>

        <p>
          Manage employee attendance and
          daily status tracking.
        </p>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>

                <td>{employee.department}</td>

                <td>
                  <select
                    value={employee.status}
                    onChange={(e) =>
                      handleStatusChange(
                        employee.id,
                        e.target.value
                      )
                    }
                    className={`status-dropdown ${
                      employee.status === "Present"
                        ? "present"
                        : employee.status === "Absent"
                        ? "absent"
                        : "leave"
                    }`}
                  >
                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Leave">
                      Leave
                    </option>
                  </select>
                </td>

                <td>{employee.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;