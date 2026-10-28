import axios from 'axios';

/**
 * CampusFix Axios HTTP Client
 * 
 * Configured with base URL and automatic token attachment.
 * Written cleanly so any developer can understand the flow.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60-second timeout to accommodate Render free-tier cold starts
});

/**
 * Request Interceptor
 * Runs before every request sent to the server.
 */
api.interceptors.request.use(
  (config) => {
    // 1. Attach JWT token if the user is currently logged in
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. If sending FormData (e.g., photos), let the browser set the boundary header automatically
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Runs when the server returns a response or error.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Note: We do NOT delete the token on temporary 401s to prevent 
    // accidental logouts on mobile tab reloads. The user is only logged
    // out when they explicitly click "Log Out".
    return Promise.reject(error);
  }
);

export default api;
