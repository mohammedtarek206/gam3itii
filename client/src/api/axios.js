import axios from 'axios';

// In the unified Vercel setup, backend is ALWAYS at '/api'
const baseURL = '/api';

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

