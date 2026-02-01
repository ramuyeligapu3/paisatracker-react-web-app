import api from './api';

export const signup = async (email, password) => {
  const res = await api.post('/auth/signup', { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post('/auth/reset-password', { token, new_password: newPassword });
  return res.data;
};
