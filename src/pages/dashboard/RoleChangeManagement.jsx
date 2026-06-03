import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPendingRoleRequests, getAllRoleRequests, respondToRoleChangeRequest } from "../../services/api";
import Toast from "../../components/common/Toast";
import "../../components/employees/Employees.css";

function RoleChangeManagement() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [responseData, setResponseData] = useState({
    status: "Approved",
    admin_comments: ""
  });

  useEffect(() => {
    if (user?.role === "admin") {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingRoleRequests(user.email);
      
      if (response.success) {
        setPendingRequests(response.data || []);
        // Also load all requests using the dedicated endpoint
        const allResponse = await getAllRoleRequests();
        setAllRequests(allResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
      setToast({ type: "error", message: "Failed to load requests" });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId) => {
    if (!responseData.status) {
      setToast({ type: "error", message: "Please select a status" });
      return;
    }

    try {
      setLoading(true);
      const response = await respondToRoleChangeRequest(requestId, responseData);

      if (response.success) {
        setToast({ 
          type: "success", 
          message: `Request ${responseData.status.toLowerCase()} successfully` 
        });
        setShowResponseForm(null);
        setResponseData({ status: "Approved", admin_comments: "" });
        await fetchRequests();
      } else {
        setToast({ type: "error", message: response.message || "Failed to respond to request" });
      }
    } catch (error) {
      setToast({ type: "error", message: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const toastTimer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(toastTimer);
  }, [toast]);

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }

  const displayRequests = selectedTab === "pending" ? pendingRequests : allRequests;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Role Change Requests Management</h1>
      <p>Review and manage user role change requests</p>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setSelectedTab("pending")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: selectedTab === "pending" ? "#2563eb" : "transparent",
            color: selectedTab === "pending" ? "white" : "#64748b",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setSelectedTab("all")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: selectedTab === "all" ? "#2563eb" : "transparent",
            color: selectedTab === "all" ? "white" : "#64748b",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          All Requests ({allRequests.length})
        </button>
      </div>

      {/* Requests List */}
      {displayRequests.length === 0 ? (
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <p style={{ color: "#64748b" }}>
            {selectedTab === "pending" ? "No pending requests" : "No requests found"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {displayRequests.map((request) => (
            <div
              key={request.id}
              style={{
                padding: "16px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#111827" }}>
                    {request.user_name}
                  </h3>
                  <p style={{ margin: "0", color: "#64748b", fontSize: "14px" }}>
                    {request.user_email}
                  </p>
                </div>
                <span style={{
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: request.status === "Pending" ? "#fef3c7" :
                                  request.status === "Approved" ? "#dcfce7" : "#fee2e2",
                  color: request.status === "Pending" ? "#d97706" :
                         request.status === "Approved" ? "#16a34a" : "#dc2626"
                }}>
                  {request.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px", fontSize: "14px" }}>
                <div>
                  <p style={{ margin: "0", color: "#64748b" }}>
                    <strong>Requested Role:</strong> {request.requested_role}
                  </p>
                  <p style={{ margin: "8px 0 0 0", color: "#64748b" }}>
                    <strong>Request Date:</strong> {new Date(request.request_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "#64748b" }}>
                    <strong>Admin Email:</strong> {request.admin_email}
                  </p>
                  {request.response_date && (
                    <p style={{ margin: "8px 0 0 0", color: "#64748b" }}>
                      <strong>Response Date:</strong> {new Date(request.response_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {request.admin_comments && (
                <div style={{ marginBottom: "12px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                  <p style={{ margin: "0", color: "#334155", fontSize: "13px" }}>
                    <strong>Admin Comments:</strong> {request.admin_comments}
                  </p>
                </div>
              )}

              {request.status === "Pending" && (
                <>
                  {showResponseForm === request.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>
                          Decision
                        </label>
                        <select
                          value={responseData.status}
                          onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #dbe3ef",
                            borderRadius: "6px",
                            fontSize: "14px"
                          }}
                        >
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>
                          Comments (Optional)
                        </label>
                        <textarea
                          value={responseData.admin_comments}
                          onChange={(e) => setResponseData(prev => ({ ...prev, admin_comments: e.target.value }))}
                          placeholder="Add your comments..."
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #dbe3ef",
                            borderRadius: "6px",
                            fontSize: "14px",
                            minHeight: "60px",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleRespondToRequest(request.id)}
                          disabled={loading}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            opacity: loading ? 0.6 : 1
                          }}
                        >
                          {loading ? "Processing..." : "Submit Decision"}
                        </button>
                        <button
                          onClick={() => setShowResponseForm(null)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#e2e8f0",
                            color: "#334155",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResponseForm(request.id)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Review Request
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoleChangeManagement;
