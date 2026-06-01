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

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("employee_user", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("employee_token", userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("employee_user");
    localStorage.removeItem("employee_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);