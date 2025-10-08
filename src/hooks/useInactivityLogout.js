import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/redux/slices/authSlice';
import api from '@/config/api';

/**
 * Custom hook for handling inactivity-based logout
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {boolean} enabled - Whether the inactivity logout is enabled (default: true)
 */
export const useInactivityLogout = (timeoutMinutes = 30, enabled = true) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Function to reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (!enabled || !isAuthenticated) return;
    
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
  }, [enabled, isAuthenticated, timeoutMinutes]);

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Call backend logout API
      await api.post("/logout");
    } catch (error) {
      console.error("Inactivity logout API error:", error);
      // Continue with logout process even if API call fails
    } finally {
      // Clear local data and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("slug");

      // Dispatch Redux logout action
      dispatch(logout());

      // Redirect to login page
      router.push("/Login");
    }
  }, [dispatch, router]);

  // Function to handle user activity
  const handleActivity = useCallback(() => {
    if (!enabled || !isAuthenticated) return;
    resetTimer();
  }, [enabled, isAuthenticated, resetTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'wheel'
    ];

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isAuthenticated, handleActivity, resetTimer]);

  // Reset timer when authentication state changes
  useEffect(() => {
    if (isAuthenticated && enabled) {
      resetTimer();
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isAuthenticated, enabled, resetTimer]);

  // Return functions for manual control
  return {
    resetTimer,
    handleLogout,
    isActive: isAuthenticated && enabled
  };
};

export default useInactivityLogout;
