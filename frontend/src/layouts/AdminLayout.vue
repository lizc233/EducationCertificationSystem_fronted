<template>
  <div class="app-shell portal-shell">
    <div ref="toplineRef" class="portal-topline">
      <div class="portal-topline__inner">
        <div class="portal-link-row">
          <span>工程教育认证智能服务系统</span>
          <span>统一身份认证</span>
          <span>业务消息中心</span>
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
            <el-button @click="router.push('/messages')">通知中心</el-button>
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

        <div class="portal-hero__aside">
          <article class="portal-aside-card">
            <div class="portal-aside-card__label">当前角色</div>
            <div class="portal-aside-card__value">{{ roleLabel }}</div>
            <div class="portal-aside-card__text">系统将根据当前登录角色自动过滤菜单、页面入口与操作权限。</div>
          </article>
          <article class="portal-aside-card">
            <div class="portal-aside-card__label">当前模块</div>
            <div class="portal-aside-card__value">{{ currentGroupMeta.label }}</div>
            <div class="portal-aside-card__text">一级导航定位业务域，二级导航直达功能页，所有交互统一跳转独立路由。</div>
          </article>
        </div>
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
import { fetchUnreadCount } from '../api/notice';
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
const unreadCount = ref(0);

const currentRole = computed(() => userStore.userInfo.role || ROLES.SUPER);
const resolvedNavPath = computed(() => resolveNavPath(String(route.query.from || route.path), currentRole.value, userStore.menuPaths));
const visibleGroups = computed(() => getVisibleNavGroups(currentRole.value, userStore.menuPaths));
const currentNav = computed(() => resolveNavItem(resolvedNavPath.value, currentRole.value, userStore.menuPaths));
const currentGroupMeta = computed(() => resolveNavGroup(resolvedNavPath.value, currentRole.value, userStore.menuPaths));
const currentGroup = computed(() => {
  return visibleGroups.value.find((group) => group.label === currentGroupMeta.value.label)
      || visibleGroups.value.find((group) => group.items.some((item) => item.path === resolvedNavPath.value))
      || visibleGroups.value[0]
      || { label: '工作台', items: [], defaultPath: '/dashboard' };
});
const showHero = computed(() => resolvedNavPath.value === '/dashboard');
const activePrimary = computed(() => currentGroup.value.defaultPath || visibleGroups.value[0]?.defaultPath || '/dashboard');
const activeSecondary = computed(() => {
  return currentGroup.value.items.some((item) => item.path === resolvedNavPath.value) ? resolvedNavPath.value : '';
});
const mainMinHeight = computed(() => `calc(100vh - ${chromeHeight.value}px)`);
const roleLabel = computed(() => ROLE_LABEL_MAP[currentRole.value] || '未分配角色');

const heroContent = computed(() => {
  if (currentRole.value === ROLES.TEACHER) {
    return {
      title: '聚焦授课执行、成绩录入与课程材料闭环',
      summary: '教师工作台只保留与本人教学直接相关的任务入口，让授课安排、成绩填报、资源上传和问卷反馈集中在同一工作流中。',
      tags: ['我的授课', '成绩录入', '课程资源', '教学待办']
    };
  }

  if (currentRole.value === ROLES.STUDENT) {
    return {
      title: '聚焦学业进度、成绩查询与参与反馈',
      summary: '学生视图突出课程成绩、达成度报告和问卷填报，减少无关管理入口，让信息获取更直接、更清晰。',
      tags: ['成绩查询', '达成度报告', '问卷填报', '学业进度']
    };
  }

  return {
    title: currentNav.value.label || '聚焦认证管理、过程监控与持续改进',
    summary: '管理员视图覆盖培养方案、课程体系、评价达成、问卷改进和自评报告等核心业务，形成一体化管理与监控闭环。',
    tags: ['全局监控', '方案治理', '达成分析', '报告中心']
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

async function syncUnreadCount() {
  const userId = userStore.userInfo.id;
  if (!userId) {
    unreadCount.value = 0;
    return;
  }
  unreadCount.value = Number(await fetchUnreadCount(userId) || 0);
}

function handleUnreadCountChanged(event) {
  unreadCount.value = Number(event?.detail ?? 0);
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

  await userStore.logout();
  await router.replace({ path: '/login', query: { reset: String(Date.now()) } });
}

onMounted(async () => {
  await nextTick();
  computeChromeHeight();
  await syncUnreadCount();
  window.addEventListener('resize', computeChromeHeight);
  window.addEventListener('notice-unread-changed', handleUnreadCountChanged);
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    computeChromeHeight();
    await syncUnreadCount();
  }
);

watch(
  () => userStore.userInfo.id,
  async () => {
    await syncUnreadCount();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeChromeHeight);
  window.removeEventListener('notice-unread-changed', handleUnreadCountChanged);
});
</script>
