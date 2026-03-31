import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wrapper component for permission-based access control
 * 
 * Usage:
 * <ProtectedRoute resource="hiring" action="create">
 *   <HiringPipelineBoard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ resource, action, children, fallback = null }) {
  const { currentUser, hasPermission } = useAuth();

  // If no user is logged in, don't render
  if (!currentUser) {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="mb-2">Please log in to access this resource</p>
        </div>
      </div>
    );
  }

  // Check permission
  const canAccess = hasPermission(resource, action);

  if (!canAccess) {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600 mb-4">
            Your {currentUser.role} role doesn't have permission to {action} {resource}
          </p>
          <p className="text-sm text-gray-500">
            Contact an administrator if you think this is a mistake
          </p>
        </div>
      </div>
    );
  }

  // User has permission, render children
  return children;
}
