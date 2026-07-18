import axios from 'axios';
import { ElMessage } from 'element-plus';

const TOKEN_KEY = 'education_space_token';

const request = axios.create({
  baseURL: '/api',
  timeout: 12000
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    if (payload.code === 0) {
      return payload.data;
    }

    const message = payload.message || '请求失败';
    ElMessage.error(message);
    return Promise.reject(new Error(message));
  },
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || '请求失败';

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('education_space_user_info');
      localStorage.removeItem('education_space_permissions');
      localStorage.removeItem('education_space_menu_paths');
      localStorage.removeItem('education_space_menus');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    ElMessage.error(message);
    return Promise.reject(new Error(message));
  }
);

export default request;
