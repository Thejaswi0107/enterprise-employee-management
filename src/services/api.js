import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getEmployees = () => API.get("/employees");
export const addEmployee = (data) => API.post("/employees", data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
export const loginUser = async (credentials) => {
  if (
    credentials.email === "admin@gmail.com" &&
    credentials.password === "admin123"
  ) {
    return {
      success: true,
      user: {
        name: "Admin User",
        email: "admin@gmail.com",
        role: "admin",
      },
    };
  }

  if (
    credentials.email === "user@gmail.com" &&
    credentials.password === "user123"
  ) {
    return {
      success: true,
      user: {
        name: "Normal User",
        email: "user@gmail.com",
        role: "user",
      },
    };
  }

  throw new Error("Invalid email or password");
};
export default API;