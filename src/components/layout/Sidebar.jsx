import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <div className="w-56 bg-[#0f172a] min-h-screen p-5 relative flex flex-col">
      {/* Logo */}
      <h1 className="text-white text-2xl font-bold mb-10">EEMS</h1>

      {/* Navigation */}
      <nav className="space-y-3 flex-1">
        <NavLink to="/dashboard" end className={menuClass}>
          <FaHome />
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/employees" className={menuClass}>
          <FaUsers />
          Employees
        </NavLink>

        <NavLink to="/dashboard/departments" className={menuClass}>
          <FaBuilding />
          Departments
        </NavLink>

        <NavLink to="/dashboard/attendance" className={menuClass}>
          <FaCalendarCheck />
          Attendance
        </NavLink>

        <NavLink to="/dashboard/settings" className={menuClass}>
          <FaCog />
          Settings
        </NavLink>
      </nav>

      {/* Admin Profile */}
      <div className="flex items-center gap-3 pt-6 border-t border-slate-700">
        <FaUserCircle className="text-4xl text-gray-300" />

        <div>
          <p className="text-white font-medium">Admin User</p>
          <p className="text-sm text-gray-400">Administrator</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;