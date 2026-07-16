import { defineStore } from 'pinia';
import { login, me } from '../api/auth';

const TK = 'ecs_token';
const UK = 'ecs_user';
const RK = 'ecs_user_role';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TK) || '',
    user: JSON.parse(localStorage.getItem(UK) || 'null')
  }),
  getters: {
    role: (s) => s.user?.role || '',
    isAdmin: (s) => s.user?.role === 'admin'
  },
  actions: {
    async doLogin(form) {
      const res = await login(form);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem(TK, res.token);
      localStorage.setItem(UK, JSON.stringify(res.user));
      localStorage.setItem(RK, res.user.role || '');
    },
    async getMe() {
      if (!this.token) return;
      const u = await me();
      this.user = u;
      localStorage.setItem(UK, JSON.stringify(u));
      localStorage.setItem(RK, u.role || '');
    },
    can(roles = []) {
      if (!roles.length) return true;
      return roles.includes(this.user?.role);
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem(TK);
      localStorage.removeItem(UK);
      localStorage.removeItem(RK);
    }
  }
});
