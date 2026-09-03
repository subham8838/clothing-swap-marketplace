import api from './api';

export const getUserProfile = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const updateUserProfile = (id, formData) =>
  api.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const getUserSwaps = (id, params) => api.get(`/users/${id}/swaps`, { params }).then((r) => r.data);
export const getDashboard = () => api.get('/users/me/dashboard').then((r) => r.data);
