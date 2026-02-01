import api from './api';

export const getBudgets = async (month = null, year = null) => {
  const params = {};
  if (month != null && month !== '') params.month = Number(month);
  if (year != null && year !== '') params.year = Number(year);
  const res = await api.get('/api/budgets', { params });
  return res.data;
};

export const setBudget = async (category, month, year, amount) => {
  const res = await api.put('/api/budgets', { category, month, year, amount });
  return res.data;
};
