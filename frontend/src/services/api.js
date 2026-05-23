import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API client error:', error);
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
