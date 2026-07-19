import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRoleHomePath, navs, resolveNavItem, ROLES } from '../data/navigationV2';
import { useUserStore } from '../store/user';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import Profile from '../views/Profile.vue';
import NotFound from '../views/error/NotFound.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import ConfigCrudPageView from '../views/pages/ConfigCrudPageView.vue';
import ProgramVersionsView from '../views/pages/ProgramVersionsView.vue';
import ProgramGoalsView from '../views/pages/ProgramGoalsView.vue';
import ProgramCoursesView from '../views/pages/ProgramCoursesView.vue';
import CourseLibraryView from '../views/pages/CourseLibraryView.vue';
import CourseGoalsView from '../views/pages/CourseGoalsView.vue';
import CourseTeachingView from '../views/pages/CourseTeachingView.vue';
import TeachingTasksView from '../views/pages/TeachingTasksView.vue';
import CourseResourcesView from '../views/pages/CourseResourcesView.vue';
import EvidenceMaterialsView from '../views/pages/EvidenceMaterialsView.vue';
import EvaluationScoresView from '../views/pages/EvaluationScoresView.vue';
import MessagesView from '../views/pages/MessagesView.vue';
import AchievementModelView from '../views/pages/AchievementModelView.vue';
import AchievementCourseView from '../views/pages/AchievementCourseView.vue';
import AchievementGraduateView from '../views/pages/AchievementGraduateView.vue';
import AchievementDashboardView from '../views/pages/AchievementDashboardView.vue';
import SurveyManagementView from '../views/pages/SurveyManagementWorkbenchAdminView.vue';
import SurveyFillView from '../views/pages/SurveyFillWorkbenchView.vue';
import ImprovePlanView from '../views/pages/ImprovePlanView.vue';
import ReportView from '../views/pages/ReportView.vue';
import AiAssistantView from '../views/pages/AiAssistantView.vue';
import RecordWorkspaceView from '../views/pages/RecordWorkspaceView.vue';
import MyTeachingView from '../views/pages/MyTeachingView.vue';
import MyCoursesView from '../views/pages/MyCoursesView.vue';
import MyScoresView from '../views/pages/MyScoresView.vue';
import MyAchievementView from '../views/pages/MyAchievementView.vue';
import CourseSelectionManagementView from '../views/pages/CourseSelectionManagementView.vue';
import ScoreAuditView from '../views/pages/ScoreAuditView.vue';
import AnnouncementsView from '../views/pages/AnnouncementsView.vue';
import CourseStudentsView from '../views/pages/CourseStudentsView.vue';
import MyScheduleView from '../views/pages/MyScheduleView.vue';
import CourseAnnouncementsView from '../views/pages/CourseAnnouncementsView.vue';
import TeachingFeedbackView from '../views/pages/TeachingFeedbackView.vue';
import CourseSelectionView from '../views/pages/CourseSelectionView.vue';
import CourseAnnouncementsFeedView from '../views/pages/CourseAnnouncementsFeedView.vue';
import AcademicProgressView from '../views/pages/AcademicProgressView.vue';
import CourseEvaluateView from '../views/pages/CourseEvaluateView.vue';
import SystemParamsView from '../views/pages/SystemParamsView.vue';
import SystemLogsView from '../views/pages/SystemLogsView.vue';
import DictManageView from '../views/pages/DictManageView.vue';
import OrgBindingsManagementView from '../views/pages/OrgBindingsManagementView.vue';
import UserManageView from '../views/UserManage.vue';

const appTitle = '工程教育认证智能服务系统';
const allRoles = [ROLES.SUPER, ROLES.TEACHER, ROLES.STUDENT];
const superOnly = [ROLES.SUPER];
const teacherOnly = [ROLES.TEACHER];
const studentOnly = [ROLES.STUDENT];
const teacherAndStudent = [ROLES.TEACHER, ROLES.STUDENT];
const superAndTeacher = [ROLES.SUPER, ROLES.TEACHER];

