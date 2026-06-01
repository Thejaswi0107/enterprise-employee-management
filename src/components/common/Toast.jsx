import React from "react";

const Toast = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`toast ${type === "error" ? "toast-error" : "toast-success"}`}>
      {message}
    </div>
  );
};

export default Toast;
