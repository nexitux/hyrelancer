// src/components/AuthWrapper/page.jsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { restoreAuthState, logout } from "@/redux/slices/authSlice";
import api from "@/config/api";
import Loader from "../Loader/page";

const VERIFY_ENDPOINT = null;

function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function AuthWrapperInner({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const allowOnAuth = searchParams?.get("allow") === "1" || searchParams?.get("force") === "1";
  const { isAuthenticated, user, token } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Track if we've already made a redirect decision
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🔄 Initializing auth state...');
      
      try {
        // Check for suppress flag first
        const suppressAutoRedirect = localStorage.getItem('suppressAutoRedirect');
        if (suppressAutoRedirect) {
          localStorage.removeItem('suppressAutoRedirect');
          console.log('🚫 Auto-redirect suppressed, clearing flag');
        }

        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          console.log('❌ No token found in localStorage');
          if (mounted) {
            setLoading(false);
            setAuthInitialized(true);
          }
          return;
        }

        const payload = decodeJwt(storedToken);
        const nowSec = Math.floor(Date.now() / 1000);

        if (payload && payload.exp && payload.exp > nowSec) {
          console.log('✅ Valid token found, restoring auth state');
          
          const storedUser = localStorage.getItem("user");
          const storedUserType = localStorage.getItem("userType");
          const storedSlug = localStorage.getItem("slug");

          let completeUser = null;
          if (storedUser) {
            try {
              completeUser = JSON.parse(storedUser);
              console.log('📦 Using complete user data from localStorage:', completeUser);
            } catch (e) {
              console.error('❌ Error parsing stored user:', e);
              completeUser = {
                id: payload.sub || payload.id || null,
                name: payload.name || payload.full_name || null,
                email: payload.email || null,
                user_type: payload.user_type || payload.role || null,
              };
            }
          } else {
            completeUser = {
              id: payload.sub || payload.id || null,
              name: payload.name || payload.full_name || null,
              email: payload.email || null,
              user_type: payload.user_type || payload.role || null,
            };
          }

          dispatch(
            restoreAuthState({
              user: completeUser,
              token: storedToken,
              userType: storedUserType || completeUser.user_type || null,
              slug: storedSlug || null,
            })
          );

          // Optional token verification
          if (VERIFY_ENDPOINT) {
            try {
              await api.get(VERIFY_ENDPOINT);
            } catch (err) {
              const status = err?.response?.status;
              if (status === 401 || status === 419) {
                console.log('🔒 Token verification failed, logging out');
                dispatch(logout());
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("userType");
                localStorage.removeItem("slug");
              }
            }
          }
        } else {
          console.log('⏰ Token expired, cleaning up');
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userType");
          localStorage.removeItem("slug");
          dispatch(logout());
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        dispatch(logout());
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Handle redirects after auth is initialized
  useEffect(() => {
    // Don't redirect if auth hasn't been initialized yet
    if (!authInitialized || loading || redirectHandled) {
      return;
    }
    
    console.log('🔍 Evaluating redirect logic:', {
      authInitialized,
      loading,
      isAuthenticated,
      user: user ? { ...user } : null,
      userType: user?.user_type,
      pathname,
      redirectHandled
    });

    // Skip auth checks for special routes
    const skipAuthRoutes = [
      '/control', 
      '/categerylist', 
      '/servicelist',
      '/freelancer',
      '/profileView',
    ];
    if (skipAuthRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔧 Special route detected, skipping regular auth checks');
      return;
    }

    // If not authenticated, redirect to login (except for public routes)
    if (!isAuthenticated || !user) {
      const publicRoutes = [
        "/", 
        "/Login", 
        "/register", 
        "/forgot-password",
        "/reset-password",
        "/gateway",
        "/categerylist",
        "/UsersList",
        "/job-details",
        "/job-list",
        "/complete-signup",
      ];
      if (!publicRoutes.includes(pathname)) {
        console.log('🚫 Not authenticated, redirecting to login');
        setRedirectHandled(true);
        router.replace("/Login");
        return;
      }
      // User is on a public route and not authenticated - this is fine
      return;
    }

    // User is authenticated - handle routing logic
    const loginRoutes = ["/Login", "/register"];
    if (loginRoutes.includes(pathname) && !allowOnAuth) {
      const redirectPath = getRedirectPath(user);
      console.log('🔄 Authenticated user on login page, redirecting to:', redirectPath);
      setRedirectHandled(true);
      router.replace(redirectPath);
      return;
    }

    // FIXED: Only redirect if user is specifically on a restricted path
    // Remove the aggressive redirect logic that was causing issues
    const mustRedirectPath = getMustRedirectPath(pathname, user);
    
    if (mustRedirectPath && mustRedirectPath !== pathname) {
      console.log('🔄 User must be redirected from', pathname, 'to:', mustRedirectPath);
      setRedirectHandled(true);
      router.replace(mustRedirectPath);
      return;
    }

    console.log('✅ User is allowed on current page, no redirect needed');

  }, [authInitialized, loading, isAuthenticated, user, user?.user_type, pathname, router, allowOnAuth, redirectHandled]);

  // Reset redirect handled when pathname changes (for navigation) OR when user.user_type changes
  useEffect(() => {
    console.log('🔄 Resetting redirect handler due to user_type or pathname change');
    setRedirectHandled(false);
  }, [pathname, user?.user_type]);

  // FIXED: New function that only returns a redirect path if user MUST be redirected
  const getMustRedirectPath = (currentPath, user) => {
    const userType = user?.user_type;
    
    // If user has no user_type and not on select-user-type page
    if (!userType && currentPath !== "/select-user-type") {
      return "/select-user-type";
    }                                                        
    
    // If user has user_type but is still on select-user-type page
    if (userType && currentPath === "/select-user-type") {
      return getRedirectPath(user);
    }
    
    // For freelancers - only redirect if they're definitely on the wrong path
    if (userType === "Freelancer" || userType === "freelancer") {
      const { is_status, is_regi_complete } = user;
      const completionLevel = parseInt(is_regi_complete || 0);
      
      // FIXED: Old users should not be in registration flow
      if (is_status === "old" && currentPath.startsWith("/registration")) {
        return "/freelancer-dashboard";
      }
      
      // FIXED: New users with completed registration (completionLevel === 0) should not be in registration flow
      if (is_status === "new" && completionLevel === 0 && currentPath.startsWith("/registration")) {
        return "/freelancer-dashboard";
      }
      
      // FIXED: New users with incomplete registration (completionLevel > 0) should be in registration flow
      if (is_status === "new" && completionLevel > 0 && !currentPath.startsWith("/registration") && currentPath !== "/freelancer-dashboard") {
        return "/registration/profile-setup";
      }
    }
    
    // No mandatory redirect needed
    return null;
  };

  // Get the correct redirect path for a user
  const getRedirectPath = (user) => {
    console.log('🎯 Getting redirect path for user:', user);
    
    const userType = user?.user_type;

    if (!userType) {
      return "/select-user-type";
    } 
    
    if (userType === "Freelancer" || userType === "freelancer") {
      const { is_regi_complete, is_status } = user;
      
      console.log('User registration status:', { is_status, is_regi_complete });
      
      // If user status is "old", go directly to dashboard
      if (is_status === "old") {
        return "/freelancer-dashboard";
      }
      
      // If user status is "new", check completion level
      if (is_status === "new") {
        const completionLevel = parseInt(is_regi_complete || 0);
        
        if (completionLevel === 0) {
          // Registration completed - go to dashboard
          return "/freelancer-dashboard";
        } else {
          // Registration in progress - go to profile setup
          return "/registration/profile-setup";
        }
      }
      
      // Default fallback for freelancers
      return "/registration/profile-setup";
    } 
    
    if (userType === "Customer" || userType === "customer") {
      return "/customer-dashboard";
    }
    
    // Final fallback
    return "/select-user-type";
  };

  // Show loader while auth is being initialized
  if (!authInitialized || loading) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Loader />
      </div>
    );
  }

  // Auth is initialized - render children
  return <>{children}</>;
}

export default function AuthWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "20vh",
            width: "20vw",
          }}
        >
          <Loader />
        </div>
      }
    >
      <AuthWrapperInner>{children}</AuthWrapperInner>
    </Suspense>
  );
}