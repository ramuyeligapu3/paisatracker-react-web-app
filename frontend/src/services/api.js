import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = "https://paisaatracker.onrender.com/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ✅ Add Authorization header from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No new token in refresh response');
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        toast.error('Session expired. Please login again.');
        setTimeout(handleLogout, 2000);
      }
    }
    return Promise.reject(error);
  }
);

const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};

// ---------- Auth APIs ----------
export const signup = (email, password) => api.post('/auth/signup', { email, password }).then(res => res.data);
export const login = (email, password) => api.post('/auth/login', { email, password }).then(res => res.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then(res => res.data);

// ---------- Transaction APIs ----------
export const getTransactions = ({ userId, search = '', category = '', account = '', page = 1, limit = 10 }) =>
  api.get('/api/transactions', { params: { user_id: userId, search, category, account, page, limit } }).then(res => res.data);

export const createTransaction = (transactionData) => api.post('/api/transactions', transactionData).then(res => res.data);
export const updateTransaction = (id, transactionData) => api.post(`/api/transactions/${id}`, transactionData).then(res => res.data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`).then(res => res.data);

export default api;
