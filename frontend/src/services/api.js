import axios from 'axios';

// VITE_API_URL must be set in .env.local for development
// and as a Vercel environment variable for production.
// Example: VITE_API_URL=https://mi-backend.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API client error:', error);
    
    // Auto logout on 401 Unauthorized
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      // Reload page to redirect to login
      window.location.href = '/';
    }
    
    const message = error.response?.data || error.message || 'Error processing request';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

const api = {
  async get(endpoint, params = {}) {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  async post(endpoint, data = {}) {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  async put(endpoint, data = {}) {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  },

  async delete(endpoint) {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },
};

export default api;
