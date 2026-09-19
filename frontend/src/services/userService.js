import api from './api';

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  addVehicle: (data) => api.post('/users/vehicles', data),
  getMechanics: () => api.get('/users/mechanics'),
  getNearbyMechanics: (params) => api.get('/users/mechanics/nearby', { params }),
  approveMechanic: (id) => api.put(`/users/mechanics/${id}/approve`),
  getAllUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`)
};
