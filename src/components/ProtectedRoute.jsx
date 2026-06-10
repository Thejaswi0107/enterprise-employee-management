// React import not required with the new JSX transform
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../services/api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    let active = true;

    const verifyAccountStatus = async () => {
      if (!user || location.pathname === "/dashboard/account-deactivated") {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/reactivation/account-status", {
          headers: getAuthHeaders(),
        });

        if (!active) return;

        if (response.ok) {
          const data = await response.json();
          setIsDeactivated(data.account?.is_active === false);
        } else {
          setIsDeactivated(false);
        }
      } catch (error) {
        setIsDeactivated(false);
      } finally {
        if (active) setCheckingStatus(false);
      }
    };

    verifyAccountStatus();

    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (checkingStatus) {
    return <div className="w-full py-14 text-center text-gray-600">Checking account status...</div>;
  }

  if (!isDeactivated && location.pathname === "/dashboard/account-deactivated") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isDeactivated && location.pathname !== "/dashboard/account-deactivated") {
    return <Navigate to="/dashboard/account-deactivated" replace />;
  }

  if (
    allowedRoles &&
    user.role &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;