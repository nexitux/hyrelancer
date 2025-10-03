// src/config/api.js
import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.hyrelancer.in/api";

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

// Freelancer Job API functions
export const freelancerJobAPI = {
  // Get assigned job list for freelancer
  getFeAssignedJobList: async () => {
    const response = await api.get('/getFeAssignedJobList');
    return response.data;
  },

  // Update job status
  updateJobStatus: async (cujId, jobStatus) => {
    const response = await api.put('/updateJobStatus', {
      cuj_id: btoa(cujId), // Encode to base64
      job_status: jobStatus
    });
    return response.data;
  },

  // Store freelancer comment
  storeFeComment: async (cujId, comment) => {
    const response = await api.post('/storeFeComment', {
      cuj_id: cujId, // Don't encode in request body, only in URL
      comment: comment
    });
    return response.data;
  },

  // Get job comments
  getJobComments: async (cujId, feUserId) => {
    const response = await api.get(`/getJobComments/${btoa(cujId)}/${btoa(feUserId)}`);
    return response.data;
  },

  // Get applied jobs list for freelancer
  getAppliedJobs: async () => {
    const response = await api.get('/getAppliedJobs');
    return response.data;
  },

  // Get applied job alerts (limited to 5 latest)
  getAppliedJobAlert: async () => {
    const response = await api.get('/getAppliedJobAlert');
    return response.data;
  }
};

export default api;