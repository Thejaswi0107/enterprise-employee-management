// React import not required with the new JSX transform
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  UserCircle,
  X,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-panel">
        <div className="sidebar-header">
          <h2 className="logo">EEMS</h2>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/employees"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Users size={20} />
            Employees
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/dashboard/invitations"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Building2 size={20} />
              Invitations
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/dashboard/companies"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Building2 size={20} />
              Company
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/dashboard/departments"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Building2 size={20} />
              Departments
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/dashboard/attendance"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <CalendarCheck size={20} />
              Attendance
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/dashboard/audit-logs"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Building2 size={20} />
              Audit Logs
            </NavLink>
          )}

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Settings size={20} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button onClick={handleLogout} className="logout-btn compact-logout">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;