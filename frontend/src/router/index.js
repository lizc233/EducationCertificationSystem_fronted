import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { navs } from '../data/navigation';
import LoginView from '../views/LoginView.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import ModulePlaceholder from '../views/ModulePlaceholder.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { title: '登录' } },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '首页' } },
      { path: 'module/:name', name: 'module', component: ModulePlaceholder, props: true }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.token && to.name !== 'login') return '/login';
  if (auth.token && !auth.user) {
    try {
      await auth.getMe();
    } catch {
      auth.logout();
      return '/login';
    }
  }
  if (auth.token && to.name === 'login') return '/dashboard';
  if (to.name === 'module') {
    const item = navs.find((v) => v.key === to.params.name);
    if (!item) return '/dashboard';
    if (!auth.can(item.roles)) return '/dashboard';
  }
});

router.afterEach((to) => {
  if (to.name === 'module') {
    const item = navs.find((v) => v.key === to.params.name);
    document.title = `${item?.label || '模块'} - 工程教育认证系统`;
    return;
  }
  document.title = `${to.meta.title || '工程教育认证系统'} - 工程教育认证系统`;
});

export default router;
