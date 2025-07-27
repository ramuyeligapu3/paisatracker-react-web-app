// src/api/transactionApi.js
import api from './api';

export const getTransactions = ({ userId, search = '', category = '', account = '', page = 1, limit = 10 }) =>
  api.get('/api/transactions', { params: { user_id: userId, search, category, account, page, limit } }).then(res => res.data);

export const createTransaction = (transactionData) =>
  api.post('/api/transactions', transactionData).then(res => res.data);

export const updateTransaction = (id, transactionData) =>
  api.post(`/api/transactions/${id}`, transactionData).then(res => res.data);

export const deleteTransaction = (id) =>
  api.delete(`/api/transactions/${id}`).then(res => res.data);
