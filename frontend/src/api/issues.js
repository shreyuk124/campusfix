import api from '../lib/axios';

export const issuesApi = {
  getAll: async (params) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },
  create: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },
};