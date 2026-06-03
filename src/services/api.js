import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("employee_token");
  const user = JSON.parse(localStorage.getItem("employee_user") || "null");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user?.email && config.headers) {
    config.headers["X-User-Email"] = user.email;
  }

  if (user?.company_id && config.headers) {
    config.headers["X-User-Company-Id"] = String(user.company_id);
  }

  return config;
});

const handleResponse = (response) => response.data;

const LOCAL_EMPLOYEES_KEY = "local_employees";
const DELETED_EMPLOYEES_KEY = "deleted_employees";

const loadLocalEmployees = () => {
  try {
    const stored = localStorage.getItem(LOCAL_EMPLOYEES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load local employees", error);
    return [];
  }
};

const saveLocalEmployees = (employees) => {
  try {
    localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(employees));
  } catch (error) {
    console.warn("Failed to save local employees", error);
  }
};

const loadDeletedEmployeeIds = () => {
  try {
    const stored = localStorage.getItem(DELETED_EMPLOYEES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load deleted employee IDs", error);
    return [];
  }
};

const saveDeletedEmployeeIds = (ids) => {
  try {
    localStorage.setItem(DELETED_EMPLOYEES_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn("Failed to save deleted employee IDs", error);
  }
};

// Mock data for fallback
const mockEmployeesData = [
  {
    "id": 1,
    "name": "Chelsey Dietrich",
    "email": "lucio_hettinger@annie.ca",
    "phone": "+1-234-567-8901",
    "role": "Financial Analyst",
    "department": "Finance",
    "status": "On Leave",
    "joined_date": "2023-08-22",
    "date_of_birth": "1992-03-15",
    "address": "123 Financial St, New York, NY 10001",
    "salary": 75000,
    "manager_name": "John Smith",
    "skills": "Excel, Financial Analysis, Budgeting, Forecasting"
  },
  {
    "id": 2,
    "name": "Clementina DuBuque",
    "email": "rey.padberg@karina.biz",
    "phone": "+1-234-567-8902",
    "role": "Accountant",
    "department": "Finance",
    "status": "Active",
    "joined_date": "2024-06-12",
    "date_of_birth": "1995-07-20",
    "address": "456 Accounting Ave, Boston, MA 02101",
    "salary": 68000,
    "manager_name": "Jane Doe",
    "skills": "Accounting, Tax, GAAP, Quickbooks"
  },
  {
    "id": 3,
    "name": "Ervin Howell",
    "email": "shanna@melissa.tv",
    "phone": "+1-234-567-8903",
    "role": "UI/UX Designer",
    "department": "Design",
    "status": "Active",
    "joined_date": "2024-05-21",
    "date_of_birth": "1998-11-10",
    "address": "789 Design Plaza, San Francisco, CA 94102",
    "salary": 72000,
    "manager_name": "Michael Johnson",
    "skills": "Figma, Sketch, UI Design, UX Research, Prototyping"
  },
  {
    "id": 4,
    "name": "Thejaswi",
    "email": "thejaswi@company.com",
    "phone": "+1-234-567-8904",
    "role": "Software Engineer",
    "department": "IT",
    "status": "Active",
    "joined_date": "2024-01-15",
    "date_of_birth": "1996-05-25",
    "address": "321 Tech Road, Seattle, WA 98101",
    "salary": 95000,
    "manager_name": "Sarah Williams",
    "skills": "React, Node.js, Python, JavaScript, SQL"
  },
  {
    "id": 5,
    "name": "Pushpa",
    "email": "pushpa@company.com",
    "phone": "+1-234-567-8905",
    "role": "UI Designer",
    "department": "Design",
    "status": "Active",
    "joined_date": "2024-02-20",
    "date_of_birth": "1997-09-12",
    "address": "654 Creative Street, Los Angeles, CA 90001",
    "salary": 65000,
    "manager_name": "David Brown",
    "skills": "Adobe XD, Illustrator, Photoshop, Web Design, UI Kits"
  }
];

// Transform JSONPlaceholder user to employee format
const transformJsonPlaceholderUser = (user) => {
  const departments = ["Finance", "Design", "IT", "Management", "HR", "Sales"];
  const roles = ["Software Engineer", "Accountant", "UI Designer", "HR Manager", "Sales Executive", "Product Manager"];
  const statuses = ["Active", "Inactive", "On Leave"];
  
  const companyId = user.id <= 5 ? 1 : 2;
  const companyName = companyId === 1 ? "Company A" : "Company B";
  
  // Use consistent mapping based on user id
  const deptIndex = (user.id - 1) % departments.length;
  const roleIndex = (user.id - 1) % roles.length;
  const statusIndex = (user.id - 1) % statuses.length;
  
  // Format address
  const addressObj = user.address;
  const address = addressObj ? `${addressObj.street}, ${addressObj.city}, ${addressObj.zipcode}` : "N/A";
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: roles[roleIndex],
    department: departments[deptIndex],
    status: statuses[statusIndex],
    joined_date: "2024-01-15",
    date_of_birth: "1990-05-20",
    address: address,
    salary: 50000 + (user.id * 5000),
    manager_name: user.company?.name || "Management Team",
    skills: `${user.username}, ${user.company?.name || "Company"}, Web Services`,
    company_id: companyId,
    company: companyName,
  };
};

export const getCompanies = async () => {
  try {
    const response = await API.get("/companies");
    return handleResponse(response);
  } catch (error) {
    console.warn("Failed to load companies", error.message);
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Company A",
          slug: "company-a",
          employeeCount: 0,
          userCount: 0,
          status: "Active",
        },
        {
          id: 2,
          name: "Company B",
          slug: "company-b",
          employeeCount: 0,
          userCount: 0,
          status: "Active",
        },
      ],
      message: "Fallback company list",
    };
  }
};

