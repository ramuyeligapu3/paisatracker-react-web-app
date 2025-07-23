import axios from 'axios';

const BASE_URL = 'https:///paisaatracker.onrender.com'; // Change for production
// const BASE_URL = 'http://localhost:8000'; // Change for production

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Auth APIs ----------

// Signup
export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

// Login
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// ---------- Transaction APIs ----------

// Get all transactions with filters & pagination
export const getTransactions = async ({
  userId,
  search = '',
  category = '',
  account = '',
  page = 1,
  limit = 10,
}) => {
  const response = await api.get('/api/transactions', {
    params: {
      user_id: userId,
      search,
      category,
      account,
      page,
      limit,
    },
  });
  return response.data;
};

// Create a transaction
export const createTransaction = async (transactionData) => {
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

// Update a transaction
export const updateTransaction = async (id, transactionData) => {
  const response = await api.post(`/api/transactions/${id}`, transactionData);
  return response.data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};

export default api;
