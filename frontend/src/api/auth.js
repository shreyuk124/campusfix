import api from '../lib/axios';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  verifyEmail: async (data) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },
  resendOtp: async (data) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default authApi;
