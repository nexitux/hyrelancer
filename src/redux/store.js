import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import jobReducer from './slices/jobSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    job: jobReducer,
  },
});