import api from './api';

export const getClothingList = (params) => api.get('/clothing', { params }).then((r) => r.data);
export const getClothingById = (id) => api.get(`/clothing/${id}`).then((r) => r.data);

export const createClothing = (formData) =>
  api.post('/clothing', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const updateClothing = (id, formData) =>
  api.put(`/clothing/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const deleteClothing = (id) => api.delete(`/clothing/${id}`).then((r) => r.data);
