const STORAGE_KEY = 'education_space_user_directory';
export const DEFAULT_PASSWORD = '123456';

export const USER_ROLES = {
  ADMIN: 'ROLE_SUPER_ADMIN',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT'
};

export const ROLE_LABEL_MAP = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.TEACHER]: '老师',
  [USER_ROLES.STUDENT]: '学生'
};

export const ROLE_OPTIONS = [
  { label: '管理员', value: USER_ROLES.ADMIN },
  { label: '老师', value: USER_ROLES.TEACHER },
  { label: '学生', value: USER_ROLES.STUDENT }
];

export const DEPARTMENT_OPTIONS = ['教务处', '计算机学院', '电子信息学院', '自动化学院'];

const DEFAULT_USERS = [
  { id: 1, accountId: 'A2026001', realName: '张教务', role: USER_ROLES.ADMIN, department: '教务处', phone: '13800000001', email: 'admin@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-01 09:00:00' },
  { id: 2, accountId: 'T2026001', realName: '李老师', role: USER_ROLES.TEACHER, department: '计算机学院', phone: '13800000002', email: 'teacher@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-01 09:10:00' },
  { id: 3, accountId: 'S2026001', realName: '王同学', role: USER_ROLES.STUDENT, department: '计算机学院', phone: '13800000003', email: 'student@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-01 09:20:00' },
  { id: 4, accountId: 'S2026002', realName: '赵同学', role: USER_ROLES.STUDENT, department: '电子信息学院', phone: '13800000004', email: 'zhao@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-02 10:00:00' },
  { id: 5, accountId: 'T2026002', realName: '陈老师', role: USER_ROLES.TEACHER, department: '自动化学院', phone: '13800000005', email: 'chen@school.edu', status: 0, password: DEFAULT_PASSWORD, createdAt: '2026-07-02 10:20:00' },
  { id: 6, accountId: 'S2026003', realName: '周同学', role: USER_ROLES.STUDENT, department: '计算机学院', phone: '13800000006', email: 'zhou@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-03 11:00:00' },
  { id: 7, accountId: 'S2026004', realName: '吴同学', role: USER_ROLES.STUDENT, department: '电子信息学院', phone: '13800000007', email: 'wu@school.edu', status: 0, password: DEFAULT_PASSWORD, createdAt: '2026-07-03 11:15:00' },
  { id: 8, accountId: 'T2026003', realName: '黄老师', role: USER_ROLES.TEACHER, department: '计算机学院', phone: '13800000008', email: 'huang@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-04 08:30:00' },
  { id: 9, accountId: 'A2026002', realName: '孙主任', role: USER_ROLES.ADMIN, department: '教务处', phone: '13800000009', email: 'sun@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-04 09:30:00' },
  { id: 10, accountId: 'S2026005', realName: '郑同学', role: USER_ROLES.STUDENT, department: '自动化学院', phone: '13800000010', email: 'zheng@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-05 13:20:00' },
  { id: 11, accountId: 'T2026004', realName: '何老师', role: USER_ROLES.TEACHER, department: '电子信息学院', phone: '13800000011', email: 'he@school.edu', status: 1, password: DEFAULT_PASSWORD, createdAt: '2026-07-05 14:10:00' },
  { id: 12, accountId: 'S2026006', realName: '林同学', role: USER_ROLES.STUDENT, department: '计算机学院', phone: '13800000012', email: 'lin@school.edu', status: 0, password: DEFAULT_PASSWORD, createdAt: '2026-07-06 16:45:00' }
];

function createTimestamp() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function createDefaultUser() {
  return {
    id: null,
    accountId: '',
    realName: '',
    role: USER_ROLES.TEACHER,
    department: '',
    phone: '',
    email: '',
    status: 1,
    password: DEFAULT_PASSWORD,
    createdAt: ''
  };
}

function cloneUser(user = {}) {
  return {
    ...createDefaultUser(),
    ...user,
    accountId: normalizeText(user.accountId),
    realName: normalizeText(user.realName),
    role: normalizeText(user.role) || USER_ROLES.TEACHER,
    department: normalizeText(user.department),
    phone: normalizePhone(user.phone),
    email: normalizeEmail(user.email)
  };
}

