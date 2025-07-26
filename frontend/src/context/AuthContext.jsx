import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ Add loading state

  useEffect(() => {
    const saved = localStorage.getItem("userId");
    const saveToken = localStorage.getItem("accessToken");
    if (saved) setUser(saved);
    if (saveToken) setAccessToken(saveToken);
    setLoading(false); // ⬅️ Done checking localStorage
  }, []);

  const login = (userId,accessToken) => {
    setUser(userId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("accessToken", accessToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
