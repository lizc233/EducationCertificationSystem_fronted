<template>
  <el-card class="module-card">
    <h2>{{ title }}</h2>
    <p>这是 {{ title }} 的占位页，后续直接替换成对应 CRUD 页面即可。</p>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const map = {
  system: '系统基础',
  program: '培养方案',
  course: '课程管理',
  evaluation: '达成度评价',
  survey: '调查问卷',
  improve: '持续改进',
  report: '自评报告',
  ai: 'AI 辅助'
};

const title = computed(() => map[route.params.name] || '模块');
</script>

<style scoped>
.module-card {
  min-height: 280px;
  border-radius: 24px;
}
</style>
