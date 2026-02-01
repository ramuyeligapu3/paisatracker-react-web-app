import api from './api';

export const getGoals = async () => {
  const res = await api.get('/api/goals');
  return res.data;
};

export const createGoal = async (data) => {
  const res = await api.post('/api/goals', data);
  return res.data;
};

export const updateGoal = async (id, data) => {
  const res = await api.patch(`/api/goals/${id}`, data);
  return res.data;
};

export const deleteGoal = async (id) => {
  const res = await api.delete(`/api/goals/${id}`);
  return res.data;
};
