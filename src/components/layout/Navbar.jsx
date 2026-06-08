import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationCenter from "./NotificationCenter";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setDarkMode(event.detail === true);
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("darkMode", nextMode);
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: nextMode })
    );
  };

  return (
    <div className="h-20 bg-white border-b px-4 md:px-8 flex justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        <button className="text-gray-600" onClick={toggleSidebar}>
          <FaBars size={22} />
        </button>

        {/* search removed per user request */}
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={handleToggleTheme}
          className="text-gray-600 hover:text-gray-900"
        >
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        <div className="hidden md:block text-gray-700 font-medium">{today}</div>

        <NotificationCenter />

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <UserCircle size={18} />
            {user?.name || "Team Member"}
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <h3>{user?.name || "Team Member"}</h3>
                <p className="text-sm text-gray-500">{user?.email || "No email"}</p>
              </div>

              <div className="profile-dropdown-role">
                {user?.role === "admin" ? "Administrator" : "Employee"}
              </div>

              <button onClick={handleLogout} className="logout-link">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;