const pageRoutes = [
  { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '首页概览', roles: allRoles } },
  { path: 'users', name: 'users', component: UserManageView, meta: { title: '用户管理', roles: superOnly } },
  {
    path: 'users/teacher-bindings',
    name: 'user-teacher-bindings',
    component: OrgBindingsManagementView,
    props: { initialTab: 'teachers', pageTitle: '教师档案绑定', breadcrumbs: ['首页', '用户管理', '教师档案绑定'] },
    meta: { title: '教师档案绑定', roles: superOnly }
  },
  {
    path: 'users/student-bindings',
    name: 'user-student-bindings',
    component: OrgBindingsManagementView,
    props: { initialTab: 'students', pageTitle: '学生档案绑定', breadcrumbs: ['首页', '用户管理', '学生档案绑定'] },
    meta: { title: '学生档案绑定', roles: superOnly }
  },
  { path: 'params', name: 'params', component: SystemParamsView, meta: { title: '系统参数', roles: superOnly } },
  { path: 'dicts', name: 'dicts', component: DictManageView, meta: { title: '数据字典', roles: superOnly } },
  { path: 'logs', name: 'logs', component: SystemLogsView, meta: { title: '操作日志', roles: superOnly } },
  { path: 'announcements', name: 'announcements', component: AnnouncementsView, meta: { title: '系统公告管理', roles: superOnly } },
  { path: 'program', name: 'program', component: ConfigCrudPageView, props: { pageKey: 'program' }, meta: { title: '方案管理', roles: superOnly } },
  { path: 'program/goals', name: 'program-goals', component: ProgramGoalsView, meta: { title: '培养目标与毕业要求', roles: superOnly } },
  { path: 'program/courses', name: 'program-courses', component: ProgramCoursesView, meta: { title: '课程体系与支撑矩阵', roles: superOnly } },
  { path: 'courses', name: 'courses', component: ConfigCrudPageView, props: { pageKey: 'courses' }, meta: { title: '课程管理', roles: superOnly } },
  { path: 'courses/goals', name: 'course-goals', component: CourseGoalsView, meta: { title: '课程目标与指标点映射', roles: superAndTeacher } },
  { path: 'courses/teaching', name: 'course-teaching', component: CourseTeachingView, meta: { title: '教学内容与考核方式配置', roles: superOnly } },
  { path: 'teaching', name: 'teaching', component: ConfigCrudPageView, props: { pageKey: 'teaching' }, meta: { title: '授课任务分配', roles: superOnly } },
  { path: 'courses/resources', name: 'course-resources', component: CourseResourcesView, meta: { title: '课程资源管理', roles: superOnly } },
  { path: 'evaluation/materials', name: 'evaluation-materials', component: ConfigCrudPageView, props: { pageKey: 'evaluation-materials' }, meta: { title: '考核证据材料管理', roles: superAndTeacher } },
  { path: 'evaluation/scores', name: 'evaluation-scores', component: EvaluationScoresView, meta: { title: '按课程目标成绩管理', roles: superOnly } },
  { path: 'achievement/model', name: 'achievement-model', component: AchievementModelView, meta: { title: '达成度评价模型配置', roles: superOnly } },
  { path: 'achievement/course', name: 'achievement-course', component: AchievementCourseView, meta: { title: '课程目标达成度评价', roles: superOnly } },
  { path: 'achievement/graduate', name: 'achievement-graduate', component: AchievementGraduateView, meta: { title: '毕业要求达成度评价与预警', roles: superOnly } },
  { path: 'achievement/dashboard', name: 'achievement-dashboard', component: AchievementDashboardView, meta: { title: '达成度统计分析看板', roles: superOnly } },
  { path: 'course-selection-management', name: 'course-selection-management', component: CourseSelectionManagementView, meta: { title: '选课管理', roles: superOnly } },
  { path: 'score-audit', name: 'score-audit', component: ScoreAuditView, meta: { title: '成绩审核', roles: superOnly } },
  { path: 'survey', name: 'survey', component: SurveyManagementView, meta: { title: '问卷设计与管理', roles: superOnly } },
  { path: 'survey/fill', name: 'survey-fill', component: SurveyFillView, meta: { title: '问卷填报与统计', roles: allRoles } },
  { path: 'improve', name: 'improve', component: ImprovePlanView, meta: { title: '持续改进计划', roles: superAndTeacher } },
  { path: 'report', name: 'report', component: ReportView, meta: { title: '自评报告', roles: superAndTeacher } },
  { path: 'ai', name: 'ai', component: AiAssistantView, meta: { title: 'AI 助手', roles: superOnly } },
  { path: 'messages', name: 'messages', component: MessagesView, meta: { title: '消息通知中心', roles: allRoles } },
  { path: 'profile', name: 'profile', component: Profile, meta: { title: '个人设置', roles: allRoles } },
  { path: 'my-teaching', name: 'my-teaching', component: MyTeachingView, meta: { title: '我的授课任务', roles: teacherOnly } },
  { path: 'my-courses', name: 'my-courses', component: MyCoursesView, meta: { title: '我的课程', roles: [ROLES.TEACHER, ROLES.STUDENT] } },
  { path: 'my-schedule', name: 'my-schedule', component: MyScheduleView, meta: { title: '我的课表', roles: teacherAndStudent } },
  { path: 'course-students', name: 'course-students', component: CourseStudentsView, meta: { title: '课程学生名单', roles: teacherOnly } },
  { path: 'course-announcements', name: 'course-announcements', component: CourseAnnouncementsView, meta: { title: '课程公告', roles: teacherOnly } },
  { path: 'score-input', name: 'score-input', component: EvaluationScoresView, meta: { title: '成绩录入与提交', roles: teacherOnly } },
  { path: 'teaching-feedback', name: 'teaching-feedback', component: TeachingFeedbackView, meta: { title: '教学反馈查看', roles: teacherOnly } },
  { path: 'course-selection', name: 'course-selection', component: CourseSelectionView, meta: { title: '选课中心', roles: studentOnly } },
  { path: 'course-announcements-view', name: 'course-announcements-view', component: CourseAnnouncementsFeedView, meta: { title: '课程公告查看', roles: studentOnly } },
  { path: 'my-scores', name: 'my-scores', component: MyScoresView, meta: { title: '我的成绩', roles: studentOnly } },
  { path: 'academic-progress', name: 'academic-progress', component: AcademicProgressView, meta: { title: '学业进度', roles: studentOnly } },
  { path: 'my-achievement', name: 'my-achievement', component: MyAchievementView, meta: { title: '我的达成度报告', roles: studentOnly } },
  { path: 'course-evaluate', name: 'course-evaluate', component: CourseEvaluateView, meta: { title: '课程评价', roles: studentOnly } },
  {
    path: 'records/:pageKey/:mode/:id',
    name: 'record-workspace',
    component: RecordWorkspaceView,
    props: true,
    meta: { title: '业务记录', roles: allRoles, hideInNav: true }
  }
];

