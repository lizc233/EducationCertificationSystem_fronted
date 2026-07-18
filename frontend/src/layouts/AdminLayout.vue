<template>
  <div class="app-shell portal-shell">
    <div ref="toplineRef" class="portal-topline">
      <div class="portal-topline__inner">
        <div class="portal-link-row">
          <span>工程教育认证智能服务系统</span>
          <span>统一身份认证</span>
          <span>消息与待办</span>
        </div>
        <div class="portal-tool-row">
          <span>{{ todayLabel }}</span>
          <span>{{ roleLabel }}</span>
          <span>{{ roleSlogan }}</span>
        </div>
      </div>
    </div>

    <header ref="headerRef" class="portal-header">
      <div class="portal-header__inner">
        <div class="portal-brand">
          <div class="portal-brand__seal">工教</div>
          <div class="portal-brand__text">
            <div class="portal-brand__en">教学管理与认证服务平台</div>
            <h1 class="portal-brand__title">工程教育认证智能服务系统</h1>
            <p class="portal-brand__sub">
              围绕培养方案、课程建设、评价达成、选课成绩、问卷改进与报告编制提供统一业务入口。
            </p>
          </div>
        </div>

        <div class="portal-header__tools">
          <div class="portal-search">
            <el-input
              v-model.trim="searchKeyword"
              placeholder="搜索功能页面、模块或关键字"
              @keydown.enter.prevent="goSearch"
            >
              <template #append>
                <el-button @click="goSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
          <el-badge :value="unreadCount">
            <el-button @click="router.push('/messages')">消息通知</el-button>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <el-button type="primary">{{ userStore.userInfo.realName || '未登录用户' }}</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <div ref="primaryNavRef" class="portal-nav portal-nav--primary">
      <div class="portal-nav__inner">
        <el-menu
          :default-active="activePrimary"
          class="portal-menu"
          mode="horizontal"
          :ellipsis="false"
          @select="handlePrimarySelect"
        >
          <el-menu-item
            v-for="group in visibleGroups"
            :key="group.label"
            :index="group.defaultPath"
          >
            {{ group.label }}
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <div ref="secondaryNavRef" class="portal-nav portal-nav--secondary">
      <div class="portal-nav__inner">
        <el-menu
          :default-active="activeSecondary"
          class="portal-menu portal-menu--secondary"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSecondarySelect"
        >
          <el-menu-item
            v-for="item in currentGroup.items"
            :key="item.key"
            :index="item.path"
          >
            {{ item.label }}
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <section v-if="showHero" class="portal-hero">
      <div class="portal-hero__inner portal-hero__inner--single">
        <article class="portal-hero__headline">
          <div class="portal-hero__eyebrow">系统首页</div>
          <h2 class="portal-hero__title">{{ heroContent.title }}</h2>
          <p class="portal-hero__summary">{{ heroContent.summary }}</p>
          <div class="portal-hero__meta">
            <span
              v-for="tag in heroContent.tags"
              :key="tag"
              class="portal-chip"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <main class="portal-main" :style="{ minHeight: mainMinHeight }">
      <router-view />
    </main>

    <footer ref="footerRef" class="portal-footer">
      <div class="portal-footer__inner">
        <span>© 2026 工程教育认证智能服务系统. All Rights Reserved.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { countUnreadMessages } from '../data/messages';
import {
  getSearchableNavItems,
  getVisibleNavGroups,
  resolveNavGroup,
  resolveNavItem,
  resolveNavPath,
  ROLES
} from '../data/navigation';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const searchKeyword = ref('');
const toplineRef = ref();
const headerRef = ref();
const primaryNavRef = ref();
const secondaryNavRef = ref();
const footerRef = ref();
const chromeHeight = ref(0);

