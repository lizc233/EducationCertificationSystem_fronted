import { defineStore } from 'pinia';
import { login as loginApi, me as meApi } from '../api/auth';

const TOKEN_KEY = 'ecs_token';
const USER_KEY = 'ecs_user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }),
  actions: {
    async login(payload) {
      const res = await loginApi(payload);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    },
    async refreshMe() {
      if (!this.token) return;
      const user = await meApi();
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});
