// React import not required with the new JSX transform

const Toast = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`toast ${type === "error" ? "toast-error" : "toast-success"}`}>
      {message}
    </div>
  );
};

export default Toast;
