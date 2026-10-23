import api from '../lib/axios';

export const issuesApi = {
  // 1. Live duplicate check: Search open issues by location and category
  getSimilar: async ({ buildingId, categoryId }) => {
    const response = await api.get('/issues/similar', {
      params: { buildingId, categoryId },
    });
    return response.data;
  },

  // 2. Submit new issue with 1-3 photo evidence files (multipart/form-data)
  create: async (formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const response = await api.post('/issues', formData, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // 3. Upvote / re-report an existing issue ("I am facing this too")
  upvote: async (issueId, data = {}) => {
    const response = await api.post(`/issues/${issueId}/reports`, data);
    return response.data;
  },

  // 4. Fetch all issues (Feed / List)
  getAll: async (params) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // 5. Fetch single issue details
  getById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // 6. Update issue status (Triage / Admin)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },
};

export default issuesApi;
