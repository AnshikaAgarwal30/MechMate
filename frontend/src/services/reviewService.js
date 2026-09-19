import api from './api';

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (params) => api.get('/reviews', { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  respondToReview: (id, data) => api.put(`/reviews/${id}/respond`, data),
  getAllReviews: () => api.get('/reviews/all'),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};
