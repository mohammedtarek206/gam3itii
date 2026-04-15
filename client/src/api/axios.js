import axios from 'axios';

// In production (Vercel), use the deployed backend URL from env variable.
// In development, use the Vite proxy (baseURL = '/api').
const baseURL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
  : '/api';

const api = axios.create({ 
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('🌐 API Error:', err.config?.url, err.response?.status, err.message);
    return Promise.reject(err.response?.data || { message: 'Network Error: التحقق من اتصال الخادم' });
  }
);

export default api;

