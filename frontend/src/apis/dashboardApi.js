import api from './api';

export const getMonthlySummary = async (
  userId,
  month = null,
  year = null
) => {
  const params = {};
  if (month != null && month !== '') params.month = Number(month);
  if (year != null && year !== '') params.year = Number(year);

  const res = await api.get(
    `/api/transactions/monthly_summary/${userId}`,
    { params }
  );
  return res.data;
};

export const getCategoryDistribution = async (
  userId,
  month = null,
  year = null
) => {
  const params = {};
  if (month != null && month !== '') params.month = Number(month);
  if (year != null && year !== '') params.year = Number(year);

  const res = await api.get(
    `/api/transactions/category_distribution/${userId}`,
    { params }
  );
  return res.data;
};

export const sendMonthlySummaryEmail = async (month = null, year = null) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const res = await api.post('/api/send-monthly-summary', null, { params });
  return res.data;
};
