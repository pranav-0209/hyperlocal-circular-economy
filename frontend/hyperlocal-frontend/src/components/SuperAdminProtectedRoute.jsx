import { Navigate } from 'react-router-dom';

/**
 * SuperAdminProtectedRoute Component
 * Protects admin routes - redirects to admin login if not authenticated
 */
export default function SuperAdminProtectedRoute({ children }) {
  // Check for admin token
  const adminToken = localStorage.getItem('adminToken');
  
  // In real app, also verify token validity and role from backend
  // For now, just check if token exists
  if (!adminToken) {
    return <Navigate to="/superadmin/login" replace />;
  }

  return children;
}
