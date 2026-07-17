<template>
  <StandardPage title="首页概览" :breadcrumbs="['首页', '首页概览']" description="聚合展示认证工作关键数据、待办任务和业务入口。">
    <template #actions>
      <el-button type="primary" @click="router.push('/report')">进入自评报告</el-button>
      <el-button @click="router.push('/achievement/dashboard')">查看统计看板</el-button>
    </template>

    <div class="info-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-card">
        <div class="metric-card__label">{{ item.label }}</div>
        <div class="metric-card__value">{{ item.value }}</div>
        <div class="metric-card__trend" :class="item.trend > 0 ? 'is-up' : 'is-down'">
          {{ item.trend > 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
        </div>
        <div class="metric-card__sub">{{ item.sub }}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <SectionCard title="快捷入口">
        <div class="feature-links">
          <button
            v-for="item in quickEntries"
            :key="item.path"
            type="button"
            class="feature-link-card"
            @click="router.push(item.path)"
          >
            <div class="feature-link-card__eyebrow">{{ item.group }}</div>
            <div class="feature-link-card__title">{{ item.label }}</div>
            <div class="feature-link-card__desc">{{ item.summary }}</div>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="通知公告">
        <div class="list-panel">
          <button
            v-for="item in notices"
            :key="item.id"
            type="button"
            class="list-item dashboard-action"
            @click="router.push({ path: '/messages', query: { id: String(item.id) } })"
          >
            <div class="dashboard-action__row">
              <div>
                <div class="dashboard-action__title">{{ item.title }}</div>
                <div class="dashboard-action__desc">{{ item.desc }}</div>
              </div>
              <div class="dashboard-action__time">{{ item.time }}</div>
            </div>
          </button>
        </div>
      </SectionCard>
    </div>

    <div class="dashboard-grid dashboard-grid--equal">
      <SectionCard title="待办任务">
        <div class="list-panel">
          <article v-for="item in todos" :key="item.title" class="list-item">
            <div class="dashboard-action__row">
              <div>
                <div class="dashboard-action__title">{{ item.title }}</div>
                <div class="dashboard-action__desc">{{ item.owner }} | 截止 {{ item.deadline }}</div>
              </div>
              <el-tag :type="priorityTagType[item.priority]">{{ item.priority }}</el-tag>
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="系统信息">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前学期">2025-2026 学年第二学期</el-descriptions-item>
          <el-descriptions-item label="方案版本">2025 版培养方案 V2.0</el-descriptions-item>
          <el-descriptions-item label="登录角色">{{ roleLabel }}</el-descriptions-item>
          <el-descriptions-item label="登录院系">{{ userStore.userInfo.department }}</el-descriptions-item>
          <el-descriptions-item label="最近同步">2026-07-17 09:30</el-descriptions-item>
        </el-descriptions>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StandardPage from '../components/page/StandardPage.vue';
import SectionCard from '../components/page/SectionCard.vue';
import { navGroups } from '../data/navigation';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const roleLabel = computed(() => ROLE_LABEL_MAP[userStore.userInfo.role] || '未分配角色');

const metrics = [
  { label: '有效培养方案', value: '18', trend: 8, sub: '当前在用与待归档的培养方案版本总数。' },
  { label: '课程资源文件', value: '246', trend: 12, sub: '已归档的教学文档、课件和证据材料数量。' },
  { label: '达成度预警项', value: '07', trend: -5, sub: '低于阈值、需要重点跟进的评价项目。' },
  { label: '进行中问卷', value: '04', trend: 15, sub: '处于发布和回收阶段的满意度与反馈问卷。' }
];

const quickEntries = navGroups
  .filter((group) => ['方案与课程', '评价与达成', '报告中心'].includes(group.label))
  .flatMap((group) =>
    group.items.slice(0, 2).map((item) => ({
      ...item,
      group: group.label
    }))
  );

const notices = [
  {
    id: 1,
    title: '2025 级计算机科学与技术专业培养方案进入归档确认阶段',
    desc: '请相关教师和专业负责人在 2026-07-20 前完成版本核对与归档提交。',
    time: '07-17'
  },
  {
    id: 2,
    title: '软件工程课程目标达成度计算结果已生成',
    desc: '建议进入课程目标达成度评价页面查看课程项目和实验报告明细。',
    time: '07-16'
  },
  {
    id: 3,
    title: '毕业要求满意度问卷回收率达到 72%',
    desc: '系统已向未填报班级发送提醒，建议学院继续跟进答卷收集。',
    time: '07-15'
  }
];

const todos = [
  { title: '完成 2025 级培养方案归档确认', owner: '专业负责人', deadline: '2026-07-20', priority: '高优先级' },
  { title: '复核《软件工程》课程目标达成度结果', owner: '课程组', deadline: '2026-07-18', priority: '中优先级' },
  { title: '导出本周持续改进进度报告', owner: '认证秘书', deadline: '2026-07-19', priority: '一般' }
];

const priorityTagType = {
  高优先级: 'danger',
  中优先级: 'warning',
  一般: 'info'
};
</script>
