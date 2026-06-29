import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '';
// Ensure baseURL ends with /api to match the backend route setup
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = baseURL.replace(/\/+$/, '') + '/api';
}

const API = axios.create({
  baseURL: baseURL,
  timeout: 15000,
});

// Attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bikeservice_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bikeservice_token');
      localStorage.removeItem('bikeservice_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
