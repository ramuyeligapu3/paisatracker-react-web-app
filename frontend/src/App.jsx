import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import TransactionPage from './pages/transactions/TransactionPage';
import Layout from './layout/Layout';  // Use Layout, not Navbar
import DashboardPage from './pages/DashboardPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        
        <Route path="transactions" element={<TransactionPage />} />
      </Route>
    </Routes>
  );
};

export default App;
