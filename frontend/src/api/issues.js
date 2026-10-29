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
        ? { 'Content-Type': undefined }
        : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // 3. Upvote / re-report an existing issue ("I am facing this too")
  upvote: async (issueId, data = {}) => {
    const response = await api.post(`/issues/${issueId}/reports`, data);
    return response.data;
  },

  // 4. Fetch all issues (Public Feed / List)
  getAll: async (params) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // 5. Fetch single issue details
  getById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // 6. Update issue status or assign team (Triage / Admin)
  updateStatus: async (id, status, note, assignedTeam) => {
    const payload = {};
    if (status) payload.status = status;
    if (note !== undefined) payload.resolutionNote = note;
    if (assignedTeam !== undefined) payload.assignedTeam = assignedTeam;
    const response = await api.patch(`/issues/${id}/status`, payload);
    return response.data;
  },

  // 7. Assign issue to maintenance team
  assignTeam: async (id, team, staffName, note) => {
    const payload = {
      status: 'Assigned',
      assignedTeam: team,
    };
    if (staffName) payload.assignedStaff = staffName;
    if (note) payload.resolutionNote = note;
    const response = await api.patch(`/issues/${id}/status`, payload);
    return response.data;
  },

  // 8. Fetch user's own issues (My Reports / Protected)
  getMyIssues: async (params = {}) => {
    const response = await api.get('/issues/mine', { params });
    return response.data;
  },
};

export default issuesApi;
