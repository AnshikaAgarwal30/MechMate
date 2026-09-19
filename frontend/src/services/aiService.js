import api from './api';

export const aiService = {
  /**
   * Diagnose breakdown symptoms with optional image upload
   * @param {FormData} formData Contains description, make, model, year, and optional image
   */
  diagnose: (formData) => {
    return api.post('/ai/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default aiService;
