import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRoleHomePath, navs, resolveNavItem, ROLES } from '../data/navigation';
import { useUserStore } from '../store/user';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import Profile from '../views/Profile.vue';
import NotFound from '../views/error/NotFound.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import ConfigCrudPageView from '../views/pages/ConfigCrudPageView.vue';
import OrganizationView from '../views/pages/OrganizationView.vue';
import ProgramGoalsView from '../views/pages/ProgramGoalsView.vue';
import ProgramCoursesView from '../views/pages/ProgramCoursesView.vue';
import CourseGoalsView from '../views/pages/CourseGoalsView.vue';
import CourseTeachingView from '../views/pages/CourseTeachingView.vue';
import CourseResourcesView from '../views/pages/CourseResourcesView.vue';
import EvaluationScoresView from '../views/pages/EvaluationScoresView.vue';
import MessagesView from '../views/pages/MessagesView.vue';
import AchievementCourseView from '../views/pages/AchievementCourseView.vue';
import AchievementGraduateView from '../views/pages/AchievementGraduateView.vue';
import AchievementDashboardView from '../views/pages/AchievementDashboardView.vue';
import SurveyFillView from '../views/pages/SurveyFillView.vue';
import ReportView from '../views/pages/ReportView.vue';
import AiAssistantView from '../views/pages/AiAssistantView.vue';
import RecordWorkspaceView from '../views/pages/RecordWorkspaceView.vue';
import MyTeachingView from '../views/pages/MyTeachingView.vue';
import MyCoursesView from '../views/pages/MyCoursesView.vue';
import MyScoresView from '../views/pages/MyScoresView.vue';
import MyAchievementView from '../views/pages/MyAchievementView.vue';

const appTitle = '工程教育认证智能服务系统';
const allRoles = [ROLES.SUPER, ROLES.TEACHER, ROLES.STUDENT];
const superOnly = [ROLES.SUPER];
const teacherOnly = [ROLES.TEACHER];
const studentOnly = [ROLES.STUDENT];
const superAndTeacher = [ROLES.SUPER, ROLES.TEACHER];

