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
      </div>
    </div>
  );
};

export default Login;