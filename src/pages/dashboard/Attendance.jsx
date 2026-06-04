import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEmployees } from "../../services/api";
import "../../components/styles/Attendance.css";

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getEmployees();
        const employees = response.data || [];
        const today = new Date().toISOString().split("T")[0];

        const attendanceRows = employees.map((employee) => ({
          id: employee.id,
          name: employee.name,
          department: employee.department || "Unknown",
          status:
            employee.status === "On Leave"
              ? "Leave"
              : employee.status === "Inactive"
              ? "Absent"
              : "Present",
          date: today,
        }));

        setAttendance(attendanceRows);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError?.response?.data?.detail ||
            loadError?.message ||
            "Unable to load attendance data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [user?.company_id]);

  const handleStatusChange = (id, value) => {
    setAttendance((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status: value } : record
      )
    );
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
      <div className="attendance-header">
        <div>
          <h1>Attendance</h1>
          <p>Manage employee attendance and daily status tracking.</p>
        </div>

        {canDownload && (
          <button className="download-btn" onClick={downloadCsv}>
            Download Report
          </button>
        )}
      </div>

      {loading ? (
        <div className="attendance-loading">Loading attendance...</div>
      ) : error ? (
        <div className="attendance-error">{error}</div>
      ) : (
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
                        handleStatusChange(employee.id, e.target.value)
                      }
                      className={`status-dropdown ${
                        employee.status === "Present"
                          ? "present"
                          : employee.status === "Absent"
                          ? "absent"
                          : "leave"
                      }`}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </td>
                  <td>{employee.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;