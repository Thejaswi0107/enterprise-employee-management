import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getEmployees = () => API.get("/employees");

export const getEmployeeById = (id) =>
  API.get(`/employees/${id}`);

export const createEmployee = (employeeData) =>
  API.post("/employees", employeeData);

export const updateEmployee = (id, employeeData) =>
  API.put(`/employees/${id}`, employeeData);

export const deleteEmployee = (id) =>
  API.delete(`/employees/${id}`);

export default API;