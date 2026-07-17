<template>
  <div class="app-shell portal-shell">
    <div ref="toplineRef" class="portal-topline">
      <div class="portal-topline__inner">
        <div class="portal-link-row">
          <span>访客</span>
          <span>校友</span>
          <span>人才招聘</span>
          <span>图书馆</span>
          <span>信息公开</span>
        </div>
        <div class="portal-tool-row">
          <span>{{ todayLabel }}</span>
          <span>{{ roleLabel }}</span>
          <span>工程教育认证办公室</span>
        </div>
      </div>
    </div>

    <header ref="headerRef" class="portal-header">
      <div class="portal-header__inner">
        <div class="portal-brand">
          <div class="portal-brand__seal">THU</div>
          <div class="portal-brand__text">
            <div class="portal-brand__en">Engineering Education Accreditation</div>
            <h1 class="portal-brand__title">工程教育认证系统</h1>
            <p class="portal-brand__sub">工程教育认证系统 v1.0 | 清华大学工程教育认证办公室</p>
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
          <el-badge :value="6">
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
            :key="item.path"
            :index="item.path"
          >
            {{ item.label }}
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <section class="portal-hero">
      <div class="portal-hero__inner">
        <article class="portal-hero__headline">
          <div class="portal-hero__eyebrow">Engineering Education Accreditation</div>
          <h2 class="portal-hero__title">{{ currentNav?.label || '工程教育认证系统' }}</h2>
          <p class="portal-hero__summary">
            {{ currentNav?.summary || '围绕培养方案、课程体系、达成度评价、问卷改进和自评报告等核心业务，提供统一的认证工作平台。' }}
          </p>
          <div class="portal-hero__meta">
            <span class="portal-chip">统一路由页面</span>
            <span class="portal-chip">业务模块化导航</span>
            <span class="portal-chip">过程数据可视化</span>
          </div>
        </article>

        <div class="portal-hero__aside">
          <article class="portal-aside-card">
            <div class="portal-aside-card__label">当前角色</div>
            <div class="portal-aside-card__value">{{ roleLabel }}</div>
            <div class="portal-aside-card__text">根据角色权限自动显示可访问模块和菜单项。</div>
          </article>
          <article class="portal-aside-card">
            <div class="portal-aside-card__label">当前模块</div>
            <div class="portal-aside-card__value">{{ currentGroup.label }}</div>
            <div class="portal-aside-card__text">一级导航定位业务域，二级导航直达功能页面。</div>
          </article>
        </div>
      </div>
    </section>

    <main class="portal-main" :style="{ minHeight: mainMinHeight }">
      <router-view />
    </main>

    <footer ref="footerRef" class="portal-footer">
      <div class="portal-footer__inner">
        <span>© 2026 工程教育认证系统. All Rights Reserved.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { navGroups, navs, resolveNavGroup, resolveNavPath } from '../data/navigation';
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

const resolvedNavPath = computed(() => resolveNavPath(String(route.query.from || route.path)));

const visibleGroups = computed(() =>
  navGroups
    .map((group) => {
      const items = group.items.filter((item) => item.roles.includes(userStore.userInfo.role));
      return {
        ...group,
        items,
        defaultPath: items[0]?.path || ''
      };
    })
    .filter((group) => group.items.length)
);

const currentNav = computed(() => navs.find((item) => item.path === resolvedNavPath.value));
const currentGroup = computed(() => {
  return resolveNavGroup(resolvedNavPath.value);
});
const activePrimary = computed(() => currentGroup.value.items[0]?.path || '/dashboard');
const activeSecondary = computed(() => resolvedNavPath.value);
const mainMinHeight = computed(() => `calc(100vh - ${chromeHeight.value}px)`);

const roleLabel = computed(() => ROLE_LABEL_MAP[userStore.userInfo.role] || '未分配角色');
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

  const hit = navs.find((item) => item.label.includes(keyword) || item.summary.includes(keyword));
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
  await router.push('/login');
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
