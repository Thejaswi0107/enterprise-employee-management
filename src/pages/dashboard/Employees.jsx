import { useState, useEffect } from "react";
import EmployeeTable from "../../components/employees/EmployeeTable";
import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import "../../components/employees/Employees.css";

const defaultEmployees = [
  {
    id: 1,
    name: "Yerramchetti Thejaswi",
    email: "yteju.14@gmail.com",
    role: "UI Developer",
    department: "Front end developer",
    status: "Active",
    joined_date: "2025-01-03",
  },
  {
    id: 2,
    name: "THEJASWI",
    email: "thejaswi@gmail.com",
    role: "UI",
    department: "Developer",
    status: "Active",
    joined_date: "2025-01-10",
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = localStorage.getItem("employees");
    return savedEmployees ? JSON.parse(savedEmployees) : defaultEmployees;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Save employees in browser storage
  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  // Add Employee
  const handleAddEmployee = (newEmployee) => {
    setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
  };

  // Delete Employee
  const handleDelete = (id) => {
    setEmployees((prevEmployees) =>
      prevEmployees.filter((employee) => employee.id !== id)
    );
  };

  // Edit Employee
  const handleEdit = (id) => {
    alert(`Edit employee ID: ${id}`);
  };

  // Change Status
  const handleStatusChange = (id, newStatus) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === id
          ? { ...employee, status: newStatus }
          : employee
      )
    );
  };

  // Dynamic departments
  const departments = [
    ...new Set(employees.map((employee) => employee.department)),
  ];

  // Search + Filter
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.role.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search);

    const matchesDepartment =
      selectedDepartment === "" ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="employees-page">
      <div className="employees-header">
        <h1>Employees</h1>
        <p>
          Manage your team members, search by name/role/email, and filter by
          department.
        </p>
      </div>

      {/* Search Controls */}
      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>

          {departments.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <EmployeeTable
        employees={filteredEmployees}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />

      {/* Add Employee Popup */}
      <AddEmployeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddEmployee}
      />
    </div>
  );
};

export default Employees;