import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("employee_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const handleResponse = (response) => response.data;

export const getEmployees = async () => {
  const response = await API.get("/employees");
  return handleResponse(response);
};

export const addEmployee = async (data) => {
  const response = await API.post("/employees", data);
  return handleResponse(response);
};

export const updateEmployee = async (id, data) => {
  const response = await API.put(`/employees/${id}`, data);
  return handleResponse(response);
};

export const deleteEmployee = async (id) => {
  const response = await API.delete(`/employees/${id}`);
  return handleResponse(response);
};

export const getDepartments = async () => {
  const response = await API.get("/departments");
  return handleResponse(response);
};

export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return handleResponse(response);
};

export default API;
