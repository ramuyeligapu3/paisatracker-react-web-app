// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader/Loader';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader message="Loading your account..." fullScreen />;

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
