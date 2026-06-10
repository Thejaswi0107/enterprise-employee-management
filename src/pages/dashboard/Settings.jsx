import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { submitRoleChangeRequest, getUserRoleRequests, getAuthHeaders, getPendingRoleRequests, getAllRoleRequests, respondToRoleChangeRequest } from "../../services/api";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import "../../components/styles/Settings.css";

function Settings() {
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('general');
  
  // General Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Role Change Request States
  const [userRequests, setUserRequests] = useState([]);
  const [showRoleChangeForm, setShowRoleChangeForm] = useState(false);
  const [roleChangeFormData, setRoleChangeFormData] = useState({
    password: "",
    admin_email: ""
  });

  // Reactivation Requests State
  const [reactivationRequests, setReactivationRequests] = useState([]);
  const [selectedReactivationRequest, setSelectedReactivationRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Admin Role Change Requests State
  const [pendingRoleRequests, setPendingRoleRequests] = useState([]);
  const [allRoleRequests, setAllRoleRequests] = useState([]);
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [roleResponseData, setRoleResponseData] = useState({
    status: "Approved",
    admin_comments: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const buildAuthHeaders = () => getAuthHeaders();

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Fetch user's role change requests
  useEffect(() => {
    if (user?.email) {
      fetchUserRequests();
      if (user.role === 'admin') {
        fetchReactivationRequests();
        fetchAdminRoleChangeRequests();
      }
    }
  }, [user]);

  const fetchUserRequests = async () => {
    try {
      const response = await getUserRoleRequests(user.email);
      if (response.success) {
        setUserRequests(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  const fetchReactivationRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reactivation/pending', {
        headers: buildAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reactivation requests');
      }

      const data = await response.json();
      setReactivationRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch reactivation requests:", err.message);
    }
  };

  const fetchAdminRoleChangeRequests = async () => {
    try {
      const response = await getPendingRoleRequests(user.email);
      if (response.success) {
        setPendingRoleRequests(response.data || []);
        const allResponse = await getAllRoleRequests();
        setAllRoleRequests(allResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  const handleRoleChangeInputChange = (e) => {
    const { name, value } = e.target;
    setRoleChangeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRoleChangeRequest = async (e) => {
    e.preventDefault();

    if (!roleChangeFormData.password) {
      setToast({ type: "error", message: "Please enter your password" });
      return;
    }

    if (!roleChangeFormData.admin_email) {
      setToast({ type: "error", message: "Please enter admin email" });
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        user_email: user.email,
        user_name: user.name || "User",
        requested_role: "Admin",
        admin_email: roleChangeFormData.admin_email,
        password: roleChangeFormData.password
      };

      const response = await submitRoleChangeRequest(requestData);

      if (response.success) {
        setToast({ type: "success", message: "Role change request submitted successfully" });
        setShowRoleChangeForm(false);
        setRoleChangeFormData({ password: "", admin_email: "" });
        await fetchUserRequests();
      } else {
        setToast({ type: "error", message: response.message || "Failed to submit request" });
      }
    } catch (error) {
      setToast({ type: "error", message: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReactivation = async () => {
    if (!selectedReactivationRequest) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/reactivation/approve/${selectedReactivationRequest.id}`,
        {
          method: 'POST',
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            admin_response: responseText
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve reactivation request');
      }

      setToast({
        type: 'success',
        message: `Reactivation request for ${selectedReactivationRequest.user_name} has been approved`
      });

      setShowApprovalModal(false);
      setSelectedReactivationRequest(null);
      setResponseText('');
      fetchReactivationRequests();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleRejectReactivation = async () => {
    if (!selectedReactivationRequest) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/reactivation/reject/${selectedReactivationRequest.id}`,
        {
          method: 'POST',
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            admin_response: responseText
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject reactivation request');
      }

      setToast({
        type: 'success',
        message: `Reactivation request for ${selectedReactivationRequest.user_name} has been rejected`
      });

      setShowRejectionModal(false);
      setSelectedReactivationRequest(null);
      setResponseText('');
      fetchReactivationRequests();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleRespondToRoleRequest = async (requestId) => {
    if (!roleResponseData.status) {
      setToast({ type: "error", message: "Please select a status" });
      return;
    }

    try {
      setLoading(true);
      const response = await respondToRoleChangeRequest(requestId, roleResponseData);

      if (response.success) {
        setToast({ type: "success", message: "Role change request responded" });
        setShowResponseForm(null);
        setRoleResponseData({ status: "Approved", admin_comments: "" });
        await fetchAdminRoleChangeRequests();
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

  const isUserRole = user?.role === "user";
  const isAdmin = user?.role === "admin";

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p>Manage your account preferences, password, notifications and administrative tasks.</p>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        {isAdmin && (
          <>
            <button
              className={`settings-tab-button ${activeTab === 'reactivation' ? 'active' : ''}`}
              onClick={() => setActiveTab('reactivation')}
            >
              Reactivation Requests
            </button>
            <button
              className={`settings-tab-button ${activeTab === 'role-change' ? 'active' : ''}`}
              onClick={() => setActiveTab('role-change')}
            >
              Role Change Requests
            </button>
          </>
        )}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="settings-tab-content">
          <div className="settings-top">
            {/* Account Details */}
            <div className="settings-card">
              <h2>Account Details</h2>

              <input
                type="text"
                placeholder="Full Name"
                defaultValue={user?.name || "User"}
                readOnly
              />

              <input
                type="email"
                placeholder="Email Address"
                defaultValue={user?.email || ""}
                readOnly
              />

              <input
                type="text"
                placeholder="Role"
                defaultValue={user?.role || "User"}
                readOnly
              />

              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                Contact an administrator to change your account details.
              </p>
            </div>

            {/* Role Change Request - Only for Users */}
            {isUserRole && (
              <div className="settings-card">
                <h2>Request Role Change</h2>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
                  Request a role upgrade from User to Admin.
                </p>

                {!showRoleChangeForm ? (
                  <button 
                    className="primary-btn"
                    onClick={() => setShowRoleChangeForm(true)}
                  >
                    Request Role Change
                  </button>
                ) : (
                  <form onSubmit={handleSubmitRoleChangeRequest}>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={roleChangeFormData.password}
                      onChange={handleRoleChangeInputChange}
                      required
                      style={{ marginBottom: "12px" }}
                    />

                    <input
                      type="email"
                      name="admin_email"
                      placeholder="Admin email address"
                      value={roleChangeFormData.admin_email}
                      onChange={handleRoleChangeInputChange}
                      required
                      style={{ marginBottom: "16px" }}
                    />

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        type="submit" 
                        className="save-btn"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit Request"}
                      </button>
                      <button 
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowRoleChangeForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Password */}
            <div className="settings-card">
              <h2>Change Password</h2>

              <input
                type="password"
                placeholder="Current Password"
              />

              <input
                type="password"
                placeholder="New Password"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
              />

              <button className="save-btn">
                Update Password
              </button>
            </div>
          </div>

          {/* Role Change Requests History - Only for Users */}
          {isUserRole && userRequests.length > 0 && (
            <div className="settings-card">
              <h2>Role Change Request History</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {userRequests.map((request) => (
                  <div 
                    key={request.id} 
                    style={{
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>{request.requested_role} Role Request</strong>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
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
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                      Requested on: {new Date(request.request_date).toLocaleDateString()}
                    </p>
                    {request.response_date && (
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                        Response date: {new Date(request.response_date).toLocaleDateString()}
                      </p>
                    )}
                    {request.admin_comments && (
                      <p style={{ fontSize: "12px", color: "#334155", margin: "8px 0", fontStyle: "italic" }}>
                        Admin Comments: {request.admin_comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          <div className="settings-card">
            <h2>Appearance</h2>

            <div className="setting-row">
              <div>
                <h4>Dark Mode</h4>
                <p>Enable dark theme for dashboard</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-card">
            <h2>Notifications</h2>

            <div className="setting-row">
              <div>
                <h4>Email Notifications</h4>
                <p>Receive email updates</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div>
                <h4>System Notifications</h4>
                <p>Receive dashboard alerts</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={systemNotifications}
                  onChange={() =>
                    setSystemNotifications(!systemNotifications)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATION REQUESTS TAB */}
      {activeTab === 'reactivation' && isAdmin && (
        <div className="settings-tab-content">
          <div className="settings-card">
            <h2>Pending Reactivation Requests ({reactivationRequests.length})</h2>

            {reactivationRequests.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
                No pending reactivation requests
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {reactivationRequests.map((request) => (
                  <div 
                    key={request.id} 
                    style={{
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc"
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <h4 style={{ margin: "0 0 4px 0" }}>{request.user_name}</h4>
                      <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>{request.user_email}</p>
                    </div>
                    
                    <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e0e0e0" }}>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                        <strong>Deactivated By:</strong> {request.deactivated_by_email}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                        <strong>Requested On:</strong> {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="save-btn"
                        onClick={() => {
                          setSelectedReactivationRequest(request);
                          setShowApprovalModal(true);
                        }}
                        style={{ flex: 1 }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setSelectedReactivationRequest(request);
                          setShowRejectionModal(true);
                        }}
                        style={{ flex: 1 }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROLE CHANGE REQUESTS TAB */}
      {activeTab === 'role-change' && isAdmin && (
        <div className="settings-tab-content">
          <div className="settings-card">
            <h2>Pending Role Change Requests ({pendingRoleRequests.length})</h2>

            {pendingRoleRequests.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
                No pending role change requests
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pendingRoleRequests.map((request) => (
                  <div 
                    key={request.id} 
                    style={{
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc"
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <h4 style={{ margin: "0 0 4px 0" }}>{request.user_name}</h4>
                      <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>{request.user_email}</p>
                    </div>
                    
                    <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e0e0e0" }}>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                        <strong>Requested Role:</strong> {request.requested_role}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                        <strong>Request Date:</strong> {new Date(request.request_date).toLocaleDateString()}
                      </p>
                    </div>

                    {showResponseForm === request.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleRespondToRoleRequest(request.id); }}>
                        <select
                          value={roleResponseData.status}
                          onChange={(e) => setRoleResponseData(prev => ({ ...prev, status: e.target.value }))}
                          style={{ width: "100%", padding: "8px", marginBottom: "12px", borderRadius: "4px", border: "1px solid #ddd" }}
                        >
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                        </select>

                        <textarea
                          value={roleResponseData.admin_comments}
                          onChange={(e) => setRoleResponseData(prev => ({ ...prev, admin_comments: e.target.value }))}
                          placeholder="Add comments (optional)"
                          style={{ width: "100%", padding: "8px", marginBottom: "12px", borderRadius: "4px", border: "1px solid #ddd", fontFamily: "inherit", minHeight: "80px" }}
                        />

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="submit" className="save-btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? "Submitting..." : "Submit Response"}
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                              setShowResponseForm(null);
                              setRoleResponseData({ status: "Approved", admin_comments: "" });
                            }}
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="primary-btn"
                        onClick={() => setShowResponseForm(request.id)}
                        style={{ width: "100%" }}
                      >
                        Respond to Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Role Change Requests History */}
          {allRoleRequests.length > 0 && (
            <div className="settings-card">
              <h2>All Role Change Requests History</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {allRoleRequests.map((request) => (
                  <div 
                    key={request.id} 
                    style={{
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>{request.user_name} - {request.requested_role}</strong>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
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
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                      {request.user_email}
                    </p>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                      Requested on: {new Date(request.request_date).toLocaleDateString()}
                    </p>
                    {request.response_date && (
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                        Response date: {new Date(request.response_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showApprovalModal && selectedReactivationRequest && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approve Reactivation Request</h3>
              <button className="modal-close" onClick={() => setShowApprovalModal(false)}>✕</button>
            </div>
            <p style={{ padding: "20px", textAlign: "center" }}>
              Approve reactivation request from <strong>{selectedReactivationRequest.user_name}</strong>?
            </p>
            <div style={{ padding: "0 20px 20px" }}>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Add optional message..."
                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontFamily: "inherit", minHeight: "80px", marginBottom: "12px" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="cancel-btn" onClick={() => setShowApprovalModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="save-btn" onClick={handleApproveReactivation} style={{ flex: 1 }}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedReactivationRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Reactivation Request</h3>
              <button className="modal-close" onClick={() => setShowRejectionModal(false)}>✕</button>
            </div>
            <p style={{ padding: "20px", textAlign: "center" }}>
              Reject reactivation request from <strong>{selectedReactivationRequest.user_name}</strong>?
            </p>
            <div style={{ padding: "0 20px 20px" }}>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Add optional message..."
                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontFamily: "inherit", minHeight: "80px", marginBottom: "12px" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="cancel-btn" onClick={() => setShowRejectionModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="cancel-btn" onClick={handleRejectReactivation} style={{ flex: 1, background: "#c62828" }}>Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
