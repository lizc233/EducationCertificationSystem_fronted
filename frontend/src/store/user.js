import { defineStore } from 'pinia';
import { getVisibleNavGroups, navs, ROLES } from '../data/navigation';
import request from '../utils/request';

export const ROLE_LABEL_MAP = {
<<<<<<< HEAD
  ROLE_SUPER_ADMIN: '管理员',
  ROLE_TEACHER: '教师',
  ROLE_STUDENT: '学生'
=======
  [ROLES.SUPER]: '管理员',
  [ROLES.TEACHER]: '老师',
  [ROLES.STUDENT]: '学生'
>>>>>>> 4a300da7d2fbf6345784db74d6f79b3c7114bbd0
};

const TOKEN_KEY = 'education_space_token';
const USER_INFO_KEY = 'education_space_user_info';
const PERMISSIONS_KEY = 'education_space_permissions';
const MENU_PATHS_KEY = 'education_space_menu_paths';
const MENUS_KEY = 'education_space_menus';
const ECS_TOKEN_KEY = 'ecs_token';
const LOCAL_TOKEN_PREFIX = 'mock-token-';
const LOCAL_PASSWORD = '123456';

const LOCAL_USERS = [
  {
    id: 1,
    accountId: 'A2026001',
    realName: '系统管理员',
    role: ROLES.SUPER,
    department: '认证中心',
    phone: '13800000001',
    email: 'admin@example.com',
    status: 1,
    aliases: ['admin', 'a2026001', '13800000001', 'admin@example.com']
  },
  {
    id: 2,
    accountId: 'T2026001',
    realName: '张敏',
    role: ROLES.TEACHER,
    department: '计算机学院',
    phone: '13800000002',
    email: 'teacher@example.com',
    status: 1,
    aliases: ['teacher', 't2026001', '13800000002', 'teacher@example.com']
  },
  {
    id: 3,
    accountId: 'S2026001',
    realName: '李晨',
    role: ROLES.STUDENT,
    department: '计算机学院',
    phone: '13800000003',
    email: 'student@example.com',
    status: 1,
    aliases: ['student', 's2026001', '13800000003', 'student@example.com']
  }
];

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
    localStorage.setItem(ECS_TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    localStorage.setItem(MENU_PATHS_KEY, JSON.stringify(menuPaths || []));
    localStorage.setItem(MENUS_KEY, JSON.stringify(menus || []));
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ECS_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  localStorage.removeItem(MENU_PATHS_KEY);
  localStorage.removeItem(MENUS_KEY);
}

function normalizeAccount(account) {
  return String(account || '').trim().toLowerCase();
}

function isLocalMockToken(token) {
  return String(token || '').startsWith(LOCAL_TOKEN_PREFIX);
}

function buildMenuPaths(role) {
  return [...new Set(
    navs
      .filter((item) => item.path && item.roles.includes(role))
      .map((item) => item.path)
  )];
}

function buildMenus(role, menuPaths) {
  return getVisibleNavGroups(role, menuPaths).map((group) => ({
    label: group.label,
    defaultPath: group.defaultPath,
    items: group.items.map((item) => ({
      key: item.key,
      path: item.path,
      label: item.label,
      summary: item.summary
    }))
  }));
}

function buildPermissions(menuPaths) {
  return menuPaths.map((path) => `page:${path}`);
}

function findLocalUser(account) {
  const normalized = normalizeAccount(account);
  return LOCAL_USERS.find((item) => (
    normalizeAccount(item.accountId) === normalized || item.aliases.includes(normalized)
  )) || null;
}

function buildLocalAuthPayload(account) {
  const user = findLocalUser(account);
  if (!user) {
    return null;
  }

  const userInfo = cloneUserInfo(user);
  const menuPaths = buildMenuPaths(userInfo.role);
  const menus = buildMenus(userInfo.role, menuPaths);
  const permissions = buildPermissions(menuPaths);

  return {
    token: `${LOCAL_TOKEN_PREFIX}${userInfo.role}-${userInfo.id}`,
    userInfo,
    permissions,
    menuPaths,
    menus
  };
}

function resolveLocalUserInfoByState(userInfo, token) {
  if (userInfo?.accountId) {
    const fromAccount = findLocalUser(userInfo.accountId);
    if (fromAccount) {
      return cloneUserInfo(fromAccount);
    }
  }

  const matchedRole = LOCAL_USERS.find((item) => token?.includes(item.role));
  return matchedRole ? cloneUserInfo(matchedRole) : null;
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
    isSuperAdmin: (state) => state.userInfo.role === ROLES.SUPER,
    isTeacher: (state) => state.userInfo.role === ROLES.TEACHER,
    isStudent: (state) => state.userInfo.role === ROLES.STUDENT
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

      const trimmedAccount = String(account || '').trim();
      try {
        const payload = await request.post('/auth/login', {
          account: trimmedAccount,
          password,
          captcha
        }, {
          skipErrorMessage: true
        });

        this.setAuthState(payload.token, payload.userInfo, payload.permissions, payload.menuPaths, payload.menus);
        return this.userInfo;
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404) {
          throw new Error(error?.response?.data?.msg || error?.response?.data?.message || error?.message || '登录失败');
        }
      }

      if (password !== LOCAL_PASSWORD) {
        throw new Error('账号或密码错误');
      }

      const payload = buildLocalAuthPayload(trimmedAccount);
      if (!payload) {
        throw new Error('账号不存在');
      }

      this.setAuthState(payload.token, payload.userInfo, payload.permissions, payload.menuPaths, payload.menus);
      return this.userInfo;
    },
    async getUserInfo() {
      if (!this.token) {
        return null;
      }

      if (isLocalMockToken(this.token)) {
        const localUserInfo = resolveLocalUserInfoByState(this.userInfo, this.token);
        if (!localUserInfo) {
          this.clearAuthState();
          return null;
        }
        const menuPaths = buildMenuPaths(localUserInfo.role);
        const menus = buildMenus(localUserInfo.role, menuPaths);
        const permissions = buildPermissions(menuPaths);
        this.setAuthState(this.token, localUserInfo, permissions, menuPaths, menus);
        return this.userInfo;
      }

      const payload = await request.get('/user/me', {
        skipErrorMessage: true
      });
      this.setAuthState(this.token, payload.userInfo, payload.permissions, payload.menuPaths, payload.menus);
      return this.userInfo;
    },
    async logout() {
      const token = this.token;
      this.clearAuthState();
      try {
        if (token && !isLocalMockToken(token)) {
          await request.post(
            '/auth/logout',
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              skipErrorMessage: true
            }
          );
        }
      } catch {
        // Ignore logout failures because local auth state is already cleared.
      }
    }
  }
});
