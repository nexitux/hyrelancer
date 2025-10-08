import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/redux/slices/adminSlice';

/**
 * Custom hook for handling admin inactivity-based logout
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {boolean} enabled - Whether the inactivity logout is enabled (default: true)
 */
export const useAdminInactivityLogout = (timeoutMinutes = 30, enabled = true) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.admin);
  
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
  const handleLogout = useCallback(() => {
    // Clear admin data and Redux state
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Dispatch Redux logout action
    dispatch(logoutAdmin());

    // Redirect to admin gateway
    router.push("/gateway");
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

export default useAdminInactivityLogout;