const currentRole = computed(() => userStore.userInfo.role || ROLES.SUPER);
const resolvedNavPath = computed(() => resolveNavPath(String(route.query.from || route.path), currentRole.value, userStore.menuPaths));
const visibleGroups = computed(() => getVisibleNavGroups(currentRole.value, userStore.menuPaths));
const currentNav = computed(() => resolveNavItem(resolvedNavPath.value, currentRole.value, userStore.menuPaths));
const currentGroupMeta = computed(() => resolveNavGroup(resolvedNavPath.value, currentRole.value, userStore.menuPaths));
const currentGroup = computed(() => {
  return visibleGroups.value.find((group) => group.label === currentGroupMeta.value.label)
    || visibleGroups.value.find((group) => group.items.some((item) => item.path === resolvedNavPath.value))
    || visibleGroups.value[0]
    || { label: '首页概览', items: [], defaultPath: '/dashboard' };
});
const showHero = computed(() => resolvedNavPath.value === '/dashboard');
const activePrimary = computed(() => currentGroup.value.defaultPath || visibleGroups.value[0]?.defaultPath || '/dashboard');
const activeSecondary = computed(() => {
  return currentGroup.value.items.some((item) => item.path === resolvedNavPath.value) ? resolvedNavPath.value : '';
});
const mainMinHeight = computed(() => `calc(100vh - ${chromeHeight.value}px)`);
const unreadCount = computed(() => countUnreadMessages());
const roleLabel = computed(() => ROLE_LABEL_MAP[currentRole.value] || '未分配角色');

const heroContent = computed(() => {
  if (currentRole.value === ROLES.TEACHER) {
    return {
      title: '教学工作总览',
      summary: '集中处理课程安排、成绩提交、课程资源、课表提醒与学生反馈，保持教学事项闭环办理。',
      tags: ['课程任务', '成绩提交', '教学通知', '反馈查看']
    };
  }

  if (currentRole.value === ROLES.STUDENT) {
    return {
      title: '学习服务总览',
      summary: '集中查看选课、课表、成绩、课程公告与学业进度，常用学习事项在同一入口完成。',
      tags: ['选课办理', '成绩查询', '学习进度', '课程评价']
    };
  }

  return {
    title: '认证业务管理总览',
    summary: '集中查看培养方案、课程建设、评价分析、选课成绩、问卷改进与报告工作，支持全局管理与过程监控。',
    tags: ['统一入口', '业务联动', '过程留痕', '数据总览']
  };
});

const roleSlogan = computed(() => {
  if (currentRole.value === ROLES.TEACHER) {
    return '教学执行视图';
  }

  if (currentRole.value === ROLES.STUDENT) {
    return '学习服务视图';
  }

  return '管理监控视图';
});

const todayLabel = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
});

function computeChromeHeight() {
  chromeHeight.value = [
    toplineRef.value,
    headerRef.value,
    primaryNavRef.value,
    secondaryNavRef.value,
    footerRef.value
  ].reduce((total, element) => total + (element?.offsetHeight || 0), 0);
}

function handlePrimarySelect(path) {
  if (path && path !== route.path) {
    router.push(path);
  }
}

function handleSecondarySelect(path) {
  if (path && path !== route.path) {
    router.push(path);
  }
}

function goSearch() {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    ElMessage.warning('请输入搜索关键字');
    return;
  }

  const hit = getSearchableNavItems(currentRole.value, userStore.menuPaths).find((item) => {
    return item.label.includes(keyword) || item.summary.includes(keyword) || item.groupLabel.includes(keyword);
  });

  if (!hit) {
    ElMessage.warning('未找到匹配页面');
    return;
  }

  router.push(hit.path);
}

async function handleCommand(command) {
  if (command === 'profile') {
    await router.push('/profile');
    return;
  }

  userStore.logout();
  await router.push({ path: '/login', query: { reset: String(Date.now()) } });
}

onMounted(async () => {
  await nextTick();
  computeChromeHeight();
  window.addEventListener('resize', computeChromeHeight);
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    computeChromeHeight();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeChromeHeight);
});
</script>
