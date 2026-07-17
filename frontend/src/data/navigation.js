export const ROLES = {
  SUPER: 'ROLE_SUPER_ADMIN',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT'
};

const allRoles = [ROLES.SUPER, ROLES.TEACHER, ROLES.STUDENT];
const adminRoles = [ROLES.SUPER];
const teacherRoles = [ROLES.TEACHER];
const studentRoles = [ROLES.STUDENT];

export const navGroups = [
  {
    label: '工作台',
    items: [
      {
        key: 'dashboard-super',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看全校认证工作总览、审批事项、系统运行状态和关键指标。',
        roles: [ROLES.SUPER]
      },
      {
        key: 'dashboard-teacher',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看个人授课任务、待录入成绩、教学提醒和通知公告。',
        roles: [ROLES.TEACHER]
      },
      {
        key: 'dashboard-student',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看学业进度、最新成绩、待完成问卷和个人通知。',
        roles: [ROLES.STUDENT]
      },
      {
        key: 'messages',
        path: '/messages',
        label: '消息通知中心',
        summary: '统一查看系统通知、审批提醒和业务消息。',
        roles: allRoles,
        showInNav: false
      },
      {
        key: 'profile',
        path: '/profile',
        label: '个人设置',
        summary: '维护个人资料、联系方式和账号安全设置。',
        roles: allRoles,
        showInNav: false
      },
      {
        key: 'ai',
        path: '/ai',
        label: 'AI 助手',
        summary: '提供认证分析、报告润色、指标点匹配与问题咨询。',
        roles: adminRoles
      }
    ]
  },
  {
    label: '基础管理',
    items: [
      { key: 'users', path: '/users', label: '用户管理', summary: '维护账号、角色、院系和启停状态。', roles: adminRoles },
      { key: 'organization', path: '/organization', label: '组织架构', summary: '维护学校、学院、专业和班级层级关系。', roles: adminRoles },
      { key: 'params', path: '/params', label: '系统参数', summary: '配置基础参数、认证阈值和消息规则。', roles: adminRoles },
      { key: 'logs', path: '/logs', label: '操作日志', summary: '查询操作记录、登录日志和导出历史。', roles: adminRoles }
    ]
  },
  {
    label: '方案与课程',
    items: [
      { key: 'program', path: '/program', label: '方案管理', summary: '维护培养方案版本、状态和适用范围。', roles: adminRoles },
      { key: 'program-goals', path: '/program/goals', label: '培养目标与毕业要求', summary: '配置培养目标、毕业要求和支撑关系。', roles: adminRoles },
      { key: 'program-courses', path: '/program/courses', label: '课程体系与支撑矩阵', summary: '维护课程体系结构和毕业要求支撑矩阵。', roles: adminRoles },
      { key: 'courses', path: '/courses', label: '课程管理', summary: '维护课程编码、学分学时和开课单位。', roles: adminRoles },
      { key: 'course-goals-admin', path: '/courses/goals', label: '课程目标与指标点映射', summary: '配置课程目标、达成标准和指标点映射。', roles: adminRoles }
    ]
  },
  {
    label: '评价与达成',
    items: [
      { key: 'course-teaching', path: '/courses/teaching', label: '教学内容与考核方式配置', summary: '配置教学内容、考核方式和权重校验。', roles: adminRoles },
      { key: 'teaching', path: '/teaching', label: '授课任务分配', summary: '按学期分配课程、班级和任课教师。', roles: adminRoles },
      { key: 'course-resources-admin', path: '/courses/resources', label: '课程资源管理', summary: '维护课程文件、教学文档和资源目录。', roles: adminRoles },
      { key: 'evaluation-materials-admin', path: '/evaluation/materials', label: '考核证据材料管理', summary: '管理课程证据材料、审核状态和归档结果。', roles: adminRoles },
      { key: 'evaluation-scores-admin', path: '/evaluation/scores', label: '按课程目标成绩管理', summary: '录入课程目标成绩并查看统计结果。', roles: adminRoles },
      { key: 'achievement-model', path: '/achievement/model', label: '达成度评价模型配置', summary: '配置评价模型、阈值和启用范围。', roles: adminRoles },
      { key: 'achievement-course', path: '/achievement/course', label: '课程目标达成度评价', summary: '查看课程目标达成度结果和下钻明细。', roles: adminRoles },
      { key: 'achievement-graduate', path: '/achievement/graduate', label: '毕业要求达成度评价与预警', summary: '汇总毕业要求达成度并处理预警项目。', roles: adminRoles },
      { key: 'achievement-dashboard', path: '/achievement/dashboard', label: '达成度统计分析看板', summary: '通过图表和数据表分析达成度分布。', roles: adminRoles }
    ]
  },
  {
    label: '问卷与改进',
    items: [
      { key: 'survey', path: '/survey', label: '问卷设计与管理', summary: '维护问卷模板、发布状态和回收统计。', roles: adminRoles },
      { key: 'survey-fill-admin', path: '/survey/fill', label: '问卷填报与统计', summary: '查看填报入口、答卷进度和统计结果。', roles: [ROLES.SUPER] },
      { key: 'improve-admin', path: '/improve', label: '持续改进计划', summary: '维护问题台账、责任人和整改进度。', roles: adminRoles }
    ]
  },
  {
    label: '报告中心',
    items: [
      { key: 'report-super', path: '/report', label: '自评报告', summary: '按章节组织报告内容、任务进度和导出结果。', roles: [ROLES.SUPER] },
      { key: 'report-teacher', path: '/report', label: '自评报告', summary: '维护本人课程相关章节内容与导出结果。', roles: [ROLES.TEACHER], showInNav: false }
    ]
  },
  {
    label: '我的工作台',
    items: [
      { key: 'my-teaching', path: '/my-teaching', label: '我的授课任务', summary: '查看本人本学期授课安排、班级和课堂提醒。', roles: teacherRoles },
      { key: 'my-courses', path: '/my-courses', label: '课程资源管理', summary: '维护本人课程资料、教学文档和资源上传。', roles: teacherRoles },
      { key: 'evaluation-materials-teacher', path: '/evaluation/materials', label: '考核证据材料管理', summary: '上传并查看本人课程证据材料。', roles: teacherRoles }
    ]
  },
  {
    label: '成绩管理',
    items: [
      { key: 'evaluation-scores-teacher', path: '/evaluation/scores', label: '按课程目标成绩管理', summary: '录入本人任教课程的课程目标成绩。', roles: teacherRoles },
      { key: 'course-goals-teacher', path: '/courses/goals', label: '课程目标与指标点映射', summary: '维护本人课程目标、达成标准和指标点映射。', roles: teacherRoles }
    ]
  },
  {
    label: '问卷与改进',
    items: [
      { key: 'survey-fill-teacher', path: '/survey/fill', label: '问卷填报', summary: '参与待填问卷并查看个人填报状态。', roles: teacherRoles },
      { key: 'improve-teacher', path: '/improve', label: '持续改进计划', summary: '查看改进事项进度、责任分工和跟进状态。', roles: teacherRoles }
    ]
  },
  {
    label: '我的学习',
    items: [
      { key: 'my-scores', path: '/my-scores', label: '我的成绩', summary: '查看个人课程成绩、学分和最新发布结果。', roles: studentRoles },
      { key: 'my-achievement', path: '/my-achievement', label: '我的达成度报告', summary: '查看个人课程目标达成情况和学习建议。', roles: studentRoles }
    ]
  },
  {
    label: '问卷填报',
    items: [
      { key: 'survey-fill-student', path: '/survey/fill', label: '问卷填报', summary: '完成待填问卷并查看个人提交状态。', roles: studentRoles }
    ]
  }
];

