<template>
  <StandardPage
    title="课程目标达成评价"
    :breadcrumbs="['首页', '评价与达成', '课程目标达成评价']"
    description="查看课程目标达成结果，支持发起计算、查看贡献明细、重新计算和结果确认。"
  >
    <template #actions>
      <el-button type="primary" @click="calcDialogVisible = true">发起计算</el-button>
      <el-button :loading="loading.page" @click="loadPage">刷新结果</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="学期">
          <el-select v-model="filters.semesterId" clearable placeholder="全部学期" style="width: 180px;">
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" clearable placeholder="全部课程" style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.classId" clearable placeholder="全部班级" style="width: 220px;">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程目标">
          <el-select v-model="filters.objectiveId" clearable placeholder="全部目标" style="width: 220px;">
            <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="loadPage">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">结果总数</div>
        <div class="page-kpi__value">{{ pager.total }}</div>
        <div class="page-kpi__desc">当前筛选条件下的课程目标达成结果数</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">平均达成率</div>
        <div class="page-kpi__value">{{ summary.avgRate }}%</div>
        <div class="page-kpi__desc">按当前结果列表计算的平均达成率</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">风险目标数</div>
        <div class="page-kpi__value">{{ summary.riskCount }}</div>
        <div class="page-kpi__desc">达成率低于 100% 的课程目标结果数</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">最近计算时间</div>
        <div class="page-kpi__value page-kpi__value--small">{{ summary.latestCalcTime }}</div>
        <div class="page-kpi__desc">列表中最近一次计算或重算时间</div>
      </article>
    </div>

    <div class="course-shell">
      <SectionCard title="课程目标概览">
        <div class="goal-overview">
          <article
            v-for="item in goalStats"
            :key="item.objectiveKey"
            class="goal-overview__item"
          >
            <div class="goal-overview__head">
              <div>
                <div class="goal-overview__title">{{ item.objectiveName }}</div>
                <div class="goal-overview__meta">{{ item.courseName || '未关联课程' }}</div>
              </div>
              <el-tag :type="item.avgRate >= 100 ? 'success' : 'warning'">
                {{ item.avgRate >= 100 ? '达标' : '关注' }}
              </el-tag>
            </div>
            <el-progress :percentage="item.progress" :stroke-width="12" />
            <div class="goal-overview__foot">
              <span>平均达成率 {{ item.avgRate.toFixed(2) }}%</span>
              <span>结果数 {{ item.count }}</span>
            </div>
          </article>
          <el-empty v-if="!goalStats.length" description="暂无课程目标结果" />
        </div>
      </SectionCard>

      <SectionCard title="结果明细">
        <el-table v-loading="loading.page" :data="rows" border stripe>
          <el-table-column prop="semesterName" label="学期" min-width="150" />
          <el-table-column prop="courseName" label="课程" min-width="160" />
          <el-table-column prop="className" label="班级" min-width="140" />
          <el-table-column prop="objectiveCode" label="目标编码" min-width="120" />
          <el-table-column prop="objectiveName" label="课程目标" min-width="180" />
          <el-table-column prop="modelName" label="模型" min-width="150" />
          <el-table-column label="达成率" min-width="120">
            <template #default="{ row }">
              {{ formatRate(row.attainmentRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="attainmentValue" label="达成值" min-width="110" />
          <el-table-column prop="targetValue" label="目标值" min-width="110" />
          <el-table-column label="等级" min-width="100">
            <template #default="{ row }">
              <el-tag :type="toRate(row.attainmentRate) >= 100 ? 'success' : 'danger'">
                {{ row.resultLevel || (toRate(row.attainmentRate) >= 100 ? 'PASS' : 'RISK') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="calcTime" label="计算时间" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.calcTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>
              <el-button type="primary" link @click="handleRecalculate(row.id)">重算</el-button>
              <el-button type="primary" link @click="handleConfirm(row.id)">确认</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 30]"
            :total="pager.total"
            @current-change="loadPage"
            @size-change="loadPage"
          />
        </div>
      </SectionCard>
    </div>

    <el-dialog v-model="calcDialogVisible" title="发起课程目标达成计算" width="640px">
      <el-form label-position="top" :model="calcForm">
        <el-form-item label="授课任务">
          <el-select v-model="calcForm.taskId" filterable placeholder="请选择授课任务" style="width: 100%;">
            <el-option
              v-for="item in taskOptions"
              :key="item.id"
              :label="taskLabelMap.get(item.id) || `${item.taskCode || item.id}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-alert
          v-if="selectedTask"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        >
          <template #title>
            当前任务：{{ taskLabelMap.get(selectedTask.id) }}
          </template>
        </el-alert>

        <el-form-item label="评价模型">
          <el-select v-model="calcForm.modelId" placeholder="请选择模型" style="width: 100%;">
            <el-option
              v-for="item in courseModelOptions"
              :key="item.id"
              :label="`${item.modelCode} - ${item.modelName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="课程目标">
          <el-select
            v-model="calcForm.objectiveIds"
            multiple
            collapse-tags
            placeholder="可多选；留空表示按当前任务下已有成绩批次的目标全部计算"
            style="width: 100%;"
          >
            <el-option
              v-for="item in filteredObjectiveOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <div v-if="selectedTask && !filteredObjectiveOptions.length" class="paper-note" style="margin-bottom: 16px;">
          当前授课任务对应课程下没有可选课程目标。若该课程尚未配置课程目标或成绩批次，后端会拒绝本次计算。
        </div>

        <el-form-item label="备注">
          <el-input v-model="calcForm.remark" type="textarea" :rows="3" placeholder="填写本次计算说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="calcDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.calculate" @click="submitCalculate">开始计算</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="课程目标结果详情" size="48%">
      <div v-if="detail">
        <div class="detail-summary">
          <article class="detail-summary__card">
            <div class="detail-summary__label">课程</div>
            <div class="detail-summary__value">{{ detail.courseName || '-' }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">课程目标</div>
            <div class="detail-summary__value">{{ detail.objectiveCode }} {{ detail.objectiveName }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">达成率</div>
            <div class="detail-summary__value">{{ formatRate(detail.attainmentRate) }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">目标值</div>
            <div class="detail-summary__value">{{ detail.targetValue ?? '-' }}</div>
          </article>
        </div>

        <SectionCard title="贡献明细" style="margin-top: 18px;">
          <el-table :data="detail.contributions || []" border stripe>
            <el-table-column prop="sourceType" label="来源类型" min-width="120" />
            <el-table-column prop="sourceName" label="来源名称" min-width="180" />
            <el-table-column prop="weightPercent" label="权重%" min-width="100" />
            <el-table-column prop="sourceValue" label="来源值" min-width="100" />
            <el-table-column prop="contributionValue" label="贡献值" min-width="100" />
            <el-table-column prop="remark" label="备注" min-width="160" />
          </el-table>
        </SectionCard>
      </div>
      <el-empty v-else description="暂无详情数据" />
    </el-drawer>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  calculateCourseTargetResults,
  confirmCourseTargetResult,
  fetchCourseTargetResultDetail,
  fetchCourseTargetResults,
  fetchEvalModelDetail,
  fetchEvalModels,
  recalculateCourseTargetResult
} from '../../api/eval';
import { fetchClasses, fetchCourseObjectives, fetchCourses, fetchSemesters } from '../../api/lookups';
import { fetchTeachingTasks } from '../../api/teaching';

const loading = reactive({
  page: false,
  calculate: false
});

const rows = ref([]);
const detail = ref(null);
const detailVisible = ref(false);
const calcDialogVisible = ref(false);

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const filters = reactive({
  semesterId: null,
  courseId: null,
  classId: null,
  objectiveId: null
});

const calcForm = reactive({
  taskId: null,
  modelId: null,
  objectiveIds: [],
  remark: ''
});

const semesterOptions = ref([]);
const courseOptions = ref([]);
const classOptions = ref([]);
const objectiveOptions = ref([]);
const taskOptions = ref([]);
const modelOptions = ref([]);
const modelDetailCache = new Map();

const courseModelOptions = computed(() =>
  modelOptions.value.filter((item) => item.modelType === 'COURSE_TARGET' && item.enabled === 1)
);

const selectedTask = computed(() =>
  taskOptions.value.find((item) => item.id === calcForm.taskId) || null
);

const filteredObjectiveOptions = computed(() => {
  const courseId = selectedTask.value?.courseId;
  if (!courseId) {
    return objectiveOptions.value;
  }
  return objectiveOptions.value.filter((item) => item.parentValue === courseId);
});

const taskLabelMap = computed(() => {
  const semesterMap = new Map(semesterOptions.value.map((item) => [item.value, item.label]));
  const courseMap = new Map(courseOptions.value.map((item) => [item.value, item.label]));
  const classMap = new Map(classOptions.value.map((item) => [item.value, item.label]));
  const map = new Map();

  taskOptions.value.forEach((item) => {
    const segments = [
      item.taskCode || `任务${item.id}`,
      courseMap.get(item.courseId) || `课程${item.courseId || '-'}`,
      classMap.get(item.classId) || `班级${item.classId || '-'}`,
      semesterMap.get(item.semesterId) || `学期${item.semesterId || '-'}`
    ];
    map.set(item.id, segments.join(' / '));
  });

  return map;
});

const summary = computed(() => {
  const rates = rows.value.map((item) => toRate(item.attainmentRate)).filter((item) => !Number.isNaN(item));
  const avgRate = rates.length ? (rates.reduce((sum, item) => sum + item, 0) / rates.length).toFixed(2) : '0.00';
  const riskCount = rates.filter((item) => item < 100).length;
  const latest = rows.value
    .map((item) => item.calcTime)
    .filter(Boolean)
    .sort()
    .at(-1);
  return {
    avgRate,
    riskCount,
    latestCalcTime: formatDateTime(latest)
  };
});

const goalStats = computed(() => {
  const map = new Map();
  rows.value.forEach((item) => {
    const key = `${item.courseId || '0'}-${item.objectiveId || '0'}`;
    if (!map.has(key)) {
      map.set(key, {
        objectiveKey: key,
        objectiveName: item.objectiveName || item.objectiveCode || '未命名目标',
        courseName: item.courseName || '',
        totalRate: 0,
        count: 0
      });
    }
    const current = map.get(key);
    current.totalRate += toRate(item.attainmentRate);
    current.count += 1;
  });
  return Array.from(map.values()).map((item) => {
    const avgRate = item.count ? item.totalRate / item.count : 0;
    return {
      ...item,
      avgRate,
      progress: Math.max(Math.min(avgRate, 100), 0)
    };
  });
});

function toRate(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function formatRate(value) {
  return `${toRate(value).toFixed(2)}%`;
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function resetCalcForm() {
  calcForm.taskId = null;
  calcForm.modelId = null;
  calcForm.objectiveIds = [];
  calcForm.remark = '';
}

function mapCourseCalcError(message) {
  if (!message) {
    return '';
  }
  if (message === 'No score batches found for the selected task and objectives') {
    return '当前授课任务下还没有成绩批次，请先到成绩评定页面创建成绩批次，并录入、提交成绩后再计算。';
  }
  if (message.startsWith('No score batches found for objective:')) {
    return '所选课程目标下还没有成绩批次，请先补充该目标对应的成绩批次。';
  }
  if (message.startsWith('No submitted scores found for batch:') || message.startsWith('No submitted scores found for objective:')) {
    return '当前成绩尚未提交或锁定，请先提交成绩后再计算。';
  }
  if (message.startsWith('No valid scores found for batch:')) {
    return '当前成绩批次下还没有有效分数，请先补充成绩数据。';
  }
  if (message.startsWith('No valid calculation weight found for objective:')) {
    return '当前评价模型与课程考核方式权重无法匹配，请检查模型权重项编码和课程考核方式编码。';
  }
  if (message === 'Selected model is not applicable to the current task') {
    return '所选评价模型不适用于当前授课任务对应课程。';
  }
  if (message === 'Selected model is not enabled') {
    return '所选评价模型未启用，请先启用后再计算。';
  }
  if (message === 'Task not found') {
    return '所选授课任务不存在，请刷新后重试。';
  }
  return message;
}

async function getModelDetail(modelId) {
  if (!modelId) {
    return null;
  }
  if (modelDetailCache.has(modelId)) {
    return modelDetailCache.get(modelId);
  }
  const detailData = await fetchEvalModelDetail(modelId);
  modelDetailCache.set(modelId, detailData);
  return detailData;
}

async function loadLookups() {
  const [semesters, courses, classes, objectives, tasks, models] = await Promise.all([
    fetchSemesters(),
    fetchCourses(),
    fetchClasses(),
    fetchCourseObjectives(),
    fetchTeachingTasks({ page: 1, size: 100 }),
    fetchEvalModels({ pageNum: 1, pageSize: 100 })
  ]);
  semesterOptions.value = semesters || [];
  courseOptions.value = courses || [];
  classOptions.value = classes || [];
  objectiveOptions.value = objectives || [];
  taskOptions.value = tasks.records || [];
  modelOptions.value = models.records || [];
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchCourseTargetResults({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      semesterId: filters.semesterId,
      courseId: filters.courseId,
      classId: filters.classId,
      objectiveId: filters.objectiveId
    });
    rows.value = page.records || [];
    pager.total = Number(page.total || 0);
  } finally {
    loading.page = false;
  }
}

function resetFilters() {
  filters.semesterId = null;
  filters.courseId = null;
  filters.classId = null;
  filters.objectiveId = null;
  pager.pageNum = 1;
  loadPage();
}

async function openDetail(id) {
  detail.value = await fetchCourseTargetResultDetail(id);
  detailVisible.value = true;
}

async function handleRecalculate(id) {
  await recalculateCourseTargetResult(id);
  ElMessage.success('已触发重算');
  await loadPage();
}

async function handleConfirm(id) {
  await confirmCourseTargetResult(id);
  ElMessage.success('结果已确认');
  await loadPage();
}

async function submitCalculate() {
  if (!calcForm.taskId) {
    ElMessage.warning('请选择授课任务');
    return;
  }
  if (!calcForm.modelId) {
    ElMessage.warning('请选择评价模型');
    return;
  }

  const task = selectedTask.value;
  if (!task) {
    ElMessage.warning('未找到所选授课任务，请刷新页面后重试');
    return;
  }

  if (calcForm.objectiveIds.length) {
    const invalidObjective = calcForm.objectiveIds.find((id) =>
      !filteredObjectiveOptions.value.some((item) => item.value === id)
    );
    if (invalidObjective) {
      ElMessage.warning('所选课程目标不属于当前授课任务对应课程，请重新选择');
      return;
    }
  }

  loading.calculate = true;
  try {
    const modelDetail = await getModelDetail(calcForm.modelId);
    const isApplicable = (modelDetail?.scopes || []).some((scope) =>
      scope.scopeType === 'COURSE' && scope.scopeId === task.courseId
    );
    if (!isApplicable) {
      ElMessage.warning('所选评价模型不适用于当前授课任务对应课程');
      return;
    }

    await calculateCourseTargetResults({
      taskId: calcForm.taskId,
      modelId: calcForm.modelId,
      objectiveIds: calcForm.objectiveIds,
      remark: calcForm.remark
    });
    calcDialogVisible.value = false;
    resetCalcForm();
    ElMessage.success('课程目标结果计算完成');
    await loadPage();
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || error?.msg || '';
    const mappedMessage = mapCourseCalcError(message);
    if (mappedMessage) {
      ElMessage.error(mappedMessage);
      return;
    }
    throw error;
  } finally {
    loading.calculate = false;
  }
}

watch(
  () => calcForm.taskId,
  () => {
    calcForm.objectiveIds = calcForm.objectiveIds.filter((id) =>
      filteredObjectiveOptions.value.some((item) => item.value === id)
    );
  }
);

onMounted(async () => {
  await Promise.all([loadLookups(), loadPage()]);
});
</script>

<style scoped>
.course-shell {
  display: grid;
  gap: 20px;
}

.goal-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.goal-overview__item {
  padding: 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.goal-overview__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.goal-overview__title {
  font-weight: 600;
  color: var(--text-primary);
}

.goal-overview__meta,
.goal-overview__foot {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.goal-overview__foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-summary__card {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.detail-summary__label {
  font-size: 12px;
  color: var(--text-light);
}

.detail-summary__value {
  margin-top: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-kpi__value--small {
  font-size: 18px;
}

@media (max-width: 860px) {
  .detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