for (const route of pageRoutes) {
  switch (route.name) {
    case 'program':
      route.component = ProgramVersionsView;
      delete route.props;
      break;
    case 'courses':
      route.component = CourseLibraryView;
      delete route.props;
      break;
    case 'teaching':
      route.component = TeachingTasksView;
      delete route.props;
      break;
    case 'evaluation-materials':
      route.component = EvidenceMaterialsView;
      delete route.props;
      break;
    default:
      break;
  }
}

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
  '/my-teaching': { [ROLES.SUPER]: '/teaching', [ROLES.STUDENT]: '/dashboard' },
  '/my-courses': { [ROLES.SUPER]: '/courses/resources' },
  '/my-schedule': { [ROLES.SUPER]: '/dashboard' },
  '/course-students': { [ROLES.SUPER]: '/teaching', [ROLES.STUDENT]: '/dashboard' },
  '/course-announcements': { [ROLES.SUPER]: '/announcements', [ROLES.STUDENT]: '/course-announcements-view' },
  '/score-input': { [ROLES.SUPER]: '/evaluation/scores', [ROLES.STUDENT]: '/dashboard' },
  '/teaching-feedback': { [ROLES.SUPER]: '/survey/fill', [ROLES.STUDENT]: '/dashboard' },
  '/course-selection': { [ROLES.SUPER]: '/course-selection-management', [ROLES.TEACHER]: '/dashboard' },
  '/course-announcements-view': { [ROLES.SUPER]: '/announcements', [ROLES.TEACHER]: '/course-announcements' },
  '/my-scores': { [ROLES.SUPER]: '/evaluation/scores', [ROLES.TEACHER]: '/score-input' },
  '/academic-progress': { [ROLES.SUPER]: '/achievement/dashboard', [ROLES.TEACHER]: '/dashboard' },
  '/my-achievement': { [ROLES.SUPER]: '/achievement/course', [ROLES.TEACHER]: '/report' },
  '/course-evaluate': { [ROLES.SUPER]: '/survey/fill', [ROLES.TEACHER]: '/teaching-feedback' },
  '/course-selection-management': { [ROLES.TEACHER]: '/dashboard', [ROLES.STUDENT]: '/course-selection' },
  '/score-audit': { [ROLES.TEACHER]: '/score-input', [ROLES.STUDENT]: '/my-scores' },
  '/announcements': { [ROLES.TEACHER]: '/course-announcements', [ROLES.STUDENT]: '/course-announcements-view' },
  '/users': { [ROLES.TEACHER]: '/dashboard', [ROLES.STUDENT]: '/dashboard' },
  '/users/teacher-bindings': { [ROLES.TEACHER]: '/dashboard', [ROLES.STUDENT]: '/dashboard' },
  '/users/student-bindings': { [ROLES.TEACHER]: '/dashboard', [ROLES.STUDENT]: '/dashboard' },
  '/dicts': { [ROLES.TEACHER]: '/dashboard', [ROLES.STUDENT]: '/dashboard' }
};

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (to.meta.public && to.name === 'login' && userStore.isLoggedIn) {
    return getRoleHomePath(userStore.userInfo.role, userStore.menuPaths);
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

  const allowPaths = userStore.menuPaths || [];
  const allowRoles = to.meta.roles || [];
  if (allowRoles.length && !allowRoles.includes(userStore.userInfo.role)) {
    ElMessage.warning('您没有权限访问此页面');
    return accessFallbackMap[to.path]?.[userStore.userInfo.role] || getRoleHomePath(userStore.userInfo.role, allowPaths);
  }

  if (!to.meta.public && !to.meta.hideInNav && allowPaths.length && !allowPaths.includes(to.path)) {
    ElMessage.warning('您没有权限访问此页面');
    return accessFallbackMap[to.path]?.[userStore.userInfo.role] || getRoleHomePath(userStore.userInfo.role, allowPaths);
  }

  return true;
});

router.afterEach((to) => {
  const userStore = useUserStore();
  const navItem = resolveNavItem(String(to.query.from || to.path), userStore.userInfo.role, userStore.menuPaths);
  const recordTitle = typeof to.query.title === 'string' ? to.query.title : '';
  const pageTitle = to.name === 'record-workspace'
    ? `${recordTitle || navItem.label} ${to.params.mode === 'edit' ? '编辑' : '详情'}`
    : (to.meta.title || navs.find((item) => item.path === to.path)?.label || appTitle);

  document.title = `${pageTitle} - ${appTitle}`;
});

export default router;
