// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ApiLoadingProvider } from './context/ApiLoadingContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ApiLoadingProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </ApiLoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
