import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("employee_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Failed to parse saved user", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser());
  const [activeCompany, setActiveCompanyState] = useState(null);

  // initialize active company when user is available
  React.useEffect(() => {
    if (user && user.company_id) {
      setActiveCompanyState(user.company_id);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("employee_user", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("employee_token", userData.token);
    }

    if (userData.company_id) {
      setActiveCompanyState(userData.company_id);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveCompanyState(null);
    localStorage.removeItem("employee_user");
    localStorage.removeItem("employee_token");
  };

  const setActiveCompany = (companyId, companyName = null) => {
    setActiveCompanyState(companyId);

    // also update the saved user so API interceptor picks up company header
    try {
      const existing = JSON.parse(localStorage.getItem("employee_user") || "null");
      const updated = {
        ...(existing || user || {}),
        company_id: companyId,
        company: companyName || (existing && existing.company) || (user && user.company),
      };
      localStorage.setItem("employee_user", JSON.stringify(updated));
      setUser(updated);
    } catch (e) {
      console.warn("Failed to persist active company", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, activeCompany, setActiveCompany }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const useAuthContext = useAuth;
