import { defineStore } from 'pinia';
import request from '../utils/request';

const TOKEN_KEY = 'education_space_token';
const USER_INFO_KEY = 'education_space_user_info';
const PERMISSIONS_KEY = 'education_space_permissions';

export const ROLE_LABEL_MAP = {
  ROLE_SUPER_ADMIN: '超级管理员',
  ROLE_TEACHER: '教学老师',
  ROLE_STUDENT: '学生'
};

const MOCK_USERS = {
  admin: {
    id: 1,
    username: 'admin',
    realName: '张老师',
    role: 'ROLE_SUPER_ADMIN',
    department: '教务处',
    phone: '13800000001',
    email: 'admin@school.edu',
    status: 1
  },
  teacher: {
    id: 2,
    username: 'teacher',
    realName: '李老师',
    role: 'ROLE_TEACHER',
    department: '计算机学院',
    phone: '13800000002',
    email: 'teacher@school.edu',
    status: 1
  },
  student: {
    id: 3,
    username: 'student',
    realName: '王同学',
    role: 'ROLE_STUDENT',
    department: '计算机学院',
    phone: '13800000003',
    email: 'student@school.edu',
    status: 1
  }
};

const ROLE_PERMISSION_MAP = {
  ROLE_SUPER_ADMIN: ['dashboard:view', 'page:*'],
  ROLE_TEACHER: ['dashboard:view', 'page:*'],
  ROLE_STUDENT: ['dashboard:view', 'page:*']
};

function createDefaultUserInfo() {
  return {
    id: null,
    username: '',
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
    async login(username, password, captcha) {
      await sleep();

      if (!captcha) {
        throw new Error('请输入验证码');
      }

      const normalizedUsername = String(username || '').trim();
      const currentUser = MOCK_USERS[normalizedUsername];

      if (!currentUser || password !== '123456') {
        throw new Error('用户名或密码错误');
      }

      const response = await request.post(
        '/auth/login',
        {
          username: normalizedUsername,
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

      const currentUser = MOCK_USERS[this.userInfo.username] || MOCK_USERS.admin;
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
