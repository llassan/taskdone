import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { lang } = useParams();
  const prefix = `/${lang || 'en'}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!user) return <Navigate to={`${prefix}/login`} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={prefix} />;
  return children;
}
