import axios from 'axios';
import { ElMessage } from 'element-plus';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const req = axios.create({
  baseURL: apiBaseUrl,
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

export function postForm(url, formData, cfg = {}) {
  return req.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...cfg
  });
}

export function buildApiUrl(path, params) {
  const rawPath = String(path || '');
  const resolvedPath = /^https?:\/\//i.test(rawPath)
    ? rawPath
    : rawPath.startsWith('/api') || rawPath.startsWith('/notice')
      ? rawPath
      : `${apiBaseUrl}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.append(key, String(value));
  });

  return query.size ? `${resolvedPath}?${query.toString()}` : resolvedPath;
}

export async function download(url, params, fileName, cfg = {}) {
  const response = await req.get(url, {
    params,
    responseType: 'blob',
    ...cfg
  });
  const blob = response instanceof Blob ? response : new Blob([response]);
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);

  return blob;
}

export default req;

