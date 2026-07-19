import { defineStore } from 'pinia';
import request from '../utils/request';

export const ROLE_LABEL_MAP = {
  ROLE_SUPER_ADMIN: '管理员',
  ROLE_TEACHER: '教师',
  ROLE_STUDENT: '学生'
};

const TOKEN_KEY = 'education_space_token';
const USER_INFO_KEY = 'education_space_user_info';
const PERMISSIONS_KEY = 'education_space_permissions';
const MENU_PATHS_KEY = 'education_space_menu_paths';
const MENUS_KEY = 'education_space_menus';

function createDefaultUserInfo() {
  return {
    id: null,
    accountId: '',
    realName: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    status: 0
  };
}

function cloneUserInfo(userInfo = {}) {
  return {
    ...createDefaultUserInfo(),
    ...userInfo
  };
}

function readStorageJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function persistUserState(token, userInfo, permissions, menuPaths, menus) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    localStorage.setItem(MENU_PATHS_KEY, JSON.stringify(menuPaths || []));
    localStorage.setItem(MENUS_KEY, JSON.stringify(menus || []));
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  localStorage.removeItem(MENU_PATHS_KEY);
  localStorage.removeItem(MENUS_KEY);
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    userInfo: cloneUserInfo(readStorageJSON(USER_INFO_KEY, createDefaultUserInfo())),
    permissions: readStorageJSON(PERMISSIONS_KEY, []),
    menuPaths: readStorageJSON(MENU_PATHS_KEY, []),
    menus: readStorageJSON(MENUS_KEY, [])
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isSuperAdmin: (state) => state.userInfo.role === 'ROLE_SUPER_ADMIN',
    isTeacher: (state) => state.userInfo.role === 'ROLE_TEACHER',
    isStudent: (state) => state.userInfo.role === 'ROLE_STUDENT'
  },
  actions: {
    setAuthState(token, userInfo, permissions, menuPaths = [], menus = []) {
      this.token = token;
      this.userInfo = cloneUserInfo(userInfo);
      this.permissions = [...(permissions || [])];
      this.menuPaths = [...(menuPaths || [])];
      this.menus = [...(menus || [])];
      persistUserState(this.token, this.userInfo, this.permissions, this.menuPaths, this.menus);
    },
    clearAuthState() {
      this.token = null;
      this.userInfo = createDefaultUserInfo();
      this.permissions = [];
      this.menuPaths = [];
      this.menus = [];
      persistUserState(this.token, this.userInfo, this.permissions, this.menuPaths, this.menus);
    },
    async login(account, password, captcha) {
      if (!captcha) {
        throw new Error('请输入验证码');
      }

      const payload = await request.post('/auth/login', {
        account: String(account || '').trim(),
        password,
        captcha
      });

      this.setAuthState(payload.token, payload.userInfo, payload.permissions, payload.menuPaths, payload.menus);
      return this.userInfo;
    },
    async getUserInfo() {
      if (!this.token) {
        return null;
      }

      const payload = await request.get('/user/me');
      this.setAuthState(this.token, payload.userInfo, payload.permissions, payload.menuPaths, payload.menus);
      return this.userInfo;
    },
    async logout() {
      const token = this.token;
      this.clearAuthState();
      try {
        if (token) {
          await request.post(
            '/auth/logout',
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
      } catch {
        // Ignore logout failures because local auth state is already cleared.
      }
    }
  }
});
