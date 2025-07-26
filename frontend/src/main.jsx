import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import this
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <AuthProvider>
    <BrowserRouter> {/* ✅ Wrap your app */}
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
