import api from './api';

export const adminService = {
  getDashboardMetrics: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  verifyUser: async (userId, verificationData) => {
    const response = await api.put(`/admin/users/${userId}/verify`, verificationData);
    return response.data;
  },

  updateUserStatus: async (userId, updates) => {
    const response = await api.put(`/admin/users/${userId}/status`, updates);
    return response.data;
  },

  getAllDonations: async (params = {}) => {
    const response = await api.get('/admin/donations', { params });
    return response.data;
  },

  getAllRequests: async (params = {}) => {
    const response = await api.get('/admin/requests', { params });
    return response.data;
  },

  getReportedDonations: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  resolveReport: async (donationId) => {
    const response = await api.put(`/admin/reports/${donationId}/resolve`);
    return response.data;
  },

  deleteDonation: async (donationId) => {
    const response = await api.delete(`/admin/donations/${donationId}`);
    return response.data;
  },
};

export const statsService = {
  getPlatformStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};
