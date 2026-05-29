import { useState, useEffect } from "react";
import "../../components/styles/Settings.css";

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("darkMode") === "true"
);

const toggleDarkMode = () => {
  const newMode = !darkMode;
  setDarkMode(newMode);

  localStorage.setItem("darkMode", newMode);
};

useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }else {
    document.body.classList.remove("dark-mode");
  }
}, [darkMode]);

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p>
        Manage your account preferences, password, notifications and theme.
      </p>

      {/* Top Section */}
      <div className="settings-top">

        {/* Account Details */}
        <div className="settings-card">
          <h2>Account Details</h2>

          <input
            type="text"
            placeholder="Full Name"
            defaultValue="Admin User"
          />

          <input
            type="email"
            placeholder="Email Address"
            defaultValue="admin@gmail.com"
          />

          <input
            type="text"
            placeholder="Phone Number"
            defaultValue="+91 9876543210"
          />

          <input
            type="text"
            placeholder="Role"
            defaultValue="Administrator"
          />

          <button className="save-btn">
            Save Changes
          </button>
        </div>

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
              onChange={toggleDarkMode}/>
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
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;