function readStorageJSON(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistUsers(users) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(users.map((item) => cloneUser(item))));
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizePhone(value) {
  return normalizeText(value).replace(/\s+/g, '');
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeLoginIdentifier(value) {
  return normalizeText(value).toLowerCase();
}

function nextUserId(users) {
  return users.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function createRecord(payload, existingUsers = [], options = {}) {
  const currentTime = options.createdAt || createTimestamp();
  const status = options.status ?? 1;
  return {
    ...createDefaultUser(),
    ...payload,
    id: options.id ?? nextUserId(existingUsers),
    status,
    password: normalizeText(payload.password) || DEFAULT_PASSWORD,
    createdAt: options.keepCreatedAt ? payload.createdAt : currentTime,
    accountId: normalizeText(payload.accountId),
    realName: normalizeText(payload.realName),
    role: normalizeText(payload.role),
    department: normalizeText(payload.department),
    phone: normalizePhone(payload.phone),
    email: normalizeEmail(payload.email)
  };
}

function parseRoleValue(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return '';
  }

  if (['管理员', 'admin', 'role_super_admin', USER_ROLES.ADMIN.toLowerCase()].includes(normalized)) {
    return USER_ROLES.ADMIN;
  }
  if (['老师', '教师', 'teacher', 'role_teacher', USER_ROLES.TEACHER.toLowerCase()].includes(normalized)) {
    return USER_ROLES.TEACHER;
  }
  if (['学生', 'student', 'role_student', USER_ROLES.STUDENT.toLowerCase()].includes(normalized)) {
    return USER_ROLES.STUDENT;
  }

  return '';
}

export function getUserDirectory() {
  const storedUsers = readStorageJSON(STORAGE_KEY, []);
  if (Array.isArray(storedUsers) && storedUsers.length) {
    return storedUsers.map((item) => cloneUser(item));
  }

  const seededUsers = DEFAULT_USERS.map((item) => cloneUser(item));
  persistUsers(seededUsers);
  return seededUsers;
}

export function getUserById(id) {
  return getUserDirectory().find((item) => item.id === id) || null;
}

export function getAccountLabel(role) {
  return role === USER_ROLES.STUDENT ? '学号' : '工号';
}

export function getLoginRuleText(role) {
  return role === USER_ROLES.STUDENT
    ? '学生可使用学号、手机号或邮箱登录。'
    : '管理员和老师可使用工号、手机号或邮箱登录。';
}

export function getRoleStatSummary(users = []) {
  const list = users.length ? users : getUserDirectory();
  return {
    total: list.length,
    active: list.filter((item) => item.status === 1).length,
    admins: list.filter((item) => item.role === USER_ROLES.ADMIN).length,
    teachers: list.filter((item) => item.role === USER_ROLES.TEACHER).length,
    students: list.filter((item) => item.role === USER_ROLES.STUDENT).length
  };
}

export function resolveLoginUser(loginId) {
  const normalized = normalizeLoginIdentifier(loginId);
  if (!normalized) {
    return null;
  }

  return getUserDirectory().find((item) => {
    return [
      normalizeLoginIdentifier(item.accountId),
      normalizeLoginIdentifier(item.phone),
      normalizeLoginIdentifier(item.email)
    ].filter(Boolean).includes(normalized);
  }) || null;
}

export function validateUserPayload(payload, existingUsers = [], options = {}) {
  const role = parseRoleValue(payload.role);
  const accountId = normalizeText(payload.accountId);
  const realName = normalizeText(payload.realName);
  const department = normalizeText(payload.department);
  const phone = normalizePhone(payload.phone);
  const email = normalizeEmail(payload.email);
  const errors = [];
  const scopedUsers = existingUsers.filter((item) => item.id !== options.excludeId);

  if (!role) {
    errors.push('请选择角色');
  }

  if (!accountId) {
    errors.push(`请输入${getAccountLabel(role)}`);
  }

  if (!realName) {
    errors.push('请输入姓名');
  }

  if (!department) {
    errors.push('请选择院系');
  }

  if (phone && !/^1\d{10}$/.test(phone)) {
    errors.push('手机号格式不正确');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('邮箱格式不正确');
  }

  if (scopedUsers.some((item) => normalizeLoginIdentifier(item.accountId) === normalizeLoginIdentifier(accountId))) {
    errors.push(`${getAccountLabel(role)}已存在`);
  }

  if (phone && scopedUsers.some((item) => normalizePhone(item.phone) === phone)) {
    errors.push('手机号已存在');
  }

  if (email && scopedUsers.some((item) => normalizeEmail(item.email) === email)) {
    errors.push('邮箱已存在');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalizedPayload: {
      ...payload,
      role,
      accountId,
      realName,
      department,
      phone,
      email
    }
  };
}

export function createUser(payload) {
  const users = getUserDirectory();
  const validation = validateUserPayload(payload, users);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const nextUsers = [
    createRecord(validation.normalizedPayload, users, { status: 1 }),
    ...users
  ];
  persistUsers(nextUsers);
  return nextUsers;
}

export function updateUser(payload) {
  const users = getUserDirectory();
  const validation = validateUserPayload(payload, users, { excludeId: payload.id });
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const nextUsers = users.map((item) => {
    if (item.id !== payload.id) {
      return item;
    }

    return createRecord(
      {
        ...item,
        ...validation.normalizedPayload,
        password: item.password,
        createdAt: item.createdAt
      },
      users,
      {
        id: item.id,
        status: item.status,
        keepCreatedAt: true
      }
    );
  });

  persistUsers(nextUsers);
  return nextUsers;
}

export function deleteUser(id) {
  const nextUsers = getUserDirectory().filter((item) => item.id !== id);
  persistUsers(nextUsers);
  return nextUsers;
}

export function resetUserPassword(id, password = DEFAULT_PASSWORD) {
  const nextUsers = getUserDirectory().map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      password
    };
  });
  persistUsers(nextUsers);
  return nextUsers;
}

