import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to role-appropriate default page
    const defaultRoutes = { admin: '/dashboard', cashier: '/pos', kitchen: '/kitchen' };
    return <Navigate to={defaultRoutes[user.role] || '/pos'} replace />;
  }

  return children;
}
