<template>
  <StandardPage
    title="毕业要求达成度评价与预警"
    :breadcrumbs="['首页', '评价与达成', '毕业要求达成度评价与预警']"
    description="汇总毕业要求达成度结果，集中处理预警项，支持结果确认、关闭预警和一键通知。"
  >
    <template #actions>
      <el-button type="primary" @click="calcDialogVisible = true">发起汇总计算</el-button>
      <el-button :loading="loading.notify" @click="sendWarningNotice">发送预警通知</el-button>
      <el-button :loading="loading.page" @click="loadAll">刷新数据</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="专业">
          <el-select v-model="filters.majorId" clearable placeholder="全部专业" style="width: 220px;">
            <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="方案版本">
          <el-select v-model="filters.programVersionId" clearable placeholder="全部方案" style="width: 220px;">
            <el-option v-for="item in programVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业要求">
          <el-select v-model="filters.requirementId" clearable placeholder="全部要求" style="width: 220px;">
            <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="filters.modelId" clearable placeholder="全部模型" style="width: 220px;">
            <el-option
              v-for="item in graduationModelOptions"
              :key="item.id"
              :label="`${item.modelCode} - ${item.modelName}`"
              :value="item.id"
            />
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
        <div class="page-kpi__label">结果总数</div>
        <div class="page-kpi__value">{{ pager.total }}</div>
        <div class="page-kpi__desc">当前筛选范围内的毕业要求达成结果</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">预警数</div>
        <div class="page-kpi__value">{{ warningPager.total }}</div>
        <div class="page-kpi__desc">低于阈值、需要处理的毕业要求项</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">平均达成率</div>
        <div class="page-kpi__value">{{ summary.avgRate }}%</div>
        <div class="page-kpi__desc">当前结果列表达成率平均值</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">已锁定结果</div>
        <div class="page-kpi__value">{{ summary.lockedCount }}</div>
        <div class="page-kpi__desc">已确认并锁定的结果记录数</div>
      </article>
    </div>

    <div class="graduate-shell">
      <SectionCard title="毕业要求结果矩阵">
        <el-table v-loading="loading.page" :data="rows" border stripe>
          <el-table-column prop="programVersionName" label="方案版本" min-width="160" />
          <el-table-column prop="majorName" label="专业" min-width="140" />
          <el-table-column prop="requirementCode" label="要求编码" min-width="120" />
          <el-table-column prop="requirementName" label="毕业要求" min-width="180" />
          <el-table-column prop="modelName" label="模型" min-width="150" />
          <el-table-column label="达成率" min-width="120">
            <template #default="{ row }">
              {{ formatRate(row.attainmentRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="attainmentValue" label="达成值" min-width="110" />
          <el-table-column prop="thresholdValue" label="阈值" min-width="110" />
          <el-table-column label="预警" min-width="90">
            <template #default="{ row }">
              <el-tag :type="row.warningFlag === 1 ? 'danger' : 'success'">
                {{ row.warningFlag === 1 ? '预警' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="锁定" min-width="90">
            <template #default="{ row }">
              <el-tag :type="row.lockFlag === 1 ? 'info' : 'warning'">
                {{ row.lockFlag === 1 ? '已锁定' : '未锁定' }}
              </el-tag>
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
            @current-change="loadResultPage"
            @size-change="loadResultPage"
          />
        </div>
      </SectionCard>

      <SectionCard title="预警处置台">
        <template #extra>
          <span class="small-tag tag-red">已选 {{ selectedWarningIds.length }} 条</span>
        </template>
        <el-table
          v-loading="loading.page"
          :data="warningRows"
          border
          stripe
          @selection-change="handleWarningSelection"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="requirementCode" label="要求编码" min-width="120" />
          <el-table-column prop="requirementName" label="毕业要求" min-width="180" />
          <el-table-column prop="majorName" label="专业" min-width="130" />
          <el-table-column label="达成率" min-width="110">
            <template #default="{ row }">
              {{ formatRate(row.attainmentRate) }}
            </template>
          </el-table-column>
          <el-table-column prop="thresholdValue" label="阈值" min-width="100" />
          <el-table-column prop="calcTime" label="计算时间" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.calcTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>
              <el-button type="primary" link @click="closeWarning(row.id)">关闭预警</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="warningPager.pageNum"
            v-model:page-size="warningPager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="warningPager.total"
            @current-change="loadWarningPage"
            @size-change="loadWarningPage"
          />
        </div>
      </SectionCard>
    </div>

    <el-dialog v-model="calcDialogVisible" title="发起毕业要求达成度汇总计算" width="640px">
      <el-form label-position="top" :model="calcForm">
        <el-form-item label="方案版本">
          <el-select v-model="calcForm.programVersionId" placeholder="请选择方案版本" style="width: 100%;">
            <el-option
              v-for="item in programVersionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评价模型">
          <el-select v-model="calcForm.modelId" placeholder="请选择模型" style="width: 100%;">
            <el-option
              v-for="item in graduationModelOptions"
              :key="item.id"
              :label="`${item.modelCode} - ${item.modelName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业要求">
          <el-select v-model="calcForm.requirementIds" multiple collapse-tags placeholder="可多选毕业要求" style="width: 100%;">
            <el-option
              v-for="item in requirementOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="calcForm.remark" type="textarea" :rows="3" placeholder="填写本次汇总说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="calcDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.calculate" @click="submitCalculate">开始计算</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="毕业要求结果详情" size="50%">
      <div v-if="detail">
        <div class="detail-summary">
          <article class="detail-summary__card">
            <div class="detail-summary__label">毕业要求</div>
            <div class="detail-summary__value">{{ detail.requirementCode }} {{ detail.requirementName }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">专业 / 方案</div>
            <div class="detail-summary__value">{{ detail.majorName || '-' }} / {{ detail.programVersionName || '-' }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">达成率</div>
            <div class="detail-summary__value">{{ formatRate(detail.attainmentRate) }}</div>
          </article>
          <article class="detail-summary__card">
            <div class="detail-summary__label">阈值</div>
            <div class="detail-summary__value">{{ detail.thresholdValue ?? '-' }}</div>
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
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  calculateGraduationRequirementResults,
  closeGraduationWarning,
  confirmGraduationRequirementResult,
  fetchEvalModels,
  fetchGraduationRequirementResultDetail,
  fetchGraduationRequirementResults,
  fetchGraduationWarnings,
  notifyGraduationWarnings,
  recalculateGraduationRequirementResult
} from '../../api/eval';
import { fetchGraduationRequirements, fetchMajors, fetchProgramVersions } from '../../api/lookups';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const loading = reactive({
  page: false,
  calculate: false,
  notify: false
});

const rows = ref([]);
const warningRows = ref([]);
const detail = ref(null);
const detailVisible = ref(false);
const calcDialogVisible = ref(false);

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const warningPager = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
});

const filters = reactive({
  programVersionId: null,
  majorId: null,
  requirementId: null,
  modelId: null
});

const calcForm = reactive({
  programVersionId: null,
  modelId: null,
  requirementIds: [],
  remark: ''
});

const majorOptions = ref([]);
const programVersionOptions = ref([]);
const requirementOptions = ref([]);
const modelOptions = ref([]);
const selectedWarningIds = ref([]);

const graduationModelOptions = computed(() =>
  modelOptions.value.filter((item) => item.modelType === 'GRADUATION_REQUIREMENT')
);

const summary = computed(() => {
  const rates = rows.value.map((item) => toRate(item.attainmentRate));
  const avgRate = rates.length ? (rates.reduce((sum, item) => sum + item, 0) / rates.length).toFixed(2) : '0.00';
  const lockedCount = rows.value.filter((item) => item.lockFlag === 1).length;
  return {
    avgRate,
    lockedCount
  };
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

async function loadLookups() {
  const [majors, programVersions, requirements, models] = await Promise.all([
    fetchMajors(),
    fetchProgramVersions(),
    fetchGraduationRequirements(),
    fetchEvalModels({ pageNum: 1, pageSize: 100 })
  ]);
  majorOptions.value = majors || [];
  programVersionOptions.value = programVersions || [];
  requirementOptions.value = requirements || [];
  modelOptions.value = models.records || [];
}

async function loadResultPage() {
  const page = await fetchGraduationRequirementResults({
    pageNum: pager.pageNum,
    pageSize: pager.pageSize,
    programVersionId: filters.programVersionId,
    majorId: filters.majorId,
    requirementId: filters.requirementId,
    modelId: filters.modelId
  });
  rows.value = page.records || [];
  pager.total = Number(page.total || 0);
}

async function loadWarningPage() {
  const page = await fetchGraduationWarnings({
    pageNum: warningPager.pageNum,
    pageSize: warningPager.pageSize,
    programVersionId: filters.programVersionId,
    majorId: filters.majorId,
    modelId: filters.modelId
  });
  warningRows.value = page.records || [];
  warningPager.total = Number(page.total || 0);
}

async function loadAll() {
  loading.page = true;
  try {
    await Promise.all([loadResultPage(), loadWarningPage()]);
  } finally {
    loading.page = false;
  }
}

function resetFilters() {
  filters.programVersionId = null;
  filters.majorId = null;
  filters.requirementId = null;
  filters.modelId = null;
  pager.pageNum = 1;
  warningPager.pageNum = 1;
  loadAll();
}

function handleWarningSelection(selection) {
  selectedWarningIds.value = selection.map((item) => item.id);
}

async function openDetail(id) {
  detail.value = await fetchGraduationRequirementResultDetail(id);
  detailVisible.value = true;
}

async function handleRecalculate(id) {
  await recalculateGraduationRequirementResult(id);
  ElMessage.success('已触发重算');
  await loadAll();
}

async function handleConfirm(id) {
  await confirmGraduationRequirementResult(id);
  ElMessage.success('结果已确认');
  await loadAll();
}

async function closeWarning(id) {
  await closeGraduationWarning(id);
  ElMessage.success('预警已关闭');
  await loadAll();
}

async function sendWarningNotice() {
  const resultIds = selectedWarningIds.value.length
    ? selectedWarningIds.value
    : warningRows.value.map((item) => item.id);
  if (!resultIds.length) {
    ElMessage.warning('当前没有可通知的预警项');
    return;
  }
  loading.notify = true;
  try {
    await notifyGraduationWarnings({
      resultIds,
      senderUserId: userStore.userInfo.id,
      operatorUserId: userStore.userInfo.id,
      remark: '前端预警处置台批量发送'
    });
    ElMessage.success('预警通知已发送');
  } finally {
    loading.notify = false;
  }
}

async function submitCalculate() {
  loading.calculate = true;
  try {
    await calculateGraduationRequirementResults({
      programVersionId: calcForm.programVersionId,
      modelId: calcForm.modelId,
      requirementIds: calcForm.requirementIds,
      remark: calcForm.remark
    });
    calcDialogVisible.value = false;
    calcForm.programVersionId = null;
    calcForm.modelId = null;
    calcForm.requirementIds = [];
    calcForm.remark = '';
    ElMessage.success('毕业要求达成度汇总完成');
    await loadAll();
  } finally {
    loading.calculate = false;
  }
}

onMounted(async () => {
  await Promise.all([loadLookups(), loadAll()]);
});
</script>

<style scoped>
.graduate-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(420px, 1fr);
  gap: 20px;
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

@media (max-width: 1280px) {
  .graduate-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
