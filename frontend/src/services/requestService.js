import api from './api';

export const requestService = {
  createRequest: (data) => api.post('/requests', data),
  getRequests: () => api.get('/requests'),
  getRequestById: (id) => api.get(`/requests/${id}`),
  getAvailableRequests: () => api.get('/requests/available'),
  acceptRequest: (id, data) => api.put(`/requests/${id}/accept`, data),
  updateRequestStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  cancelRequest: (id) => api.put(`/requests/${id}/cancel`),
  getAllRequests: () => api.get('/requests/all')
};
