<template>
  <StandardPage title="达成度统计分析看板" :breadcrumbs="['首页', '评价与达成', '达成度统计分析看板']" description="通过图表和数据表联动查看专业达成度变化与预警分布。">
    <template #actions>
      <el-button type="primary" :loading="exporting.chart" @click="runExport('chart', '导出图表')">导出图表</el-button>
      <el-button :loading="exporting.data" @click="runExport('data', '导出数据')">导出数据</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="专业">
          <el-select v-model="filters.major" style="width: 180px;"><el-option label="计算机科学与技术" value="计算机科学与技术" /></el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.grade" style="width: 120px;"><el-option label="2025" value="2025" /></el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filters.term" style="width: 160px;"><el-option label="2025-2026-2" value="2025-2026-2" /></el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);">
      <SectionCard title="达成度趋势与分布">
        <div class="chart-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          <div ref="lineChartRef" class="chart-box" />
          <div ref="barChartRef" class="chart-box" />
        </div>
      </SectionCard>

      <SectionCard title="预警数据表">
        <el-table :data="warningRows" border stripe height="100%">
          <el-table-column prop="item" label="预警项" min-width="160" />
          <el-table-column prop="current" label="当前达成度" min-width="110" />
          <el-table-column prop="threshold" label="阈值" min-width="90" />
          <el-table-column prop="owner" label="责任人" min-width="100" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openWarning(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const route = useRoute();
const filters = reactive({
  major: '计算机科学与技术',
  grade: '2025',
  term: '2025-2026-2'
});
const exporting = reactive({
  chart: false,
  data: false
});

const lineChartRef = ref();
const barChartRef = ref();
const chartInstances = [];

const warningRows = [
  { id: 'warn-1', item: 'GR2 / 2.1', current: '0.69', threshold: '0.75', owner: '课程组 A' },
  { id: 'warn-2', item: 'GR2 / 2.2', current: '0.72', threshold: '0.75', owner: '课程组 B' },
  { id: 'warn-3', item: 'GR5 / 5.1', current: '0.71', threshold: '0.76', owner: '课程组 C' },
  { id: 'warn-4', item: 'GR8 / 8.2', current: '0.70', threshold: '0.75', owner: '课程组 D' }
];

function initCharts() {
  const line = echarts.init(lineChartRef.value);
  line.setOption({
    color: ['#7a1f3d'],
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['2024-1', '2024-2', '2025-1', '2025-2'] },
    yAxis: { type: 'value', max: 100 },
    series: [{ type: 'line', smooth: true, data: [72, 76, 81, 84], areaStyle: { color: 'rgba(122, 31, 61, 0.12)' } }]
  });

  const bar = echarts.init(barChartRef.value);
  bar.setOption({
    color: ['#b38b57'],
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['60-70', '70-80', '80-90', '90-100'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', barWidth: 28, data: [8, 16, 23, 11] }]
  });

  chartInstances.push(line, bar);
}

async function runExport(key, label) {
  exporting[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  exporting[key] = false;
  ElMessage.success(`${label}成功`);
}

async function openWarning(row) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'achievement-dashboard', mode: 'view', id: row.id },
    query: {
      from: route.path,
      title: '达成度统计分析看板',
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'item', label: '预警项', type: 'input' },
        { prop: 'current', label: '当前达成度', type: 'input' },
        { prop: 'threshold', label: '阈值', type: 'input' },
        { prop: 'owner', label: '责任人', type: 'input' }
      ])
    }
  });
}

onMounted(async () => {
  await nextTick();
  initCharts();
});

onBeforeUnmount(() => {
  chartInstances.forEach((chart) => chart.dispose());
});
</script>
