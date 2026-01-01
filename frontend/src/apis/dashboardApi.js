// src/api/transactionApi.js
import api from './api';

export const getMonthlySummary = (userId, month = null, year = null) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get(`/api/transactions/monthly_summary/${userId}`, { params }).then(res => res.data);
};

export const getCategoryDistribution = (userId, month = null, year = null) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get(`/api/transactions/category_distribution/${userId}`, { params }).then(res => res.data);
};
