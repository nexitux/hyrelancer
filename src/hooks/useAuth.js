// src/hooks/useAuth.js
'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api from '@/config/api';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  setUserType,
  updateUserProfile
} from '@/redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (credentials) => {
    dispatch(loginStart());
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/login', credentials);

      if (!response.data || !response.data.access_token || !response.data.user) {
        throw new Error("Invalid response format from server");
      }

      // Store token and user data immediately
      const { user, access_token, fp_slug } = response.data;
      
      // Update localStorage first
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', user.user_type || '');
      if (fp_slug) {
        localStorage.setItem('slug', fp_slug);
      }

      // Then update Redux state
      dispatch(loginSuccess({
        user: user,
        token: access_token,
        userType: user.user_type,
        slug: fp_slug,
        availability: response.data.u_avail || 'Offline',
        u_avail: response.data.u_avail || 'Offline'
      }));

      toast.success("Login successful!");

      // Let AuthWrapper handle the redirect
      console.log('✅ Login successful, letting AuthWrapper handle redirect');

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        if (errorMessage.toLowerCase().includes('email not verified')) {
          toast.error("Please verify your email before logging in. Check your inbox for verification link.", {
            autoClose: 7000,
          });
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }

      dispatch(loginFailure(errorMessage));

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/register', {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password,
        'confirm-password': userData.confirm_password,
        send_email: true
      });

      toast.success(response.data?.message || "Registration successful! Please check your email for verification.", {
        autoClose: 5000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Register error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        toast.error(errorMessage, { autoClose: 5000 });
      } else {
        toast.error(errorMessage);
      }

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        return { success: false, errors: error.response.data.errors };
      }

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const submitUserType = async (userType) => {
    console.log("🎯 submitUserType called with:", userType);
    setIsLoading(true);
    const normalizedType = (userType || '').toString().toLowerCase(); 

    try {
      const response = await api.post('/submitUsertype', { userType: normalizedType });
      console.log("📡 submitUsertype API response:", response.data);
      
      const updatedUser = response.data?.user || null;

      // Update localStorage first
      if (typeof window !== 'undefined') {
        localStorage.setItem('userType', normalizedType);
        
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log("💾 Updated user saved to localStorage");
        } else {
          // Update existing user data with new user_type
          const existingUser = localStorage.getItem('user');
          if (existingUser) {
            try {
              const parsed = JSON.parse(existingUser);
              parsed.user_type = normalizedType;
              localStorage.setItem('user', JSON.stringify(parsed));
              console.log("🔄 Updated existing user with new user_type");
            } catch (e) {
              console.warn('Failed to update existing user data:', e);
            }
          }
        }
      }

      // Update Redux state
      dispatch(setUserType(normalizedType));
      
      if (updatedUser) {
        dispatch(updateUserProfile(updatedUser));
      } else if (typeof window !== 'undefined') {
        // Update Redux with the patched user data
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
          try {
            const parsed = JSON.parse(existingUser);
            dispatch(updateUserProfile(parsed));
          } catch (e) {
            console.warn('Failed to update Redux with patched user:', e);
          }
        }
      }

      toast.success('User type updated successfully!');
      
      // Let AuthWrapper handle the redirect
      console.log("✅ User type submitted successfully, letting AuthWrapper handle redirect");

      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Submit User Type error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit user type";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errors,
    handleLogin,
    handleRegister,
    submitUserType,
  };
};

export default useAuth;