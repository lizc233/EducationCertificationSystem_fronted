<template>
  <el-container class="page-shell">
    <el-aside width="248px" class="aside glass">
      <div class="brand">
        <div class="brand-mark">EC</div>
        <div>
          <div class="brand-title">认证智服系统</div>
          <div class="brand-sub">Vue 3 + Vite</div>
        </div>
      </div>

      <el-menu
        class="menu"
        router
        :default-active="$route.path"
        background-color="transparent"
        text-color="#e8ecf6"
        active-text-color="#ff8a00"
      >
        <el-menu-item v-for="item in navigation" :key="item.path" :index="item.path">
          <el-icon><component :is="icons[item.icon]" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main">
      <el-header class="header glass">
        <div class="header-left">
          <strong>{{ pageTitle }}</strong>
        </div>
        <div class="header-right">
          <span class="user-chip">{{ auth.user?.realName || '未登录' }}</span>
          <el-button size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { navigation } from '../data/navigation';
import {
  Grid,
  Setting,
  School,
  Notebook,
  TrendCharts,
  Document,
  RefreshRight,
  Files,
  MagicStick
} from '@element-plus/icons-vue';

const icons = { Grid, Setting, School, Notebook, TrendCharts, Document, RefreshRight, Files, MagicStick };
const auth = useAuthStore();
const router = useRouter();

const pageTitle = computed(() => navigation.find((item) => item.path === router.currentRoute.value.path)?.label || '总览');

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.aside {
  margin: 16px 0 16px 16px;
  border-radius: 24px;
  padding: 18px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 18px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #111827;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
}

.brand-title {
  color: var(--text);
  font-weight: 700;
}

.brand-sub {
  color: var(--text-dim);
  font-size: 12px;
}

.menu {
  border-right: 0;
}

.main {
  min-width: 0;
}

.header {
  margin: 16px 16px 12px 0;
  border-radius: 24px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-chip {
  color: var(--text);
  opacity: 0.92;
}

.content {
  padding: 0 16px 16px 0;
}
</style>
