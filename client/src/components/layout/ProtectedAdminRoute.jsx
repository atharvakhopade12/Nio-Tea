import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading } = useAdmin();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-nio-cream">
      <div className="loader"></div>
    </div>
  );
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}
