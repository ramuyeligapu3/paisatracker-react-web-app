import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refresh token in cookies
});

// ✅ Add Authorization header from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (cookies will be sent automatically)
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        console.log("(((((((((((((((((((res",res);

        const newAccessToken = res.data.data.accessToken;
        console.log("((((((((((((((((((newAccessToken))))))))))))))))))))",newAccessToken);
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest); // Retry the original request
        } else {
          throw new Error('No new token in refresh response');
        }
      } catch (refreshError) {
        alert("Refresh failed: " + refreshError.message);
        console.error('Refresh token failed:', refreshError);
        toast.error('Session expired. Please login again.');
        setTimeout(() => handleLogout(), 2000); // Delay for toast to show
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Centralized logout handler
const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};

// ---------- Auth APIs ----------
export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// ---------- Transaction APIs ----------
export const getTransactions = async ({
  userId,
  search = '',
  category = '',
  account = '',
  page = 1,
  limit = 10,
}) => {
  const response = await api.get('/api/transactions', {
    params: { user_id: userId, search, category, account, page, limit },
  });
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await api.post(`/api/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};

export default api;
