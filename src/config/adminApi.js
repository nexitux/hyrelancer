// src/config/adminApi.js
import axios from "axios";
import { store } from "../redux/store";
import { logoutAdmin } from "../redux/slices/adminSlice"; // Import the specific admin logout action

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://hyre.hyrelancer.com/api/admin";

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
      // ensure headers object exists
      config.headers = config.headers || {};

      let adminToken = null;
      if (typeof window !== "undefined") {
        adminToken = localStorage.getItem("adminToken") || store.getState()?.admin?.token;
      } else {
        // server-side: read token from redux store if available
        adminToken = store.getState()?.admin?.token;
      }

      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
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
    try {
      if (error?.response?.status === 401) {
        // best-effort dispatch; fail quietly if logoutAdmin isn't available
        try {
          store.dispatch(logoutAdmin());
        } catch (e) {
          console.warn("logoutAdmin dispatch failed:", e);
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken");
          window.location.href = "/gateway"; // Redirect to admin login page (change if needed)
        }
      }
    } catch (e) {
      console.warn("adminApi response interceptor error:", e);
    }
    return Promise.reject(error);
  }
);

/**
 * Helpers to manage admin token programmatically
 */
export function setAdminToken(token) {
  if (token) {
    adminApi.defaults.headers = adminApi.defaults.headers || {};
    adminApi.defaults.headers.Authorization = `Bearer ${token}`;
    try {
      if (typeof window !== "undefined") localStorage.setItem("adminToken", token);
    } catch (e) {
      console.warn("setAdminToken localStorage write failed:", e);
    }
  } else {
    delete adminApi.defaults.headers.Authorization;
    try {
      if (typeof window !== "undefined") localStorage.removeItem("adminToken");
    } catch (e) {
      console.warn("clear adminToken localStorage failed:", e);
    }
  }
}

export function clearAdminToken() {
  setAdminToken(null);
}

/**
 * Admin Dashboard API calls
 */
export const adminDashboardApi = {
  // Get dashboard analytics data
  getDashboardData: async () => {
    try {
      const response = await adminApi.get('/AdminDashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

/**
 * Admin Messages API calls
 */
export const adminMessagesApi = {
  // Get all messages
  getMessages: async () => {
    try {
      const response = await adminApi.get('/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Get single message
  getMessage: async (encodedId) => {
    try {
      const response = await adminApi.get(`/messages/${encodedId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  // Create new message
  createMessage: async (messageData) => {
    try {
      const response = await adminApi.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  // Update message
  updateMessage: async (encodedId, messageData) => {
    try {
      const response = await adminApi.put(`/messages/${encodedId}`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  // Toggle message status (delete/restore)
  toggleMessageStatus: async (encodedId) => {
    try {
      const response = await adminApi.delete(`/messages/${encodedId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling message status:', error);
      throw error;
    }
  }
};

/**
 * Admin Notifications API calls
 */
export const adminNotificationsApi = {
  // Get all notifications
  getNotifications: async () => {
    try {
      const response = await adminApi.get('/AdminNotifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
};

export default adminApi;
