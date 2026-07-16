import http from './http';

const MOCK = import.meta.env.VITE_MOCK_API !== 'false';

export async function login(payload) {
  if (MOCK) {
    return {
      token: 'mock-token',
      user: {
        id: 1,
        username: payload.username,
        realName: '管理员',
        roleName: '系统管理员'
      }
    };
  }
  return http.post('/auth/login', payload);
}

export async function me() {
  if (MOCK) {
    return {
      id: 1,
      username: 'admin',
      realName: '管理员',
      roleName: '系统管理员'
    };
  }
  return http.get('/auth/me');
}
