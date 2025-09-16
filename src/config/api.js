// src/config/api.js
import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://test.hyrelancer.in/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach token from localStorage or redux store (safe for browser)
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token") || store.getState()?.auth?.token;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // server-side: avoid reading localStorage
        const token = store.getState()?.auth?.token;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn("Error attaching token to request:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor remains similar — logging & logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/Login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;