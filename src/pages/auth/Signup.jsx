import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    company_id: 1,
    company: "Company A",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const existingUser = registeredUsers.find(
      (user) => user.email === formData.email
    );

    if (existingUser) {
      alert("An account with this email already exists.");
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      company_id: Number(formData.company_id),
      company: formData.company,
    };

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify([...registeredUsers, userData])
    );

    alert("Account Created Successfully!");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up</h1>
        <p>Create your account</p>

        <form onSubmit={handleSignup}>
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
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                company_id: Number(value),
                company: value === "2" ? "Company B" : "Company A",
              });
            }}
            required
          >
            <option value={1}>Company A</option>
            <option value={2}>Company B</option>
          </select>

          <button type="submit">
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;