const pageRoutes = [
  { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '首页概览', roles: allRoles } },
  { path: 'users', name: 'users', component: ConfigCrudPageView, props: { pageKey: 'users' }, meta: { title: '用户管理', roles: superOnly } },
  { path: 'organization', name: 'organization', component: OrganizationView, meta: { title: '组织架构', roles: superOnly } },
  { path: 'params', name: 'params', component: ConfigCrudPageView, props: { pageKey: 'params' }, meta: { title: '系统参数', roles: superOnly } },
  { path: 'logs', name: 'logs', component: ConfigCrudPageView, props: { pageKey: 'logs' }, meta: { title: '操作日志', roles: superOnly } },
  { path: 'program', name: 'program', component: ConfigCrudPageView, props: { pageKey: 'program' }, meta: { title: '方案管理', roles: superOnly } },
  { path: 'program/goals', name: 'program-goals', component: ProgramGoalsView, meta: { title: '培养目标与毕业要求', roles: superOnly } },
  { path: 'program/courses', name: 'program-courses', component: ProgramCoursesView, meta: { title: '课程体系与支撑矩阵', roles: superOnly } },
  { path: 'courses', name: 'courses', component: ConfigCrudPageView, props: { pageKey: 'courses' }, meta: { title: '课程管理', roles: superOnly } },
  { path: 'courses/goals', name: 'course-goals', component: CourseGoalsView, meta: { title: '课程目标与指标点映射', roles: superAndTeacher } },
  { path: 'courses/teaching', name: 'course-teaching', component: CourseTeachingView, meta: { title: '教学内容与考核方式配置', roles: superOnly } },
  { path: 'teaching', name: 'teaching', component: ConfigCrudPageView, props: { pageKey: 'teaching' }, meta: { title: '授课任务分配', roles: superOnly } },
  { path: 'courses/resources', name: 'course-resources', component: CourseResourcesView, meta: { title: '课程资源管理', roles: superOnly } },
  { path: 'evaluation/materials', name: 'evaluation-materials', component: ConfigCrudPageView, props: { pageKey: 'evaluation-materials' }, meta: { title: '考核证据材料管理', roles: superAndTeacher } },
  { path: 'evaluation/scores', name: 'evaluation-scores', component: EvaluationScoresView, meta: { title: '按课程目标成绩管理', roles: superAndTeacher } },
  { path: 'achievement/model', name: 'achievement-model', component: ConfigCrudPageView, props: { pageKey: 'achievement-model' }, meta: { title: '达成度评价模型配置', roles: superOnly } },
  { path: 'achievement/course', name: 'achievement-course', component: AchievementCourseView, meta: { title: '课程目标达成度评价', roles: superOnly } },
  { path: 'achievement/graduate', name: 'achievement-graduate', component: AchievementGraduateView, meta: { title: '毕业要求达成度评价与预警', roles: superOnly } },
  { path: 'achievement/dashboard', name: 'achievement-dashboard', component: AchievementDashboardView, meta: { title: '达成度统计分析看板', roles: superOnly } },
  { path: 'survey', name: 'survey', component: ConfigCrudPageView, props: { pageKey: 'survey' }, meta: { title: '问卷设计与管理', roles: superOnly } },
  { path: 'survey/fill', name: 'survey-fill', component: SurveyFillView, meta: { title: '问卷填报与统计', roles: allRoles } },
  { path: 'improve', name: 'improve', component: ConfigCrudPageView, props: { pageKey: 'improve' }, meta: { title: '持续改进计划', roles: superAndTeacher } },
  { path: 'report', name: 'report', component: ReportView, meta: { title: '自评报告', roles: superAndTeacher } },
  { path: 'ai', name: 'ai', component: AiAssistantView, meta: { title: 'AI 助手', roles: superOnly } },
  { path: 'messages', name: 'messages', component: MessagesView, meta: { title: '消息通知中心', roles: allRoles } },
  { path: 'profile', name: 'profile', component: Profile, meta: { title: '个人设置', roles: allRoles } },
  { path: 'my-teaching', name: 'my-teaching', component: MyTeachingView, meta: { title: '我的授课任务', roles: teacherOnly } },
  { path: 'my-courses', name: 'my-courses', component: MyCoursesView, meta: { title: '课程资源管理', roles: teacherOnly } },
  { path: 'my-scores', name: 'my-scores', component: MyScoresView, meta: { title: '我的成绩', roles: studentOnly } },
  { path: 'my-achievement', name: 'my-achievement', component: MyAchievementView, meta: { title: '我的达成度报告', roles: studentOnly } },
  {
    path: 'records/:pageKey/:mode/:id',
    name: 'record-workspace',
    component: RecordWorkspaceView,
    props: true,
    meta: { title: '业务记录', roles: allRoles, hideInNav: true }
  }
];

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: AdminLayout,
    children: [{ path: '', redirect: '/dashboard' }, ...pageRoutes]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: '页面不存在', public: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const accessFallbackMap = {
  '/my-teaching': {
    [ROLES.SUPER]: '/teaching'
  },
  '/my-courses': {
    [ROLES.SUPER]: '/courses/resources'
  },
  '/my-scores': {
    [ROLES.SUPER]: '/evaluation/scores'
  },
  '/my-achievement': {
    [ROLES.SUPER]: '/achievement/course'
  }
};

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (to.meta.public && to.name === 'login' && userStore.isLoggedIn) {
    return getRoleHomePath(userStore.userInfo.role);
  }

  if (!to.meta.public && !userStore.isLoggedIn) {
    return '/login';
  }

  if (userStore.isLoggedIn && !userStore.userInfo.id) {
    try {
      await userStore.getUserInfo();
    } catch {
      userStore.logout();
      return '/login';
    }
  }

  const allowRoles = to.meta.roles || [];
  if (allowRoles.length && !allowRoles.includes(userStore.userInfo.role)) {
    ElMessage.warning('您没有权限访问此页面');
    return accessFallbackMap[to.path]?.[userStore.userInfo.role] || '/dashboard';
  }

  return true;
});

router.afterEach((to) => {
  const userStore = useUserStore();
  const navItem = resolveNavItem(String(to.query.from || to.path), userStore.userInfo.role);
  const recordTitle = typeof to.query.title === 'string' ? to.query.title : '';
  const pageTitle = to.name === 'record-workspace'
    ? `${recordTitle || navItem.label} ${to.params.mode === 'edit' ? '编辑' : '详情'}`
    : (to.meta.title || navs.find((item) => item.path === to.path)?.label || appTitle);

  document.title = `${pageTitle} - ${appTitle}`;
});

export default router;
