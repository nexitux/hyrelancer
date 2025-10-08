// src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ADMIN_TOKEN_KEY, ADMIN_USER_KEY, ADMIN_GUARD_KEY } from '../constants/authKeys';
import { adminNotificationsApi } from '../../config/adminApi';

// Async thunk handles login + persistence
export const adminLogin = createAsyncThunk(
  '/gateway',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch('https://hyre.hyrelancer.com/api/adminLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const backendMessage =
          data?.error || data?.message || (data?.errors && Object.values(data.errors).flat().join(' ')) ||
          'Authentication failed';
        return rejectWithValue(backendMessage);
      }

      // normalize payload
      return {
        token: data.access_token,
        user: data.user || data.admin || {},
        guard: data.guard || null,
        tokenType: data.token_type || 'bearer'
      };
    } catch (err) {
      return rejectWithValue('Network error');
    }
  }
);

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'admin/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminNotificationsApi.getNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk for marking notification as read
export const markNotificationAsRead = createAsyncThunk(
  'admin/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await adminNotificationsApi.markAsRead(notificationId);
      return { notificationId, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

const loadAdminState = () => {
  if (typeof window === 'undefined') return { 
    user: null, 
    token: null, 
    guard: null, 
    isLoading: false, 
    error: null, 
    isAuthenticated: false,
    notifications: [],
    unreadCount: 0
  };

  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const user = localStorage.getItem(ADMIN_USER_KEY);
  const guard = localStorage.getItem(ADMIN_GUARD_KEY);

  if (token && user) {
    try {
      return { 
        user: JSON.parse(user), 
        token, 
        guard, 
        isLoading: false, 
        error: null, 
        isAuthenticated: true,
        notifications: [],
        unreadCount: 0
      };
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      localStorage.removeItem(ADMIN_GUARD_KEY);
    }
  }
  return { 
    user: null, 
    token: null, 
    guard: null, 
    isLoading: false, 
    error: null, 
    isAuthenticated: false,
    notifications: [],
    unreadCount: 0
  };
};

const adminSlice = createSlice({
  name: 'admin',
  initialState: loadAdminState(),
  reducers: {
    logoutAdmin: (state) => {
      state.user = null;
      state.token = null;
      state.guard = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.notifications = [];
      state.unreadCount = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        localStorage.removeItem(ADMIN_GUARD_KEY);
      }
    },
    clearAdminError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.guard = action.payload.guard;
        state.isAuthenticated = true;
        // persist
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_TOKEN_KEY, action.payload.token || '');
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(action.payload.user || {}));
          if (action.payload.guard) localStorage.setItem(ADMIN_GUARD_KEY, action.payload.guard);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Notification reducers
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.notifications?.filter(n => !n.is_read).length || 0;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId, response } = action.payload;
        // Update the notification in the state
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex].is_read = true;
          // Recalculate unread count
          state.unreadCount = state.notifications.filter(n => !n.is_read).length;
        }
      });
  }
});

export const { logoutAdmin, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
