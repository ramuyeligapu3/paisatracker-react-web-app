export const getAccessToken = () => localStorage.getItem('accessToken');
export const setAccessToken = (token) => localStorage.setItem('accessToken', token);
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
};
