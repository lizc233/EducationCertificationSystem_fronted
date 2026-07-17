import { defineStore } from 'pinia';
import request from '../utils/request';
import {
  ROLE_LABEL_MAP,
  getUserById,
  resolveLoginUser
} from '../data/users';

export { ROLE_LABEL_MAP };

const TOKEN_KEY = 'education_space_token';
const USER_INFO_KEY = 'education_space_user_info';
const PERMISSIONS_KEY = 'education_space_permissions';

const ROLE_PERMISSION_MAP = {
  ROLE_SUPER_ADMIN: ['dashboard:view', 'page:*'],
  ROLE_TEACHER: ['dashboard:view', 'page:*'],
  ROLE_STUDENT: ['dashboard:view', 'page:*']
};

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

function persistUserState(token, userInfo, permissions) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
}

function sleep(duration = 300) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    userInfo: cloneUserInfo(readStorageJSON(USER_INFO_KEY, createDefaultUserInfo())),
    permissions: readStorageJSON(PERMISSIONS_KEY, [])
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isSuperAdmin: (state) => state.userInfo.role === 'ROLE_SUPER_ADMIN',
    isTeacher: (state) => state.userInfo.role === 'ROLE_TEACHER',
    isStudent: (state) => state.userInfo.role === 'ROLE_STUDENT'
  },
  actions: {
    async login(account, password, captcha) {
      await sleep();

      if (!captcha) {
        throw new Error('请输入验证码');
      }

      const normalizedAccount = String(account || '').trim();
      const currentUser = resolveLoginUser(normalizedAccount);

      if (!currentUser) {
        throw new Error('账号或密码错误');
      }

      if (currentUser.status !== 1) {
        throw new Error('当前账号已被停用，请联系管理员');
      }

      if (password !== currentUser.password) {
        throw new Error('账号或密码错误');
      }

      const response = await request.post(
        '/auth/login',
        {
          account: normalizedAccount,
          password,
          captcha
        },
        {
          mockData: {
            token: `mock-token-${currentUser.id}`,
            userInfo: cloneUserInfo(currentUser),
            permissions: [...(ROLE_PERMISSION_MAP[currentUser.role] || [])]
          }
        }
      );

      if (response.code !== 0) {
        throw new Error(response.message || '登录失败');
      }

      this.token = response.data.token;
      this.userInfo = cloneUserInfo(response.data.userInfo);
      this.permissions = [...response.data.permissions];
      persistUserState(this.token, this.userInfo, this.permissions);

      return this.userInfo;
    },
    async getUserInfo() {
      if (!this.token) {
        return null;
      }

      const currentUser = getUserById(this.userInfo.id);
      if (!currentUser) {
        throw new Error('用户不存在或已被删除');
      }

      const response = await request.get('/user/me', {
        mockData: {
          userInfo: cloneUserInfo(currentUser),
          permissions: [...(ROLE_PERMISSION_MAP[currentUser.role] || [])]
        }
      });

      if (response.code !== 0) {
        throw new Error(response.message || '获取用户信息失败');
      }

      this.userInfo = cloneUserInfo(response.data.userInfo);
      this.permissions = [...response.data.permissions];
      persistUserState(this.token, this.userInfo, this.permissions);

      return this.userInfo;
    },
    logout() {
      this.token = null;
      this.userInfo = createDefaultUserInfo();
      this.permissions = [];
      persistUserState(this.token, this.userInfo, this.permissions);
    }
  }
});
