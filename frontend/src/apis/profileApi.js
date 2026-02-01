import api from './api';

export const getProfile = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.patch('/auth/profile', data);
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.patch('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return res.data;
};
