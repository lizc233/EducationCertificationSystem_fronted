import { get, post } from './http';

const mock = import.meta.env.VITE_MOCK_API !== 'false';

const users = {
  admin: { id: 1, username: 'admin', realName: '系统管理员', role: 'admin', roleName: '系统管理员' },
  teacher: { id: 2, username: 'teacher', realName: '张昊', role: 'teacher', roleName: '课程负责人' },
  leader: { id: 3, username: 'leader', realName: '李晗', role: 'leader', roleName: '专业负责人' }
};

export function login(data) {
  if (mock) {
    const user = users[data.username] || users.admin;
    return Promise.resolve({ token: `mock-${user.role}`, user });
  }
  return post('/auth/login', data);
}

export function me() {
  if (mock) {
    const role = localStorage.getItem('ecs_user_role') || 'admin';
    return Promise.resolve(users[role] || users.admin);
  }
  return get('/auth/me');
}
