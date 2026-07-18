<template>
  <StandardPage
    title="达成度统计分析看板"
    :breadcrumbs="['首页', '评价与达成', '达成度统计分析看板']"
    description="从多学期趋势、课程分布、毕业要求分布和预警热点几个维度观察达成度整体状态，支持导出明细。"
  >
    <template #actions>
      <el-button type="primary" @click="downloadCourseDetails">导出课程目标明细</el-button>
      <el-button @click="downloadRequirementDetails">导出毕业要求明细</el-button>
      <el-button :loading="loading.page" @click="loadAll">刷新看板</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="专业">
          <el-select v-model="filters.majorId" clearable placeholder="全部专业" style="width: 180px;">
            <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.gradeId" clearable placeholder="全部年级" style="width: 160px;">
            <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filters.semesterId" clearable placeholder="全部学期" style="width: 180px;">
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="方案版本">
          <el-select v-model="filters.programVersionId" clearable placeholder="全部方案" style="width: 180px;">
            <el-option v-for="item in programVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="filters.modelId" clearable placeholder="全部模型" style="width: 180px;">
            <el-option
              v-for="item in modelOptions"
              :key="item.id"
              :label="`${item.modelCode} - ${item.modelName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" clearable placeholder="全部课程" style="width: 180px;">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="loadAll">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">课程目标结果数</div>
        <div class="page-kpi__value">{{ overview.courseTargetResultCount || 0 }}</div>
        <div class="page-kpi__desc">看板统计范围内的课程目标结果记录数</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">毕业要求结果数</div>
        <div class="page-kpi__value">{{ overview.graduationRequirementResultCount || 0 }}</div>
        <div class="page-kpi__desc">看板统计范围内的毕业要求结果记录数</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">预警数</div>
        <div class="page-kpi__value">{{ overview.warningCount || 0 }}</div>
        <div class="page-kpi__desc">当前范围内低于阈值的毕业要求项</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">平均毕业要求达成率</div>
        <div class="page-kpi__value">{{ formatRate(overview.avgGraduationRequirementAttainmentRate) }}</div>
        <div class="page-kpi__desc">毕业要求结果的平均达成率</div>
      </article>
    </div>

    <div class="dashboard-shell">
      <SectionCard title="多学期趋势">
        <div ref="trendChartRef" class="chart-box" />
      </SectionCard>

      <SectionCard title="课程分布">
        <div ref="courseChartRef" class="chart-box" />
      </SectionCard>

      <SectionCard title="毕业要求分布">
        <div ref="requirementChartRef" class="chart-box" />
      </SectionCard>

      <SectionCard title="预警占比">
        <div ref="warningChartRef" class="chart-box" />
      </SectionCard>
    </div>

    <div class="dashboard-detail-shell">
      <SectionCard title="毕业要求矩阵">
        <el-table v-loading="loading.page" :data="matrixRows" border stripe>
          <el-table-column prop="requirementCode" label="要求编码" min-width="120" />
          <el-table-column prop="requirementName" label="毕业要求" min-width="180" />
          <el-table-column label="达成率" min-width="120">
            <template #default="{ row }">
              {{ formatRate(row.attainmentRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="thresholdValue" label="阈值" min-width="100" />
          <el-table-column label="预警" min-width="90">
            <template #default="{ row }">
              <el-tag :type="row.warningFlag === 1 ? 'danger' : 'success'">
                {{ row.warningFlag === 1 ? '预警' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="calcTime" label="计算时间" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.calcTime) }}
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <SectionCard title="预警热点">
        <el-table v-loading="loading.page" :data="warningRows" border stripe>
          <el-table-column prop="requirementCode" label="要求编码" min-width="120" />
          <el-table-column prop="requirementName" label="毕业要求" min-width="180" />
          <el-table-column label="达成率" min-width="110">
            <template #default="{ row }">
              {{ formatRate(row.attainmentRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="thresholdValue" label="阈值" min-width="100" />
          <el-table-column prop="majorName" label="专业" min-width="120" />
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import * as echarts from 'echarts';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  buildDashboardCourseTargetDownloadUrl,
  buildDashboardGraduationRequirementDownloadUrl,
  fetchDashboardCourseDistribution,
  fetchDashboardGraduationRequirementDetails,
  fetchDashboardOverview,
  fetchDashboardRequirementDistribution,
  fetchDashboardRequirementMatrix,
  fetchDashboardSemesterTrend,
  fetchEvalModels
} from '../../api/eval';
import { fetchCourses, fetchGrades, fetchMajors, fetchProgramVersions, fetchSemesters } from '../../api/lookups';

const loading = reactive({
  page: false
});

const filters = reactive({
  majorId: null,
  gradeId: null,
  semesterId: null,
  programVersionId: null,
  modelId: null,
  courseId: null
});

const overview = reactive({
  courseTargetResultCount: 0,
  graduationRequirementResultCount: 0,
  warningCount: 0,
  avgCourseTargetAttainmentRate: 0,
  avgGraduationRequirementAttainmentRate: 0,
  warningRate: 0
});

const trendData = ref([]);
const courseDistribution = ref([]);
const requirementDistribution = ref([]);
const matrixRows = ref([]);
const warningRows = ref([]);

const majorOptions = ref([]);
const gradeOptions = ref([]);
const semesterOptions = ref([]);
const programVersionOptions = ref([]);
const courseOptions = ref([]);
const modelOptions = ref([]);

const trendChartRef = ref(null);
const courseChartRef = ref(null);
const requirementChartRef = ref(null);
const warningChartRef = ref(null);
const chartInstances = [];

function formatRate(value) {
  const num = Number(value || 0);
  return `${Number.isNaN(num) ? 0 : num.toFixed(2)}%`;
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function buildQuery() {
  return {
    majorId: filters.majorId,
    gradeId: filters.gradeId,
    semesterId: filters.semesterId,
    programVersionId: filters.programVersionId,
    modelId: filters.modelId,
    courseId: filters.courseId
  };
}

async function loadLookups() {
  const [{ records: models } = { records: [] }, majors, grades, semesters, programVersions, courses] = await Promise.all([
    fetchEvalModels({ pageNum: 1, pageSize: 100 }),
    fetchMajors(),
    fetchGrades(),
    fetchSemesters(),
    fetchProgramVersions(),
    fetchCourses()
  ]);

  modelOptions.value = models || [];
  majorOptions.value = majors || [];
  gradeOptions.value = grades || [];
  semesterOptions.value = semesters || [];
  programVersionOptions.value = programVersions || [];
  courseOptions.value = courses || [];
}

async function loadAll() {
  loading.page = true;
  try {
    const query = buildQuery();
    const [overviewData, trend, courseStats, requirementStats, matrix, detailPage] = await Promise.all([
      fetchDashboardOverview(query),
      fetchDashboardSemesterTrend(query),
      fetchDashboardCourseDistribution(query),
      fetchDashboardRequirementDistribution(query),
      fetchDashboardRequirementMatrix(query),
      fetchDashboardGraduationRequirementDetails({ ...query, pageNum: 1, pageSize: 20 })
    ]);

    Object.assign(overview, overviewData || {});
    trendData.value = trend || [];
    courseDistribution.value = courseStats || [];
    requirementDistribution.value = requirementStats || [];
    matrixRows.value = matrix || [];
    warningRows.value = (detailPage.records || []).filter((item) => item.warningFlag === 1);

    await nextTick();
    renderCharts();
  } finally {
    loading.page = false;
  }
}

function disposeCharts() {
  while (chartInstances.length) {
    chartInstances.pop()?.dispose();
  }
}

function createChart(target) {
  if (!target) return null;
  const instance = echarts.init(target);
  chartInstances.push(instance);
  return instance;
}

function renderCharts() {
  disposeCharts();

  const trendChart = createChart(trendChartRef.value);
  trendChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trendData.value.map((item) => item.semesterName || item.semesterId) },
    yAxis: { type: 'value', max: 120 },
    series: [
      {
        type: 'line',
        smooth: true,
        data: trendData.value.map((item) => Number(item.avgAttainmentRate || 0)),
        areaStyle: { color: 'rgba(43, 116, 132, 0.12)' },
        color: '#2b7484'
      }
    ]
  });

  const courseChart = createChart(courseChartRef.value);
  courseChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: courseDistribution.value.map((item) => item.name)
    },
    yAxis: { type: 'value', max: 120 },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        color: '#7a1f3d',
        data: courseDistribution.value.map((item) => Number(item.avgAttainmentRate || 0))
      }
    ]
  });

  const requirementChart = createChart(requirementChartRef.value);
  requirementChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: requirementDistribution.value.map((item) => item.code || item.name)
    },
    yAxis: { type: 'value', max: 120 },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        color: '#b38b57',
        data: requirementDistribution.value.map((item) => Number(item.avgAttainmentRate || 0))
      }
    ]
  });

  const warningChart = createChart(warningChartRef.value);
  warningChart?.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        data: [
          { name: '预警', value: overview.warningCount || 0, itemStyle: { color: '#c53030' } },
          {
            name: '正常',
            value: Math.max((overview.graduationRequirementResultCount || 0) - (overview.warningCount || 0), 0),
            itemStyle: { color: '#2f6c59' }
          }
        ]
      }
    ]
  });
}

function resetFilters() {
  filters.majorId = null;
  filters.gradeId = null;
  filters.semesterId = null;
  filters.programVersionId = null;
  filters.modelId = null;
  filters.courseId = null;
  loadAll();
}

function downloadCourseDetails() {
  window.open(buildDashboardCourseTargetDownloadUrl(buildQuery()), '_blank');
}

function downloadRequirementDetails() {
  window.open(buildDashboardGraduationRequirementDownloadUrl(buildQuery()), '_blank');
}

onMounted(async () => {
  await Promise.all([loadLookups(), loadAll()]);
});

onBeforeUnmount(() => {
  disposeCharts();
});
</script>

<style scoped>
.dashboard-shell {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.dashboard-detail-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(420px, 1fr);
  gap: 20px;
}

@media (max-width: 1180px) {
  .dashboard-shell,
  .dashboard-detail-shell {
    grid-template-columns: 1fr;
  }
}
</style>
