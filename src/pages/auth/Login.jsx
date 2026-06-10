import React, { useState } from "react";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    company_id: 1,
  });

  const [error, setError] = useState("");
  const [deactivatedUser, setDeactivatedUser] = useState(null);
  const [reactivationReason, setReactivationReason] = useState("");
  const [isSubmittingReactivation, setIsSubmittingReactivation] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleChange = (e) => {
    const value = e.target.name === "company_id" ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await loginUser(formData);
      console.log("Login response:", response);

      if (response.success && response.is_deactivated) {
        // Account is deactivated, show popup instead of logging in
        console.log("Account is deactivated, showing popup");
        setDeactivatedUser({
          email: response.user?.email || formData.email,
          name: response.user?.name || "User",
          company_id: response.user?.company_id || formData.company_id,
          deactivated_at: response.deactivated_at,
          deactivated_by_email: response.deactivated_by_email,
          deactivation_reason: response.deactivation_reason
        });
        return;
      }

      if (response.success) {
        login({
          ...response.user,
          role: response.user?.role || formData.role || "user",
          token: response.token,
        });
        setLoginSuccess(true);
        return;
      }
    } catch (loginError) {
      const registeredUsers =
        JSON.parse(localStorage.getItem("registeredUsers")) || [];

      const savedUser = registeredUsers.find(
        (user) =>
          user.email === formData.email &&
          user.password === formData.password
      );

      if (savedUser) {
        login({
          email: savedUser.email,
          role: savedUser.role || formData.role || "user",
          name: savedUser.email,
          company_id: savedUser.company_id || formData.company_id,
          company:
            savedUser.company ||
            (formData.company_id === 2 ? "Company B" : "Company A"),
        });
        setLoginSuccess(true);
        return;
      }

      setError(
        loginError.response?.data?.detail ||
          "Invalid email or password"
      );
    }
  };

  const handleSubmitReactivationRequest = async () => {
    if (!deactivatedUser || !reactivationReason.trim()) {
      setError("Please provide a reason for reactivation");
      return;
    }

    setIsSubmittingReactivation(true);
    try {
      const response = await fetch("http://localhost:8000/api/reactivation/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": deactivatedUser.email,
          "X-User-Company-Id": String(deactivatedUser.company_id)
        },
        body: JSON.stringify({
          reason: reactivationReason
        })
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        alert("Reactivation request submitted successfully. An admin will review your request soon.");
        setDeactivatedUser(null);
        setReactivationReason("");
      } else {
        setError(data.message || "Failed to submit reactivation request");
      }
    } catch (err) {
      setError("Error submitting reactivation request: " + err.message);
    } finally {
      setIsSubmittingReactivation(false);
    }
  };

  React.useEffect(() => {
    if (user && loginSuccess) {
      navigate("/dashboard");
    }
  }, [user, loginSuccess, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Enterprise Employee Management</h1>

        <p>Login to continue</p>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        {deactivatedUser ? (
          <div className="deactivation-notice">
            <div className="deactivation-icon">⚠️</div>
            <h2>Account Deactivated</h2>
            <p>Your account has been deactivated by an administrator.</p>
            {deactivatedUser.deactivation_reason && (
              <p className="reason"><strong>Reason:</strong> {deactivatedUser.deactivation_reason}</p>
            )}
            {deactivatedUser.deactivated_at && (
              <p className="deactivation-date"><strong>Deactivated On:</strong> {new Date(deactivatedUser.deactivated_at).toLocaleString()}</p>
            )}
            {deactivatedUser.deactivated_by_email && (
              <p className="deactivated-by"><strong>Deactivated By:</strong> {deactivatedUser.deactivated_by_email}</p>
            )}
            <p className="info">Please request reactivation and an administrator will review your request.</p>
            
            <textarea
              placeholder="Explain why you need your account reactivated..."
              value={reactivationReason}
              onChange={(e) => setReactivationReason(e.target.value)}
              className="reactivation-textarea"
              rows="4"
              disabled={isSubmittingReactivation}
            />

            <div className="deactivation-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={handleSubmitReactivationRequest}
                disabled={isSubmittingReactivation || !reactivationReason.trim()}
              >
                {isSubmittingReactivation ? "Submitting..." : "Submit Reactivation Request"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setDeactivatedUser(null);
                  setReactivationReason("");
                  setError("");
                }}
                disabled={isSubmittingReactivation}
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                required
              >
                <option value={1}>Company A</option>
                <option value={2}>Company B</option>
              </select>

              <button type="submit">
                Login
              </button>
            </form>

            <div className="auth-links">
              <a className="forgot-link"
                onClick={() =>
                  navigate("/forgot-password")
                }>
                Forgot Password?
              </a>

              <button
                type="button"
                className="signup-btn"
                onClick={() =>
                  navigate("/signup")
                }
              >
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;