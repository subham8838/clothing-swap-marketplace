import api from './api';

export const getAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data);
export const getAdminUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const getAdminListings = (params) => api.get('/admin/listings', { params }).then((r) => r.data);
export const suspendUser = (id) => api.put(`/admin/users/${id}/suspend`).then((r) => r.data);
export const activateUser = (id) => api.put(`/admin/users/${id}/activate`).then((r) => r.data);
export const removeListing = (id) => api.delete(`/admin/listings/${id}`).then((r) => r.data);
export const restoreListing = (id) => api.put(`/admin/listings/${id}/restore`).then((r) => r.data);
export const getAdminReports = (params) => api.get('/admin/reports', { params }).then((r) => r.data);
export const resolveReport = (id, payload) => api.put(`/admin/reports/${id}`, payload).then((r) => r.data);
