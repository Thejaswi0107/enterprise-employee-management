import { useState, useEffect } from "react";
import FormField from "../common/FormField";

const AddEmployeeModal = ({
  show,
  onClose,
  onSubmit,
  employee,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
    joined_date: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        role: employee.role || "",
        department: employee.department || "",
        status: employee.status || "Active",
        joined_date: employee.joined_date || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        status: "Active",
        joined_date: "",
      });
    }
    setErrors({});
  }, [employee, show]);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: null,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.role.trim()) newErrors.role = "Role is required.";
    if (!formData.department.trim()) newErrors.department = "Department is required.";
    if (!formData.joined_date) newErrors.joined_date = "Joined date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>
          {employee
            ? "Edit Employee"
            : "Add Employee"}
        </h2>

        <div className="modal-grid">
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            placeholder="Employee Name"
            onChange={handleChange}
            error={errors.name}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            placeholder="Employee Email"
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label="Role"
            name="role"
            value={formData.role}
            placeholder="Role"
            onChange={handleChange}
            error={errors.role}
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
          >
            {departments.length > 0 ? (
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                placeholder="Department"
                onChange={handleChange}
              />
            )}
          </FormField>

          <FormField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </FormField>

          <FormField
            label="Joined Date"
            name="joined_date"
            type="date"
            value={formData.joined_date}
            onChange={handleChange}
            error={errors.joined_date}
          />
        </div>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSubmit}
          >
            {employee
              ? "Update Employee"
              : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;