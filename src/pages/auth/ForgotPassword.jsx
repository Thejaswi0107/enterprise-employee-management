import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setMessage("");
  };

  const handleReset = (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const userIndex = registeredUsers.findIndex(
      (user) => user.email === formData.email
    );

    if (userIndex === -1) {
      setError("No registered user found with this email.");
      return;
    }

    registeredUsers[userIndex] = {
      ...registeredUsers[userIndex],
      password: formData.password,
    };

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(registeredUsers)
    );

    setMessage("Password updated successfully. Please login.");
    setFormData({ email: formData.email, password: "", confirmPassword: "" });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p>Reset your password using the email associated with your account.</p>

        {error && <p className="login-error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleReset}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">Reset Password</button>
        </form>

        <p className="auth-footer">
          Remembered your password?
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
