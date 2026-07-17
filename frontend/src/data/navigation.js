const allRoles = ['ROLE_SUPER_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];

export const navGroups = [
  {
    label: '工作台',
    items: [
      { key: 'dashboard', path: '/dashboard', label: '首页概览', summary: '查看关键指标、快捷入口、待办任务和系统公告。', roles: allRoles },
      { key: 'messages', path: '/messages', label: '消息通知中心', summary: '集中处理系统通知、审批提醒和业务消息。', roles: allRoles },
      { key: 'ai', path: '/ai', label: 'AI 助手', summary: '提供认证分析、报告润色和业务问答支持。', roles: allRoles }
    ]
  },
  {
    label: '基础管理',
    items: [
      { key: 'users', path: '/users', label: '用户管理', summary: '维护用户档案、角色分配、状态和联系方式。', roles: allRoles },
      { key: 'organization', path: '/organization', label: '组织架构', summary: '维护院系、专业、班级与负责人信息。', roles: allRoles },
      { key: 'params', path: '/params', label: '系统参数', summary: '配置参数分组、通知规则和评价阈值。', roles: allRoles },
      { key: 'logs', path: '/logs', label: '操作日志', summary: '查询登录记录、业务操作和导出历史。', roles: allRoles }
    ]
  },
  {
    label: '方案与课程',
    items: [
      { key: 'program', path: '/program', label: '方案管理', summary: '管理培养方案版本、状态和归档信息。', roles: allRoles },
      { key: 'program-goals', path: '/program/goals', label: '培养目标与毕业要求', summary: '配置培养目标、毕业要求及支撑关系。', roles: allRoles },
      { key: 'program-courses', path: '/program/courses', label: '课程体系与支撑矩阵', summary: '维护课程结构和毕业要求支撑强度。', roles: allRoles },
      { key: 'courses', path: '/courses', label: '课程管理', summary: '维护课程基础数据、学分学时和开课单位。', roles: allRoles },
      { key: 'course-goals', path: '/courses/goals', label: '课程目标与指标点映射', summary: '配置课程目标、指标点和达成标准。', roles: allRoles },
      { key: 'course-teaching', path: '/courses/teaching', label: '教学内容与考核方式配置', summary: '配置教学条目、考核方式和权重校验。', roles: allRoles },
      { key: 'teaching', path: '/teaching', label: '授课任务分配', summary: '分配学期授课任务、班级和任课教师。', roles: allRoles },
      { key: 'course-resources', path: '/courses/resources', label: '课程资源管理', summary: '管理课程文件、教学文档和资源目录。', roles: allRoles }
    ]
  },
  {
    label: '评价与达成',
    items: [
      { key: 'evaluation-materials', path: '/evaluation/materials', label: '考核证据材料管理', summary: '管理课程证据材料、审核状态和归档结果。', roles: allRoles },
      { key: 'evaluation-scores', path: '/evaluation/scores', label: '按课程目标成绩管理', summary: '录入课程目标成绩并查看统计结果。', roles: allRoles },
      { key: 'achievement-model', path: '/achievement/model', label: '达成度评价模型配置', summary: '配置评价模型、阈值和启用范围。', roles: allRoles },
      { key: 'achievement-course', path: '/achievement/course', label: '课程目标达成度评价', summary: '查看课程目标达成度结果和下钻明细。', roles: allRoles },
      { key: 'achievement-graduate', path: '/achievement/graduate', label: '毕业要求达成度评价与预警', summary: '汇总毕业要求达成度并处理预警项。', roles: allRoles },
      { key: 'achievement-dashboard', path: '/achievement/dashboard', label: '达成度统计分析看板', summary: '通过图表和数据表分析达成度分布。', roles: allRoles }
    ]
  },
  {
    label: '问卷与改进',
    items: [
      { key: 'survey', path: '/survey', label: '问卷设计与管理', summary: '维护问卷模板、发布状态和回收统计。', roles: allRoles },
      { key: 'survey-fill', path: '/survey/fill', label: '问卷填报与统计', summary: '查看填报入口、答卷进度和统计结果。', roles: allRoles },
      { key: 'improve', path: '/improve', label: '持续改进计划', summary: '维护问题台账、责任人和整改进度。', roles: allRoles }
    ]
  },
  {
    label: '报告中心',
    items: [
      { key: 'report', path: '/report', label: '自评报告', summary: '按大纲组织报告章节、任务进度和内容编写。', roles: allRoles },
      { key: 'profile', path: '/profile', label: '个人设置', summary: '维护个人资料、联系方式和安全设置。', roles: allRoles }
    ]
  }
];

export const navs = navGroups.flatMap((group) => group.items);

export function resolveNavPath(path = '') {
  if (!path) {
    return '/dashboard';
  }

  const matched = [...navs]
    .sort((left, right) => right.path.length - left.path.length)
    .find((item) => path === item.path || path.startsWith(`${item.path}/`));

  return matched?.path || '/dashboard';
}

export function resolveNavItem(path = '') {
  const resolvedPath = resolveNavPath(path);
  return navs.find((item) => item.path === resolvedPath) || navs[0];
}

export function resolveNavGroup(path = '') {
  const resolvedPath = resolveNavPath(path);
  return navGroups.find((group) => group.items.some((item) => item.path === resolvedPath)) || navGroups[0];
}

export function buildBreadcrumbs(path = '', extraItems = []) {
  const navItem = resolveNavItem(path);
  const navGroup = resolveNavGroup(path);
  const base = navItem.path === '/dashboard'
    ? ['首页', '首页概览']
    : ['首页', navGroup.label, navItem.label];

  return [...base, ...extraItems.filter(Boolean)];
}
