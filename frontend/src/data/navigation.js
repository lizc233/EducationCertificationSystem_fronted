export const ROLES = {
  SUPER: 'ROLE_SUPER_ADMIN',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT'
};

const allRoles = [ROLES.SUPER, ROLES.TEACHER, ROLES.STUDENT];
const adminRoles = [ROLES.SUPER];
const teacherRoles = [ROLES.TEACHER];
const studentRoles = [ROLES.STUDENT];
const userManagementRoles = [ROLES.SUPER, ROLES.TEACHER];

export const navGroups = [
  {
    label: '工作台',
    items: [
      {
        key: 'dashboard-super',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看全校认证工作总览、选课与成绩审批、系统状态和关键指标。',
        roles: adminRoles
      },
      {
        key: 'dashboard-teacher',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看个人课程、课表、待审核成绩和教学待办。',
        roles: teacherRoles
      },
      {
        key: 'dashboard-student',
        path: '/dashboard',
        label: '首页概览',
        summary: '查看选课结果、学业进度、成绩发布和课程评价提醒。',
        roles: studentRoles
      },
      {
        key: 'messages',
        path: '/messages',
        label: '消息通知中心',
        summary: '统一查看系统通知、课程消息与业务提醒。',
        roles: allRoles,
        showInNav: false
      },
      {
        key: 'profile',
        path: '/profile',
        label: '个人设置',
        summary: '维护个人资料、联系方式和安全设置。',
        roles: allRoles,
        showInNav: false
      },
      {
        key: 'ai',
        path: '/ai',
        label: 'AI 助手',
        summary: '提供认证分析、报告润色、指标点匹配和问答支持。',
        roles: adminRoles
      }
    ]
  },
  {
    label: '基础管理',
    items: [
      { key: 'organization', path: '/organization', label: '组织架构', summary: '维护学校、学院、专业和班级组织关系。', roles: adminRoles },
      { key: 'params', path: '/params', label: '系统参数', summary: '维护基础参数、认证阈值与系统配置。', roles: adminRoles },
      { key: 'logs', path: '/logs', label: '操作日志', summary: '查询登录记录、业务操作和导出历史。', roles: adminRoles },
      { key: 'announcements', path: '/announcements', label: '系统公告管理', summary: '发布面向全体用户的系统公告和通知。', roles: adminRoles }
    ]
  },
  {
    label: '方案与课程',
    items: [
      { key: 'program', path: '/program', label: '方案管理', summary: '维护培养方案版本、状态和适用范围。', roles: adminRoles },
      { key: 'program-goals', path: '/program/goals', label: '培养目标与毕业要求', summary: '配置培养目标、毕业要求和支撑关系。', roles: adminRoles },
      { key: 'program-courses', path: '/program/courses', label: '课程体系与支撑矩阵', summary: '维护课程结构和毕业要求支撑矩阵。', roles: adminRoles },
      { key: 'courses', path: '/courses', label: '课程管理', summary: '维护课程编码、学分学时和开课单位。', roles: adminRoles },
      { key: 'course-goals-admin', path: '/courses/goals', label: '课程目标与指标点映射', summary: '配置课程目标、达成标准和指标点映射。', roles: adminRoles }
    ]
  },
  {
    label: '评价与达成',
    items: [
      { key: 'course-teaching', path: '/courses/teaching', label: '教学内容与考核方式配置', summary: '配置教学内容、考核方式和权重校验。', roles: adminRoles },
      { key: 'teaching', path: '/teaching', label: '授课任务分配', summary: '按学期分配课程、班级和任课教师。', roles: adminRoles },
      { key: 'course-resources-admin', path: '/courses/resources', label: '课程资源管理', summary: '维护课程资料、文档和教学资源目录。', roles: adminRoles },
      { key: 'evaluation-materials-admin', path: '/evaluation/materials', label: '考核证据材料管理', summary: '审核课程证据材料并进行归档管理。', roles: adminRoles },
      { key: 'evaluation-scores-admin', path: '/evaluation/scores', label: '按课程目标成绩管理', summary: '查看课程目标成绩总表和锁定结果。', roles: adminRoles },
      { key: 'achievement-model', path: '/achievement/model', label: '达成度评价模型配置', summary: '配置评价模型、阈值和启用范围。', roles: adminRoles },
      { key: 'achievement-course', path: '/achievement/course', label: '课程目标达成度评价', summary: '查看课程目标达成度结果和下钻明细。', roles: adminRoles },
      { key: 'achievement-graduate', path: '/achievement/graduate', label: '毕业要求达成度评价与预警', summary: '汇总毕业要求达成度并处理预警项。', roles: adminRoles },
      { key: 'achievement-dashboard', path: '/achievement/dashboard', label: '达成度统计分析看板', summary: '通过图表和数据表分析达成度分布。', roles: adminRoles }
    ]
  },
  {
    label: '选课与成绩',
    items: [
      { key: 'course-selection-management', path: '/course-selection-management', label: '选课管理', summary: '发布选课任务、控制容量并查看选课名单。', roles: adminRoles },
      { key: 'score-audit', path: '/score-audit', label: '成绩审核', summary: '审核教师提交的成绩并处理驳回原因。', roles: adminRoles }
    ]
  },
  {
    label: '问卷与改进',
    items: [
      { key: 'survey', path: '/survey', label: '问卷设计与管理', summary: '维护问卷模板、发布状态和回收统计。', roles: adminRoles },
      { key: 'survey-fill-admin', path: '/survey/fill', label: '问卷填报与统计', summary: '查看答卷入口、回收进度和统计结果。', roles: adminRoles },
      { key: 'improve-admin', path: '/improve', label: '持续改进计划', summary: '维护问题台账、责任人和整改进度。', roles: adminRoles }
    ]
  },
  {
    label: '报告中心',
    items: [
      { key: 'report-super', path: '/report', label: '自评报告', summary: '维护完整报告大纲、分工和导出。', roles: adminRoles },
      { key: 'report-teacher', path: '/report', label: '自评报告', summary: '维护本人负责的报告章节和支撑内容。', roles: teacherRoles, showInNav: false }
    ]
  },
  {
    label: '用户管理',
    items: [
      { key: 'users', path: '/users', label: '用户管理', summary: '统一维护管理员、老师和学生账号，支持单独新增、批量添加和启停管理。', roles: userManagementRoles }
    ]
  },
  {
    label: '我的工作台',
    items: [
      { key: 'my-courses-teacher', path: '/my-courses', label: '我的课程', summary: '查看本学期任教课程、班级规模和入口操作。', roles: teacherRoles },
      { key: 'my-schedule-teacher', path: '/my-schedule', label: '我的课表', summary: '按周查看个人授课安排和上课提醒。', roles: teacherRoles },
      { key: 'course-students', path: '/course-students', label: '课程学生名单', summary: '查看选课学生名单并导出。', roles: teacherRoles },
      { key: 'course-resources-teacher', path: '/my-courses', label: '课程资源管理', summary: '上传教学资源、资料包和配套附件。', roles: teacherRoles, showInNav: false },
      { key: 'course-announcements', path: '/course-announcements', label: '课程公告', summary: '向任课班级发布课程通知和教学提醒。', roles: teacherRoles },
      { key: 'evaluation-materials-teacher', path: '/evaluation/materials', label: '考核证据材料管理', summary: '上传并查看本人课程证据材料。', roles: teacherRoles }
    ]
  },
  {
    label: '成绩管理',
    items: [
      { key: 'score-input', path: '/score-input', label: '成绩录入与提交', summary: '录入课程成绩、提交审核并查看审核状态。', roles: teacherRoles },
      { key: 'course-goals-teacher', path: '/courses/goals', label: '课程目标与指标点映射', summary: '维护本人课程目标与指标点映射。', roles: teacherRoles },
      { key: 'teaching-feedback', path: '/teaching-feedback', label: '教学反馈查看', summary: '查看学生匿名课程反馈与意见摘要。', roles: teacherRoles }
    ]
  },
  {
    label: '问卷与改进',
    items: [
      { key: 'survey-fill-teacher', path: '/survey/fill', label: '问卷填报', summary: '参与待填问卷并查看个人填报状态。', roles: teacherRoles },
      { key: 'improve-teacher', path: '/improve', label: '持续改进计划', summary: '查看改进事项进度和责任分工。', roles: teacherRoles }
    ]
  },
  {
    label: '我的学习',
    items: [
      { key: 'course-selection', path: '/course-selection', label: '选课中心', summary: '查看可选课程、容量和选课截止时间。', roles: studentRoles },
      { key: 'my-courses-student', path: '/my-courses', label: '我的课程', summary: '查看已选课程、授课教师与课程公告。', roles: studentRoles },
      { key: 'my-schedule-student', path: '/my-schedule', label: '我的课表', summary: '查看本学期课程安排和上课时间。', roles: studentRoles },
      { key: 'my-scores', path: '/my-scores', label: '我的成绩', summary: '查看各课程成绩、考核项和总评结果。', roles: studentRoles },
      { key: 'academic-progress', path: '/academic-progress', label: '学业进度', summary: '查看学分完成情况和课程类别进展。', roles: studentRoles },
      { key: 'my-achievement', path: '/my-achievement', label: '我的达成度报告', summary: '查看个人课程目标达成情况和建议。', roles: studentRoles }
    ]
  },
  {
    label: '课程评价',
    items: [
      { key: 'course-evaluate', path: '/course-evaluate', label: '课程评价', summary: '对已修课程进行评分和文字评价。', roles: studentRoles }
    ]
  },
  {
    label: '问卷填报',
    items: [
      { key: 'survey-fill-student', path: '/survey/fill', label: '问卷填报', summary: '完成待填问卷并查看个人提交状态。', roles: studentRoles },
      { key: 'course-announcements-view', path: '/course-announcements-view', label: '课程公告查看', summary: '按课程查看教师发布的课程公告。', roles: studentRoles, showInNav: false }
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
