// frontend/src/services/mechanicService.js
// Service to fetch recommended mechanics for map visualization.
import api from './api';

/**
 * Get recommended mechanics based on location and issue type.
 * @param {Object} params - { longitude, latitude, issueType, maxResults }
 * @returns {Promise} resolves to { mechanics, customerLocation }
 */
export const getRecommendedMechanics = async ({ longitude, latitude, issueType, maxResults = 20 }) => {
  const response = await api.get('/users/mechanics/recommend', {
    params: { longitude, latitude, issueType, maxResults }
  });
  return response.data;
};

export default { getRecommendedMechanics };
