// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import AuthForm from './AuthForm';;
import './AuthPage.css';

const AuthPage = () => {
  const [view, setView] = useState('login');
  return (
    <div className="auth-page">
      <main className="auth-page-main">
        <AuthForm view={view} onSwitchView={setView} />
      </main>
    </div>
  );
};

export default AuthPage;