export const getEmployees = async () => {
  const currentUser = JSON.parse(localStorage.getItem("employee_user") || "null");
  const currentCompanyId = currentUser?.company_id || null;

  const transformUser = (user) => {
    const companyId = user.id <= 5 ? 1 : 2;
    const companyName = companyId === 1 ? "Company A" : "Company B";
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: [
        "Software Engineer",
        "Financial Analyst",
        "Product Manager",
        "UI/UX Designer",
        "Accountant",
        "HR Manager",
        "Sales Executive",
        "Customer Success",
        "Marketing Specialist",
        "Operations Lead",
      ][(user.id - 1) % 10],
      department: [
        "IT",
        "Finance",
        "Product",
        "Design",
        "HR",
        "Sales",
        "Support",
        "Marketing",
        "Operations",
        "Administration",
      ][(user.id - 1) % 10],
      status: "Active",
      joined_date: "2024-01-15",
      date_of_birth: "1990-01-01",
      address: user.address
        ? `${user.address.street}, ${user.address.city}, ${user.address.zipcode}`
        : "",
      salary: 50000 + user.id * 2500,
      manager_name: user.company?.name || "Management Team",
      skills: user.username ? `${user.username}, Collaboration, Communication` : "Teamwork",
      company_id: companyId,
      company: companyName,
    };
  };

  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/users");
    const apiEmployees = Array.isArray(response.data)
      ? response.data.map(transformJsonPlaceholderUser)
      : [];

    const filteredEmployees = currentCompanyId
      ? apiEmployees.filter((employee) => employee.company_id === currentCompanyId)
      : apiEmployees;

    const localEmployees = loadLocalEmployees().map((employee) => ({
      ...employee,
      company_id: employee.company_id || currentCompanyId || 1,
      company:
        employee.company ||
        (employee.company_id === 2 ? "Company B" : "Company A"),
    }));

    const deletedIds = loadDeletedEmployeeIds();
    const employeeMap = new Map();

    filteredEmployees.forEach((employee) => {
      if (!deletedIds.includes(employee.id)) {
        employeeMap.set(employee.id, employee);
      }
    });

    localEmployees.forEach((localEmployee) => {
      if (!deletedIds.includes(localEmployee.id)) {
        employeeMap.set(localEmployee.id, localEmployee);
      }
    });

    return {
      success: true,
      data: Array.from(employeeMap.values()),
      message: "Employee data loaded from JSONPlaceholder",
    };
  } catch (error) {
    console.warn("Failed to load employees from JSONPlaceholder", error.message);

    const localEmployees = loadLocalEmployees().map((employee) => ({
      ...employee,
      company_id: employee.company_id || currentCompanyId || 1,
      company:
        employee.company ||
        (employee.company_id === 2 ? "Company B" : "Company A"),
    }));
    const deletedIds = loadDeletedEmployeeIds();
    const employeeMap = new Map();

    mockEmployeesData.forEach((employee) => {
      const companyId = employee.company_id || (employee.id <= 5 ? 1 : 2);
      const companyName = employee.company || (companyId === 1 ? "Company A" : "Company B");
      const enrichedEmployee = {
        ...employee,
        company_id: companyId,
        company: companyName,
      };

      if (!deletedIds.includes(enrichedEmployee.id)) {
        employeeMap.set(enrichedEmployee.id, enrichedEmployee);
      }
    });

    localEmployees.forEach((localEmployee) => {
      if (!deletedIds.includes(localEmployee.id)) {
        employeeMap.set(localEmployee.id, localEmployee);
      }
    });

    const allEmployees = Array.from(employeeMap.values());
    const filteredEmployees = currentCompanyId
      ? allEmployees.filter((employee) => employee.company_id === currentCompanyId)
      : allEmployees;

    return {
      success: true,
      data: filteredEmployees,
      message: "Using local data (JSONPlaceholder unavailable)",
    };
  }
};