export const navs = navGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupLabel: group.label
  }))
);

function filterGroupsByRole(role = '') {
  const fallbackRole = role || ROLES.SUPER;
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(fallbackRole))
    }))
    .filter((group) => group.items.length);
}

function getCandidateNavs(role = '') {
  const fallbackRole = role || ROLES.SUPER;
  const filtered = navs.filter((item) => item.roles.includes(fallbackRole));
  return filtered.length ? filtered : navs;
}

export function getVisibleNavGroups(role = '') {
  return filterGroupsByRole(role)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.showInNav !== false),
      defaultPath: group.items.find((item) => item.showInNav !== false)?.path || group.items[0]?.path || '/dashboard'
    }))
    .filter((group) => group.items.length);
}

export function getSearchableNavItems(role = '') {
  return getCandidateNavs(role);
}

export function resolveNavPath(path = '', role = '') {
  if (!path) {
    return '/dashboard';
  }

  const matched = [...getCandidateNavs(role)]
    .sort((left, right) => right.path.length - left.path.length)
    .find((item) => path === item.path || path.startsWith(`${item.path}/`));

  return matched?.path || '/dashboard';
}

export function resolveNavItem(path = '', role = '') {
  const resolvedPath = resolveNavPath(path, role);
  return getCandidateNavs(role).find((item) => item.path === resolvedPath) || navs[0];
}

export function resolveNavGroup(path = '', role = '') {
  const resolvedPath = resolveNavPath(path, role);
  const groups = filterGroupsByRole(role);
  return groups.find((group) => group.items.some((item) => item.path === resolvedPath)) || groups[0] || navGroups[0];
}

export function buildBreadcrumbs(path = '', extraItems = [], role = '') {
  const navItem = resolveNavItem(path, role);
  const navGroup = resolveNavGroup(path, role);
  const base = navItem.path === '/dashboard'
    ? ['首页', '首页概览']
    : ['首页', navGroup.label, navItem.label];

  return [...base, ...extraItems.filter(Boolean)];
}

export function getRoleHomePath(role = '') {
  return getVisibleNavGroups(role)[0]?.defaultPath || '/dashboard';
}

export function canSee(role) {
  return navs.filter((item) => item.roles.includes(role));
}