export function setUserStatus(id, status) {
  const nextUsers = getUserDirectory().map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      status
    };
  });
  persistUsers(nextUsers);
  return nextUsers;
}

export function buildLoginAccounts(user) {
  return [user.accountId, user.phone, user.email].filter(Boolean);
}

export function createUserTemplateText() {
  return [
    '角色,工号/学号,姓名,院系,手机号,邮箱',
    '管理员,A2026010,王教务,教务处,13800000021,admin10@school.edu',
    '老师,T2026012,周老师,计算机学院,13800000022,teacher12@school.edu',
    '学生,S2026308,李同学,自动化学院,13800000023,student308@school.edu'
  ].join('\n');
}

export function parseBatchUsers(text, existingUsers = getUserDirectory()) {
  const rows = normalizeText(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const previewRecords = [];
  const errors = [];
  const workingUsers = existingUsers.map((item) => cloneUser(item));

  rows.forEach((line, index) => {
    const cells = line.split(/[,\t，]/).map((item) => item.trim());
    if (index === 0 && cells[0] === '角色') {
      return;
    }

    if (cells.length < 6) {
      errors.push(`第 ${index + 1} 行字段不足，请按“角色,工号/学号,姓名,院系,手机号,邮箱”填写。`);
      return;
    }

    const payload = {
      role: cells[0],
      accountId: cells[1],
      realName: cells[2],
      department: cells[3],
      phone: cells[4],
      email: cells[5]
    };

    const validation = validateUserPayload(payload, workingUsers);
    if (!validation.valid) {
      errors.push(`第 ${index + 1} 行：${validation.errors.join('；')}`);
      return;
    }

    const record = createRecord(validation.normalizedPayload, workingUsers, { status: 1 });
    workingUsers.unshift(record);
    previewRecords.push(record);
  });

  return {
    records: previewRecords,
    errors
  };
}

export function batchCreateUsers(text) {
  const users = getUserDirectory();
  const parsed = parseBatchUsers(text, users);
  if (parsed.errors.length) {
    throw new Error(parsed.errors[0]);
  }

  const nextUsers = [...parsed.records, ...users];
  persistUsers(nextUsers);
  return {
    users: nextUsers,
    createdCount: parsed.records.length
  };
}
