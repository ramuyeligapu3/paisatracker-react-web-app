import api from './api';

export const getTransactions = async ({
  userId,
  search = '',
  category = '',
  account = '',
  page = 1,
  limit = 10,
}) => {
  const res = await api.get('/api/transactions', {
    params: {
      user_id: userId,
      search,
      category,
      account,
      page,
      limit,
    },
  });
  return res.data;
};

export const createTransaction = async (transactionData) => {
  const res = await api.post('/api/transactions', transactionData);
  return res.data;
};

export const updateTransaction = async (id, transactionData) => {
  const res = await api.post(`/api/transactions/${id}`, transactionData);
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await api.delete(`/api/transactions/${id}`);
  return res.data;
};

export const getMonthlySummary = async (userId) => {
  const res = await api.get(
    `/api/transactions/monthly_summary/${userId}`
  );
  return res.data;
};
