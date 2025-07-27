// src/api/transactionApi.js
import api from './api';

export const getMonthlySummary = (userId) =>
  api.get(`/api/transactions/monthly_summary/${userId}`).then(res => res.data);

export const getCategoryDistribution = (userId) =>
  api.get(`/api/transactions/category_distribution/${userId}`).then(res => res.data);
