import React from 'react';
import { Routes, Route,Navigate  } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import TransactionPage from './pages/transactions/TransactionPage';
import Layout from './layout/Layout';  // Use Layout, not Navbar
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';



const App = () => {
  const { user } = useAuth(); //
  return (
    <Routes>
       <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={  
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>}>

        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionPage />} />

      </Route>
    </Routes>
  );
};

export default App;
