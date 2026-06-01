import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Employees from "../pages/dashboard/Employees";
import Departments from "../pages/dashboard/Departments";
import Attendance from "../pages/dashboard/Attendance";
import Settings from "../pages/dashboard/Settings";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/employees" element={<Employees />} />
        <Route
          path="dashboard/departments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;