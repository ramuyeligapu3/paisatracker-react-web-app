import axios from 'axios';
import { toast } from 'react-toastify';
import { getAccessToken, setAccessToken, clearAuthData } from '../utils/authUtils';

const BASE_URL = 'https://paisaatracker.onrender.com/';
// const BASE_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Refresh lock & queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Push promise to queue and wait for refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;

        if (!newToken) throw new Error('No new token returned');

        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthData();
        toast.error('Session expired. Please login again.');
        // Optionally emit event or call logout from context via a callback here
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
