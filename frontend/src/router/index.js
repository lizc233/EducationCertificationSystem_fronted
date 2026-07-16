import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import ModulePlaceholder from '../views/ModulePlaceholder.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'module/:name', name: 'module', component: ModulePlaceholder, props: true }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!auth.token && to.name !== 'login') return '/login';
  if (auth.token && to.name === 'login') return '/dashboard';
});

export default router;
