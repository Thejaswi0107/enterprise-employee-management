import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

import Dashboard from "../pages/dashboard/Dashboard";
import Employees from "../pages/dashboard/Employees";
import Departments from "../pages/dashboard/Departments";
import Attendance from "../pages/dashboard/Attendance";
import Settings from "../pages/dashboard/Settings";

import { Bell, Menu, Search, UserCircle } from "lucide-react";

const AppRoutes = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />

      <div
        style={{
        flex: 1,
        marginLeft: "280px",
        padding: "20px",
        width: "calc(100% - 280px)",
        overflowX: "hidden",
        }}
    >
        {/* Common Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Menu size={24} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                padding: "12px 18px",
                borderRadius: "12px",
                width: "350px",
                gap: "10px",
              }}
            >
              <Search size={18} />
              <input
                type="text"
                placeholder="Search here..."
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            <div>{new Date().toLocaleDateString()}</div>
            <Bell size={22} />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <UserCircle size={42} />
              <div>
                <h4 style={{ margin: 0 }}>Admin User</h4>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FIXED ROUTES */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/employees" element={<Employees />} />
          <Route path="/dashboard/departments" element={<Departments />} />
          <Route path="/dashboard/attendance" element={<Attendance />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AppRoutes;