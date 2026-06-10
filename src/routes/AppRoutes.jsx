// React import not required with the new JSX transform
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Employees from "../pages/dashboard/Employees";
import Departments from "../pages/dashboard/Departments";
import Attendance from "../pages/dashboard/Attendance";
import Settings from "../pages/dashboard/Settings";
import AuditLogs from "../pages/dashboard/AuditLogs";
import Companies from "../pages/dashboard/Companies";
import InvitationsAndMembers from "../pages/dashboard/InvitationsAndMembers";
import AccountDeactivated from "../pages/dashboard/AccountDeactivated";
import AcceptInvitation from "../pages/AcceptInvitation";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/employees" element={<Employees />} />
        <Route
          path="dashboard/companies"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Companies />
            </ProtectedRoute>
          }
        />
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
          path="dashboard/invitations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <InvitationsAndMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/settings"
          element={
            <Settings />
          }
        />
        <Route
          path="dashboard/account-deactivated"
          element={<AccountDeactivated />}
        />
        <Route
          path="dashboard/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogs />
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