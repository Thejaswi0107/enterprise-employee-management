import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/api";
import Toast from "../../components/common/Toast";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await getAuditLogs();
        if (response.success) {
          setLogs(response.data || []);
        } else {
          setToast({ type: "error", message: response.message || "Unable to load audit logs" });
        }
      } catch (error) {
        setToast({ type: "error", message: error.message || "Failed to load audit logs" });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Audit Logs</h1>
      <p>Track key employee actions for compliance and accountability.</p>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div
        style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No audit records found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeader}>Timestamp</th>
                  <th style={tableHeader}>User</th>
                  <th style={tableHeader}>Action</th>
                  <th style={tableHeader}>Related To</th>
                  <th style={tableHeader}>Related Email</th>
                  <th style={tableHeader}>Company</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={rowStyle}>
                    <td style={cellStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={cellStyle}>{log.user_name}</td>
                    <td style={cellStyle}>{log.action}</td>
                    <td style={cellStyle}>{log.related_name || "N/A"}</td>
                    <td style={cellStyle}>{log.related_email || "N/A"}</td>
                    <td style={cellStyle}>{log.company_id ? `Company ${log.company_id === 1 ? "A" : "B"}` : "Global"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const tableHeader = {
  textAlign: "left",
  padding: "14px 12px",
  color: "#475569",
  fontSize: "14px",
  borderBottom: "2px solid #e2e8f0",
};

const rowStyle = {
  borderBottom: "1px solid #e2e8f0",
};

const cellStyle = {
  padding: "14px 12px",
  color: "#334155",
  fontSize: "14px",
};

export default AuditLogs;
