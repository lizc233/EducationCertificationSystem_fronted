<template>
  <div class="wrap">
    <aside class="side page-box">
      <div class="logo">
        <div class="logo-a">EC</div>
        <div>
          <div class="logo-t">工程教育认证系统</div>
          <div class="logo-s">前端演示</div>
        </div>
      </div>

      <div class="cycle page-box">
        <div class="c1">{{ cycle.name }}</div>
        <div class="c2">{{ cycle.term }}</div>
        <div class="c3">{{ cycle.locked ? '当前已锁定' : '当前可编辑' }}</div>
      </div>

      <div class="navs">
        <RouterLink
          v-for="it in list"
          :key="it.path"
          :to="it.path"
          class="nav-item"
          :class="{ on: route.path === it.path }"
        >
          <el-icon><component :is="icons[it.icon]" /></el-icon>
          <span>{{ it.label }}</span>
        </RouterLink>
      </div>
    </aside>

    <div class="main">
      <div class="head page-box">
        <div>
          <div class="top-title">{{ nowTitle }}</div>
          <div class="sub-txt">{{ cycle.term }}　{{ cycle.name }}</div>
        </div>
        <div class="rbox">
          <span :class="['small-tag', cycle.locked ? 'tag-yellow' : 'tag-green']">
            {{ cycle.locked ? '周期锁定' : '可编辑' }}
          </span>
          <span class="small-tag">{{ auth.user?.roleName || '未登录' }}</span>
          <span class="small-tag">{{ auth.user?.realName || '' }}</span>
          <el-button size="small" @click="quit">退出</el-button>
        </div>
      </div>

      <div v-if="cycle.locked" class="lock-tip page-box">
        {{ cycle.msg }}
      </div>

      <div class="body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { navs } from '../data/navigation';
import { canSee, cycle } from '../data/workspace';
import {
  Document,
  Files,
  Grid,
  Notebook,
  RefreshRight,
  School,
  Setting,
  TrendCharts
} from '@element-plus/icons-vue';

const icons = { Grid, Setting, School, Notebook, TrendCharts, Document, RefreshRight, Files };
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const list = computed(() => canSee(auth.role || 'admin'));
const nowTitle = computed(() => {
  if (route.path === '/dashboard') return '首页';
  const it = navs.find((v) => v.path === route.path);
  return it?.label || '模块';
});

function quit() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
}

.side {
  margin: 10px 0 10px 10px;
  padding: 10px;
  background: #fafbfc;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 2px 10px;
}

.logo-a {
  width: 38px;
  height: 38px;
  line-height: 38px;
  text-align: center;
  background: #4a78a8;
  color: #fff;
  font-weight: 700;
  border-radius: 4px;
}

.logo-t {
  font-size: 16px;
  font-weight: 600;
}

.logo-s {
  font-size: 12px;
  color: var(--sub);
}

.cycle {
  padding: 10px;
  margin-bottom: 12px;
  background: #fff;
}

.c1 {
  font-weight: 600;
  margin-bottom: 4px;
}

.c2,
.c3 {
  font-size: 12px;
  color: var(--sub);
}

.navs {
  display: grid;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 8px;
  color: #40464d;
  border: 1px solid transparent;
}

.nav-item.on {
  background: #eef3f8;
  border-color: #d5dfe9;
  color: #2f5d8a;
}

.main {
  padding: 10px 10px 10px 12px;
}

.head {
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  background: #fff;
}

.rbox {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lock-tip {
  padding: 8px 12px;
  margin-bottom: 11px;
  background: #fffdf6;
  border-color: #ead9b2;
  color: #8a631b;
}

.body {
  min-width: 0;
}

@media (max-width: 900px) {
  .wrap {
    grid-template-columns: 1fr;
  }

  .side {
    margin: 10px;
  }

  .head {
    display: block;
  }

  .rbox {
    margin-top: 10px;
  }
}
</style>
