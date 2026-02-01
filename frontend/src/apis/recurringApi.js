import api from './api';

export const getRecurring = async () => {
  const res = await api.get('/api/recurring');
  return res.data;
};

export const createRecurring = async (data) => {
  const res = await api.post('/api/recurring', data);
  return res.data;
};

export const updateRecurring = async (id, data) => {
  const res = await api.patch(`/api/recurring/${id}`, data);
  return res.data;
};

export const deleteRecurring = async (id) => {
  const res = await api.delete(`/api/recurring/${id}`);
  return res.data;
};
