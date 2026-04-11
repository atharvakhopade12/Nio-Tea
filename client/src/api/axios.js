import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on each request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nio_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nio_token');
      localStorage.removeItem('nio_user');
      // Only redirect if not already on login page or admin
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('nio_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nio_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default API;
