import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'staff') {
      return <Navigate to="/staff" replace />;
    }
    return <Navigate to="/feed" replace />;
  }

  return children;
}
