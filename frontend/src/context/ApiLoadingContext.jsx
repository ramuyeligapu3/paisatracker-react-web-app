// frontend/src/context/ApiLoadingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { addApiLoadingListener } from '../utils/apiLoading';
import Loader from '../components/Loader/Loader';

const ApiLoadingContext = createContext();

export const ApiLoadingProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const loading = count > 0;

  useEffect(() => {
    const unsubscribe = addApiLoadingListener((delta) => {
      setCount((c) => Math.max(0, c + delta));
    });
    return unsubscribe;
  }, []);

  return (
    <ApiLoadingContext.Provider value={{ loading, count }}>
      {children}
      {loading && <Loader message="Loading..." fullScreen />}
    </ApiLoadingContext.Provider>
  );
};

export const useApiLoading = () => useContext(ApiLoadingContext);