export const addEmployee = async (data) => {
  const newEmployee = {
    id: Date.now(),
    ...data,
    status: data.status || "Active"
  };

  try {
    const response = await API.post("/employees", data);
    const savedEmployee = response?.data?.data || response?.data || newEmployee;
    const localEmployees = loadLocalEmployees();
    const updatedEmployees = [...localEmployees, savedEmployee];
    saveLocalEmployees(updatedEmployees);
    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return {
      success: true,
      data: savedEmployee,
      message: "Employee added successfully"
    };
  } catch (error) {
    console.warn("Error adding employee via API", error.message);
    const localEmployees = loadLocalEmployees();
    const updatedEmployees = [...localEmployees, newEmployee];
    saveLocalEmployees(updatedEmployees);
    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return {
      success: true,
      data: newEmployee,
      message: "Employee added locally (backend unavailable)"
    };
  }
};

export const updateEmployee = async (id, data) => {
  const updatedEmployee = { id, ...data, status: data.status || "Active" };

  try {
    const response = await API.put(`/employees/${id}`, data);
    const responseData = response?.data?.data || response?.data || updatedEmployee;

    const localEmployees = loadLocalEmployees();
    const updatedLocalEmployees = localEmployees.filter((employee) => employee.id !== id);
    updatedLocalEmployees.push(responseData);
    saveLocalEmployees(updatedLocalEmployees);
    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return {
      success: true,
      data: responseData,
      message: "Employee updated successfully"
    };
  } catch (error) {
    console.warn("Error updating employee via API", error.message);

    const localEmployees = loadLocalEmployees();
    const updatedLocalEmployees = localEmployees.filter((employee) => employee.id !== id);
    updatedLocalEmployees.push(updatedEmployee);
    saveLocalEmployees(updatedLocalEmployees);
    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return {
      success: true,
      data: updatedEmployee,
      message: "Employee updated locally (backend unavailable)"
    };
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await API.delete(`/employees/${id}`);

    const localEmployees = loadLocalEmployees().filter((employee) => employee.id !== id);
    saveLocalEmployees(localEmployees);

    const deletedIds = loadDeletedEmployeeIds();
    if (!deletedIds.includes(id)) {
      saveDeletedEmployeeIds([...deletedIds, id]);
    }

    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return handleResponse(response);
  } catch (error) {
    console.warn("Error deleting employee via API", error.message);

    const localEmployees = loadLocalEmployees().filter((employee) => employee.id !== id);
    saveLocalEmployees(localEmployees);

    const deletedIds = loadDeletedEmployeeIds();
    if (!deletedIds.includes(id)) {
      saveDeletedEmployeeIds([...deletedIds, id]);
    }

    // Notify UI that employees changed
    try { window.dispatchEvent(new Event('employeesChanged')); } catch (e) {}

    return {
      success: true,
      data: { id },
      message: "Employee deleted locally (backend unavailable)"
    };
  }
};

