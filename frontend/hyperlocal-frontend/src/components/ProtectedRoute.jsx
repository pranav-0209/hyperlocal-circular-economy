import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * VerificationRequiredRoute: Redirects to /verify/profile if user is not verified
 */
export function VerificationRequiredRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify/profile" replace />;
  }

  return children;
}

/**
 * AdminRoute: Restricts access to ADMIN and SUPERADMIN roles only
 */
export function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
