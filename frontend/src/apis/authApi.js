import api from './api';

export const signup = (email, password) => 
  api.post('/auth/signup', { email, password }).then(res => res.data);

export const login = (email, password) => 
  api.post('/auth/login', { email, password }).then(res => res.data);

export const forgotPassword = (email) => 
  api.post('/auth/forgot-password', { email }).then(res => res.data);
