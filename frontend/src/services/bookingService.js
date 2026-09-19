import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getAllBookings: () => api.get('/bookings/all')
};
