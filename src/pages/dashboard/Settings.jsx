import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { submitRoleChangeRequest, getUserRoleRequests } from "../../services/api";
import Toast from "../../components/common/Toast";
import "../../components/styles/Settings.css";

function Settings() {
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    if (!toast) return;
    const toastTimer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(toastTimer);
  }, [toast]);

  // Only show role change option for non-admin users
  const isUserRole = user?.role === "user";

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p>
        Manage your account preferences, password, notifications and theme.
      </p>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Top Section */}
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
  );
}

export default Settings;