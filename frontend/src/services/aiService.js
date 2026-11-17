import api from './api';

export const aiService = {
  getRecommendations: async ({ donationId, ngoId } = {}) => {
    const params = {};
    if (donationId) params.donationId = donationId;
    if (ngoId) params.ngoId = ngoId;
    const response = await api.get('/ai/recommendations', { params });
    return response.data;
  },

  getDemandPrediction: async () => {
    const response = await api.get('/ai/demand-prediction');
    return response.data;
  },

  getAiInsights: async () => {
    const response = await api.get('/ai/insights');
    return response.data;
  },
};