export const getDepartments = async () => {
  try {
    const response = await API.get("/departments");
    return handleResponse(response);
  } catch (error) {
    console.warn("Error getting departments via API", error.message);
    return {
      success: true,
      data: ["Finance", "Design", "IT", "Management"],
      message: "Using default departments (backend unavailable)"
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return handleResponse(response);
  } catch (error) {
    console.warn("Error logging in via API", error.message);
    // For login, just throw the error as we don't have a good fallback
    throw error;
  }
};

// Role Change Request Functions
export const submitRoleChangeRequest = async (requestData) => {
  const LOCAL_ROLE_REQUESTS_KEY = "local_role_requests";
  
  try {
    const response = await API.post("/api/role-change/request", requestData);
    return {
      success: true,
      data: response.data,
      message: "Role change request submitted successfully"
    };
  } catch (error) {
    console.warn("Error submitting role change request via API", error.message);
    
    // Fallback: store locally
    const newRequest = {
      id: Date.now(),
      user_email: requestData.user_email,
      user_name: requestData.user_name,
      requested_role: requestData.requested_role,
      admin_email: requestData.admin_email,
      status: "Pending",
      request_date: new Date().toISOString(),
      response_date: null,
      admin_comments: null
    };
    
    try {
      const stored = localStorage.getItem(LOCAL_ROLE_REQUESTS_KEY);
      const requests = stored ? JSON.parse(stored) : [];
      requests.push(newRequest);
      localStorage.setItem(LOCAL_ROLE_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn("Failed to store role request locally", e);
    }
    
    return {
      success: true,
      data: newRequest,
      message: "Role change request submitted locally (backend unavailable)"
    };
  }
};

export const getPendingRoleRequests = async (adminEmail = null) => {
  const LOCAL_ROLE_REQUESTS_KEY = "local_role_requests";
  
  try {
    const response = await API.get("/api/role-change/pending", {
      params: adminEmail ? { admin_email: adminEmail } : {}
    });
    return {
      success: response.data?.success || true,
      data: response.data?.data || [],
      message: response.data?.message || "Pending requests retrieved successfully"
    };
  } catch (error) {
    console.warn("Error fetching pending requests via API", error.message);
    
    // Fallback: retrieve from local storage
    try {
      const stored = localStorage.getItem(LOCAL_ROLE_REQUESTS_KEY);
      const allRequests = stored ? JSON.parse(stored) : [];
      const pendingRequests = allRequests.filter(req => req.status === "Pending");
      
      const filtered = adminEmail 
        ? pendingRequests.filter(req => req.admin_email === adminEmail)
        : pendingRequests;
      
      return {
        success: true,
        data: filtered,
        message: "Pending requests retrieved from local storage"
      };
    } catch (e) {
      console.warn("Failed to retrieve local requests", e);
      return {
        success: true,
        data: [],
        message: "No pending requests found"
      };
    }
  }
};

export const getUserRoleRequests = async (userEmail) => {
  const LOCAL_ROLE_REQUESTS_KEY = "local_role_requests";
  
  try {
    const response = await API.get("/api/role-change/user", {
      params: { user_email: userEmail }
    });
    return {
      success: response.data?.success || true,
      data: response.data?.data || [],
      message: response.data?.message || "User requests retrieved successfully"
    };
  } catch (error) {
    console.warn("Error fetching user requests via API", error.message);
    
    // Fallback: retrieve from local storage
    try {
      const stored = localStorage.getItem(LOCAL_ROLE_REQUESTS_KEY);
      const allRequests = stored ? JSON.parse(stored) : [];
      const userRequests = allRequests.filter(req => req.user_email === userEmail);
      
      return {
        success: true,
        data: userRequests,
        message: "User requests retrieved from local storage"
      };
    } catch (e) {
      console.warn("Failed to retrieve local requests", e);
      return {
        success: true,
        data: [],
        message: "No requests found for this user"
      };
    }
  }
};

export const respondToRoleChangeRequest = async (requestId, responseData) => {
  const LOCAL_ROLE_REQUESTS_KEY = "local_role_requests";
  
  try {
    const response = await API.put(`/api/role-change/request/${requestId}`, responseData);
    return {
      success: response.data?.success || true,
      data: response.data?.data || {},
      message: response.data?.message || `Role change request ${responseData.status.toLowerCase()} successfully`
    };
  } catch (error) {
    console.warn("Error responding to role change request via API", error.message);
    
    // Fallback: update in local storage
    try {
      const stored = localStorage.getItem(LOCAL_ROLE_REQUESTS_KEY);
      const requests = stored ? JSON.parse(stored) : [];
      
      const requestIndex = requests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        requests[requestIndex].status = responseData.status;
        requests[requestIndex].response_date = new Date().toISOString();
        requests[requestIndex].admin_comments = responseData.admin_comments;
        localStorage.setItem(LOCAL_ROLE_REQUESTS_KEY, JSON.stringify(requests));
        
        return {
          success: true,
          data: requests[requestIndex],
          message: `Role change request ${responseData.status.toLowerCase()} successfully`
        };
      }
    } catch (e) {
      console.warn("Failed to update local request", e);
    }
    
    return {
      success: false,
      message: "Failed to respond to role change request"
    };
  }
};

export const getAllRoleRequests = async () => {
  const LOCAL_ROLE_REQUESTS_KEY = "local_role_requests";
  
  try {
    const response = await API.get("/api/role-change/all");
    return {
      success: response.data?.success || true,
      data: response.data?.data || [],
      message: response.data?.message || "All requests retrieved successfully"
    };
  } catch (error) {
    console.warn("Error fetching all requests via API", error.message);
    
    // Fallback: retrieve from local storage
    try {
      const stored = localStorage.getItem(LOCAL_ROLE_REQUESTS_KEY);
      const allRequests = stored ? JSON.parse(stored) : [];
      
      return {
        success: true,
        data: allRequests,
        message: "All requests retrieved from local storage"
      };
    } catch (e) {
      console.warn("Failed to retrieve local requests", e);
      return {
        success: true,
        data: [],
        message: "No requests found"
      };
    }
  }
};

export default API;
