<template>
  <div :class="['standard-page', `standard-page--${moduleTheme.key}`]">
    <header class="page-header">
      <div class="page-header__main">
        <el-breadcrumb v-if="breadcrumbItems.length">
          <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item">
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="page-header__headline">
          <div class="page-header__eyebrow">{{ moduleTheme.eyebrow }}</div>
          <h2 class="page-header__title">{{ title }}</h2>
        </div>
        <p v-if="description" class="page-header__description">{{ description }}</p>
      </div>
      <div class="page-header__aside">
        <div class="page-header__identity">
          <div class="page-header__identity-label">{{ moduleTheme.label }}</div>
          <div class="page-header__identity-code">{{ moduleTheme.code }}</div>
        </div>
        <div v-if="$slots.actions" class="page-header__actions">
          <slot name="actions" />
        </div>
      </div>
    </header>

    <section v-if="$slots.filters" class="filter-panel">
      <slot name="filters" />
    </section>

    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { buildBreadcrumbs, resolveNavGroup } from '../../data/navigationV2';
import { useUserStore } from '../../store/user';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  },
  description: {
    type: String,
    default: ''
  }
});

const route = useRoute();
const userStore = useUserStore();

const MODULE_THEME_MAP = {
  工作台: { key: 'workbench', label: '工作台模块', eyebrow: '系统工作台', code: 'WB-01' },
  基础管理: { key: 'basic', label: '基础管理', eyebrow: '基础业务', code: 'BM-02' },
  '方案与课程': { key: 'scheme', label: '方案与课程', eyebrow: '方案课程', code: 'PC-03' },
  '评价与达成': { key: 'evaluation', label: '评价与达成', eyebrow: '评价分析', code: 'EA-04' },
  '选课与成绩': { key: 'score', label: '选课与成绩', eyebrow: '选课成绩', code: 'SR-05' },
  '问卷与改进': { key: 'improve', label: '问卷与改进', eyebrow: '问卷改进', code: 'FI-06' },
  报告中心: { key: 'report', label: '报告中心', eyebrow: '报告中心', code: 'RC-07' },
  用户管理: { key: 'user-admin', label: '用户管理', eyebrow: '账号治理', code: 'UM-08' },
  我的工作台: { key: 'teacher-workbench', label: '我的工作台', eyebrow: '教学事务', code: 'TW-09' },
  成绩管理: { key: 'score', label: '成绩管理', eyebrow: '成绩事务', code: 'SM-10' },
  我的学习: { key: 'student', label: '我的学习', eyebrow: '学习服务', code: 'ST-11' },
  课程评价: { key: 'student', label: '课程评价', eyebrow: '课程评价', code: 'CE-12' },
  问卷填报: { key: 'survey', label: '问卷填报', eyebrow: '问卷服务', code: 'SV-13' }
};

const currentRole = computed(() => userStore.userInfo.role);

const breadcrumbItems = computed(() => {
  if (props.breadcrumbs.length) {
    return props.breadcrumbs;
  }

  return buildBreadcrumbs(
    String(route.query.from || route.path),
    props.title ? [props.title] : [],
    currentRole.value,
    userStore.menuPaths
  );
});

const moduleTheme = computed(() => {
  const group = resolveNavGroup(String(route.query.from || route.path), currentRole.value, userStore.menuPaths);
  return MODULE_THEME_MAP[group.label] || MODULE_THEME_MAP.工作台;
});
</script>
