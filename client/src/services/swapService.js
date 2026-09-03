import api from './api';

export const createSwapRequest = (payload) => api.post('/swaps', payload).then((r) => r.data);
export const getMySwaps = (params) => api.get('/swaps', { params }).then((r) => r.data);
export const getSwapById = (id) => api.get(`/swaps/${id}`).then((r) => r.data);
export const acceptSwap = (id) => api.put(`/swaps/${id}/accept`).then((r) => r.data);
export const rejectSwap = (id) => api.put(`/swaps/${id}/reject`).then((r) => r.data);
export const cancelSwap = (id) => api.put(`/swaps/${id}/cancel`).then((r) => r.data);
export const completeSwap = (id) => api.put(`/swaps/${id}/complete`).then((r) => r.data);
export const createProposal = (id, payload) => api.post(`/swaps/${id}/proposals`, payload).then((r) => r.data);
export const getMessages = (id) => api.get(`/swaps/${id}/messages`).then((r) => r.data);
export const sendMessage = (id, payload) => api.post(`/swaps/${id}/messages`, payload).then((r) => r.data);
export const createReview = (id, payload) => api.post(`/swaps/${id}/reviews`, payload).then((r) => r.data);
