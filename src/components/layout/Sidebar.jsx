import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div>
        <h2 className="logo">EEMS</h2>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link to="/dashboard/employees" className="nav-link">
            <Users size={20} />
            Employees
          </Link>

          <Link to="/dashboard/departments" className="nav-link">
            <Building2 size={20} />
            Departments
          </Link>

          <Link to="/dashboard/attendance" className="nav-link">
            <CalendarCheck size={20} />
            Attendance
          </Link>

          <Link to="/dashboard/settings" className="nav-link">
            <Settings size={20} />
            Settings
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="admin-profile">
          <UserCircle size={42} />
          <div>
            <h4>Admin User</h4>
            <p>Administrator</p>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;