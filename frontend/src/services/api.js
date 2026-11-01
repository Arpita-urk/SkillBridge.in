import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });
api.interceptors.response.use((r) => r, (err) => {
  const url = err.config?.url || '';
  if (err.response?.status === 401 && !url.startsWith('/auth/')) window.dispatchEvent(new Event('sb:unauthorized'));
  return Promise.reject(err);
});
export const errMsg = (e) => e.response?.data?.message || 'Network hiccup. Check your connection and retry';
export default api;
