<template>
  <div class="dashboard">
    <div class="hero glass">
      <div>
        <h2>欢迎回来，{{ auth.user?.realName || '管理员' }}</h2>
        <p>当前系统已接入前端骨架，后续直接替换接口即可。</p>
      </div>
      <div class="metric">
        <span>待办任务</span>
        <strong>12</strong>
      </div>
    </div>

    <div class="grid">
      <el-card v-for="card in cards" :key="card.title" class="stat-card">
        <div class="stat-label">{{ card.title }}</div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-desc">{{ card.desc }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const cards = [
  { title: '培养方案', value: '8', desc: '多版本管理' },
  { title: '课程', value: '36', desc: '课程库与大纲' },
  { title: '问卷', value: '5', desc: '发布与回收' },
  { title: 'AI 分析', value: '2', desc: '辅助报告' }
];
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 16px;
}

.hero {
  border-radius: 24px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text);
}

.hero h2 {
  margin: 0;
  font-size: 28px;
}

.hero p {
  margin: 8px 0 0;
  color: var(--text-dim);
}

.metric {
  min-width: 160px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
}

.metric strong {
  display: block;
  font-size: 36px;
  margin-top: 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 20px;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  font-size: 34px;
  font-weight: 800;
  margin: 12px 0 6px;
}

.stat-desc {
  color: #9ca3af;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
