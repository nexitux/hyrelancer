// components/ProtectedRoute.js - SIMPLIFIED VERSION
'use client';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProtectedRoute = ({ 
  children, 
  requiredUserType, 
  showUnauthorized = false 
}) => {
  const { user, userType, isAuthenticated } = useSelector((state) => state.auth);

  // Let AuthWrapper handle all redirects - this just blocks rendering
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Only check user type if specified
  if (requiredUserType && userType !== requiredUserType) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
    // Otherwise let AuthWrapper handle the redirect
    return null;
  }

  // Render children - no redirect logic here
  return children;
};

export default ProtectedRoute;