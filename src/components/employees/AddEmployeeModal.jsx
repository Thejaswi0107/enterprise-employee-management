import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import FormField from "../common/FormField";

const AddEmployeeModal = ({
  show,
  onClose,
  onSubmit,
  employee,
  departments = [],
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    company_id: user?.company_id || 1,
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
        company_id: employee.company_id || user?.company_id || 1,
        status: employee.status || "Active",
        joined_date: employee.joined_date || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        company_id: user?.company_id || 1,
        status: "Active",
        joined_date: "",
      });
    }
    setErrors({});
  }, [employee, show, user?.company_id]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all mandatory fields are filled
  const isMandatoryFieldsFilled = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.role.trim() &&
      formData.department.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
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
            type="text"
            value={formData.department}
            placeholder="Enter Department"
            onChange={handleChange}
            error={errors.department}
          />

          <FormField
            label="Company"
            name="company_id"
            onChange={handleChange}
          >
            <select
              id="company_id"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
            >
              <option value={1}>Company A</option>
              <option value={2}>Company B</option>
            </select>
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
            label="Joined Date (Optional)"
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
            disabled={!isMandatoryFieldsFilled()}
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