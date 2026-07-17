<template>
  <StandardPage title="课程目标达成度评价" :breadcrumbs="['首页', '评价与达成', '课程目标达成度评价']" description="按课程目标查看达成度结果，并支持下钻查看明细。">
    <template #actions>
      <el-button type="primary" :loading="loading.calc" @click="runAction('calc', '触发计算')">触发计算</el-button>
      <el-button :loading="loading.export" @click="runAction('export', '导出报告')">导出报告</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="selector">
        <el-form-item label="学期">
          <el-select v-model="selector.term" style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="selector.course" style="width: 240px;">
            <el-option label="软件工程" value="软件工程" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="info-grid">
      <div v-for="item in goals" :key="item.name" class="metric-card">
        <div class="metric-card__label">{{ item.name }}</div>
        <div style="margin-top: 14px;">
          <el-progress :percentage="item.percent" :status="item.percent >= 75 ? 'success' : 'exception'" />
        </div>
        <div class="metric-card__sub">{{ item.percent >= 75 ? '达标' : '不达标' }}</div>
      </div>
    </div>

    <SectionCard title="明细下钻">
      <el-table :data="details" border stripe>
        <el-table-column prop="goal" label="课程目标" min-width="140" />
        <el-table-column prop="assessment" label="考核方式" min-width="140" />
        <el-table-column prop="score" label="平均得分" min-width="120" />
        <el-table-column prop="achievement" label="达成度" min-width="120" />
        <el-table-column prop="teacher" label="任课教师" min-width="120" />
        <el-table-column label="查看" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openWorkspace(row)">详细数据</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const route = useRoute();
const loading = reactive({
  calc: false,
  export: false
});

const selector = reactive({
  term: '2025-2026-2',
  course: '软件工程'
});

const goals = [
  { name: '课程目标 1', percent: 82 },
  { name: '课程目标 2', percent: 76 },
  { name: '课程目标 3', percent: 69 }
];

const details = [
  { id: 'ach-1', goal: '课程目标 1', assessment: '平时作业', score: 84.6, achievement: '0.82', teacher: '李青' },
  { id: 'ach-2', goal: '课程目标 2', assessment: '实验报告', score: 79.2, achievement: '0.76', teacher: '李青' },
  { id: 'ach-3', goal: '课程目标 3', assessment: '课程项目', score: 71.4, achievement: '0.69', teacher: '李青' },
  { id: 'ach-4', goal: '课程目标 1', assessment: '期中测验', score: 82.3, achievement: '0.80', teacher: '周鹏' },
  { id: 'ach-5', goal: '课程目标 2', assessment: '课堂展示', score: 78.8, achievement: '0.75', teacher: '周鹏' },
  { id: 'ach-6', goal: '课程目标 3', assessment: '结课项目', score: 74.1, achievement: '0.71', teacher: '周鹏' },
  { id: 'ach-7', goal: '课程目标 1', assessment: '实验考核', score: 86.5, achievement: '0.84', teacher: '张敏' },
  { id: 'ach-8', goal: '课程目标 2', assessment: '课程论文', score: 76.4, achievement: '0.74', teacher: '张敏' },
  { id: 'ach-9', goal: '课程目标 3', assessment: '小组答辩', score: 73.8, achievement: '0.70', teacher: '张敏' },
  { id: 'ach-10', goal: '课程目标 3', assessment: '平时表现', score: 75.0, achievement: '0.72', teacher: '张敏' }
];

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}

async function openWorkspace(row) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'achievement-course', mode: 'view', id: row.id },
    query: {
      from: route.path,
      title: '课程目标达成度评价',
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'goal', label: '课程目标', type: 'input' },
        { prop: 'assessment', label: '考核方式', type: 'input' },
        { prop: 'score', label: '平均得分', type: 'input' },
        { prop: 'achievement', label: '达成度', type: 'input' },
        { prop: 'teacher', label: '任课教师', type: 'input' }
      ])
    }
  });
}
</script>
