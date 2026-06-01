import React from "react";

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  children,
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {children ? (
        children
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

export default FormField;
