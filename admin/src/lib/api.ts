import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginPage = window.location.pathname.includes('/login');
    const isSessionCheck = err.config?.url?.includes('/auth/me');
    if (err.response?.status === 401 && !isLoginPage && !isSessionCheck) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
