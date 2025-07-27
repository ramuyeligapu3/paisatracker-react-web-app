import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import TransactionPage from './pages/transactions/TransactionPage';
import Layout from './layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LogoutPage from './pages/LogoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user } = useAuth();

  return (
    <>
      {/* ✅ ToastContainer must be outside Routes */}
      <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>
      </Route>
    </Routes>

    </>
  );
};

export default App;
