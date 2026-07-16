export const navs = [
  { key: 'dashboard', path: '/dashboard', label: '首页', icon: 'Grid', roles: ['admin', 'teacher', 'leader'] },
  { key: 'system', path: '/module/system', label: '系统基础', icon: 'Setting', roles: ['admin'] },
  { key: 'program', path: '/module/program', label: '培养方案', icon: 'School', roles: ['admin', 'leader'] },
  { key: 'course', path: '/module/course', label: '课程管理', icon: 'Notebook', roles: ['admin', 'teacher', 'leader'] },
  { key: 'evaluation', path: '/module/evaluation', label: '达成评价', icon: 'TrendCharts', roles: ['admin', 'teacher', 'leader'] },
  { key: 'survey', path: '/module/survey', label: '调查问卷', icon: 'Document', roles: ['admin', 'leader'] },
  { key: 'improve', path: '/module/improve', label: '持续改进', icon: 'RefreshRight', roles: ['admin', 'leader'] },
  { key: 'report', path: '/module/report', label: '自评报告', icon: 'Files', roles: ['admin', 'teacher', 'leader'] }
];
