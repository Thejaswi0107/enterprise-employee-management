import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../components/styles/Attendance.css";

const Attendance = () => {
  const { user } = useAuth();
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

  const downloadCsv = () => {
    const headers = ["Employee Name", "Department", "Status", "Date"];
    const rows = attendance.map((employee) => [
      employee.name,
      employee.department,
      employee.status,
      employee.date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canDownload = user?.role === "admin";

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h1>Attendance</h1>
          <p>
            Manage employee attendance and
            daily status tracking.
          </p>
        </div>

        {canDownload && (
          <button
            className="download-btn"
            onClick={downloadCsv}
          >
            Download Report
          </button>
        )}
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