<template>
  <StandardPage
    title="学业进度"
    :breadcrumbs="['首页', '我的学习', '学业进度']"
    description="查看已修学分、应修学分、课程类别完成情况和学业进展图表。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-scores')">查看我的成绩</el-button>
      <el-button @click="router.push('/course-selection')">前往选课中心</el-button>
    </template>

    <div class="info-grid">
      <div v-for="item in stats" :key="item.label" class="metric-card">
        <div class="metric-card__label">{{ item.label }}</div>
        <div class="metric-card__value">{{ item.value }}</div>
        <div class="metric-card__sub">{{ item.desc }}</div>
      </div>
    </div>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.1fr) 380px;">
      <SectionCard title="学业进度图表">
        <div class="chart-grid">
          <div ref="creditChartRef" class="chart-box" />
          <div ref="categoryChartRef" class="chart-box" />
        </div>
      </SectionCard>

      <SectionCard title="完成情况">
        <div class="study-progress-card">
          <div class="study-progress-card__header">
            <div>
              <div class="study-progress-card__label">总学分完成度</div>
              <div class="study-progress-card__value">86 / 150 学分</div>
            </div>
            <el-tag type="success">57%</el-tag>
          </div>
          <el-progress :percentage="57" :stroke-width="16" />
          <div class="study-progress-card__meta">
            <span>公共课：已完成 34 学分</span>
            <span>专业课：已完成 42 学分</span>
            <span>选修课：已完成 10 学分</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <SectionCard title="课程类别进度明细">
      <el-table :data="progressRows" border stripe>
        <el-table-column prop="category" label="课程类别" min-width="150" />
        <el-table-column prop="required" label="应修学分" min-width="100" />
        <el-table-column prop="completed" label="已修学分" min-width="100" />
        <el-table-column prop="inProgress" label="在修学分" min-width="100" />
        <el-table-column label="完成比例" min-width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" />
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const creditChartRef = ref();
const categoryChartRef = ref();
const chartInstances = [];

const stats = [
  { label: '已修学分', value: '86', desc: '累计已修学分占总要求 57%。' },
  { label: '应修学分', value: '150', desc: '培养方案要求总学分。' },
  { label: '待完成核心课', value: '4 门', desc: '需重点关注的专业核心课程。' },
  { label: '待评价课程', value: '2 门', desc: '请在 2026 年 7 月 22 日前完成评价。' }
];

const progressRows = [
  { category: '公共基础课', required: 40, completed: 34, inProgress: 4, percentage: 85 },
  { category: '学科基础课', required: 28, completed: 18, inProgress: 6, percentage: 64 },
  { category: '专业核心课', required: 42, completed: 24, inProgress: 10, percentage: 57 },
  { category: '专业方向课', required: 18, completed: 6, inProgress: 6, percentage: 33 },
  { category: '专业选修课', required: 10, completed: 4, inProgress: 2, percentage: 40 },
  { category: '创新创业课', required: 4, completed: 2, inProgress: 0, percentage: 50 },
  { category: '劳动教育', required: 2, completed: 2, inProgress: 0, percentage: 100 },
  { category: '实践环节', required: 4, completed: 0, inProgress: 2, percentage: 0 },
  { category: '毕业设计', required: 2, completed: 0, inProgress: 0, percentage: 0 },
  { category: '自由选修', required: 0, completed: 0, inProgress: 0, percentage: 0 }
];

function initCharts() {
  const creditChart = echarts.init(creditChartRef.value);
  creditChart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        data: [
          { value: 86, name: '已修学分', itemStyle: { color: '#2c4e86' } },
          { value: 64, name: '待修学分', itemStyle: { color: '#d9e3f5' } }
        ]
      }
    ]
  });

  const categoryChart = echarts.init(categoryChartRef.value);
  categoryChart.setOption({
    color: ['#7d5f2d'],
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['公共', '学科', '核心', '方向', '选修'] },
    yAxis: { type: 'value', max: 100 },
    series: [{ type: 'bar', barWidth: 24, data: [85, 64, 57, 33, 40] }]
  });

  chartInstances.push(creditChart, categoryChart);
}

onMounted(async () => {
  await nextTick();
  initCharts();
});

onBeforeUnmount(() => {
  chartInstances.forEach((item) => item.dispose());
});
</script>
