// AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../apis/api';  // Your axios instance with interceptors
import { setAccessToken, clearAuthData } from '../utils/authUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // you can change to an object if needed
  const [accessToken, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user/token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser) setUser(storedUser);
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  // Silent refresh timer
  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const { exp } = jwtDecode(accessToken);
    const expiresInMs = exp * 1000 - Date.now();
    const refreshTime = expiresInMs - 60000; // refresh 1 minute before expiry

    if (refreshTime <= 0) {
      logout(); // token already expired, logout immediately
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // call your refresh endpoint via axios instance (which has baseURL + withCredentials)
        const res = await api.post('/auth/refresh');
        const newToken = res.data.data.accessToken;

        if (!newToken) {
          logout();
          return;
        }

        if (isMounted) {
          setToken(newToken);
          setAccessToken(newToken);
        }
      } catch (error) {
        logout();
      }
    }, refreshTime);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [accessToken]);

  // login function
  const login = (userId, token) => {
    setUser(userId);
    setToken(token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', token);
  };

  // logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthData();
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy consumption of AuthContext
export const useAuth = () => useContext(AuthContext);
