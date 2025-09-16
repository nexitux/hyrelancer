// src/config/adminApi.js
import axios from "axios";
import { store } from "../redux/store";
import { logoutAdmin } from "../redux/slices/adminSlice"; // Import the specific admin logout action

const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://test.hyrelancer.in/api/admin";

const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to attach the admin token
adminApi.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const adminToken = localStorage.getItem("adminToken") || store.getState()?.admin?.token;
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } else {
        const adminToken = store.getState()?.admin?.token;
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      }
    } catch (e) {
      console.warn("Error attaching admin token:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized for admin
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logoutAdmin());
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        window.location.href = "/gateway"; // Redirect to admin login page
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;