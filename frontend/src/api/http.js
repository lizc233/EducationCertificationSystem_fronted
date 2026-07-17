import axios from 'axios';
import { ElMessage } from 'element-plus';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const request = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

const rawRequest = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

function attachAuthHeader(config) {
  const token = localStorage.getItem('education_space_token') || localStorage.getItem('ecs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

request.interceptors.request.use(attachAuthHeader);
rawRequest.interceptors.request.use(attachAuthHeader);

request.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
      if (payload.code === 200 || payload.code === 0 || payload.code === 1) {
        return payload.data;
      }
      const message = payload.msg || payload.message || '请求失败';
      ElMessage.error(message);
      return Promise.reject(new Error(message));
    }
    return payload;
  },
  (error) => {
    const message = error?.response?.data?.msg || error?.response?.data?.message || error?.message || '请求失败';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

function pruneParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export function get(url, params = {}, config = {}) {
  return request.get(url, { params: pruneParams(params), ...config });
}

export function post(url, data = {}, config = {}) {
  return request.post(url, data, config);
}

export function put(url, data = {}, config = {}) {
  return request.put(url, data, config);
}

export function del(url, config = {}) {
  return request.delete(url, config);
}

export async function postForm(url, formData, config = {}) {
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  });
}

export async function download(url, params = {}, fallbackName = 'download.csv') {
  const response = await rawRequest.get(url, {
    params: pruneParams(params),
    responseType: 'blob'
  });
  const disposition = response.headers?.['content-disposition'] || '';
  const fileName = decodeFileName(disposition) || fallbackName;
  const blobUrl = window.URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(blobUrl);
}

export function buildApiUrl(path = '') {
  if (!path) {
    return apiBaseUrl;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (path.startsWith('/')) {
    return path;
  }
  return `${apiBaseUrl.replace(/\/$/, '')}/${path}`;
}

function decodeFileName(contentDisposition = '') {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] || '';
}

export default request;
