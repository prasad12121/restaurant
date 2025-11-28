import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// AUTO-LOGOUT ON TOKEN EXPIRE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Token expired. Auto logging out...");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.location.href = "/login"; // force redirect
    }
    return Promise.reject(error);
  }
);

export default api;
