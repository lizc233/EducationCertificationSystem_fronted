import axios from 'axios';
import { ElMessage } from 'element-plus';

const req = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12000
});

req.interceptors.request.use((cfg) => {
  const tk = localStorage.getItem('ecs_token') || localStorage.getItem('education_space_token');
  if (tk) cfg.headers.Authorization = `Bearer ${tk}`;
  return cfg;
});

req.interceptors.response.use(
  (res) => {
    const d = res.data;
    if (d && typeof d === 'object' && Object.prototype.hasOwnProperty.call(d, 'code')) {
      if (d.code === 1 || d.code === 200) return d.data ?? d;
      if (!res.config?.skipErrorMessage) ElMessage.error(d.msg || d.message || 'Request failed');
      return Promise.reject(d);
    }
    return d;
  },
  (err) => {
    if (!err?.config?.skipErrorMessage) ElMessage.error(err?.response?.data?.msg || err.message || 'Request failed');
    return Promise.reject(err);
  }
);

export function get(url, params, cfg = {}) {
  return req.get(url, { params, ...cfg });
}

export function post(url, data, cfg = {}) {
  return req.post(url, data, cfg);
}

export function put(url, data, cfg = {}) {
  return req.put(url, data, cfg);
}

export function del(url, cfg = {}) {
  return req.delete(url, cfg);
}

export default req;

