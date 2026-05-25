import { useState } from "react";

const AddEmployeeModal = ({
  show,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
    joined_date: "",
  });

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department ||
      !formData.joined_date
    ) {
      alert("Please fill all fields");
      return;
    }

    await onAdd(formData);

    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      status: "Active",
      joined_date: "",
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add Employee</h2>

        <div className="modal-grid">
          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Employee Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>

          <input
            type="date"
            name="joined_date"
            value={formData.joined_date}
            onChange={handleChange}
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
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;