<template>
  <StandardPage
    title="操作日志"
    :breadcrumbs="['首页', '基础管理', '操作日志']"
    description="查看登录、用户管理和系统配置等关键操作的留痕记录。"
  >
    <template #actions>
      <el-button @click="reloadData" :loading="loading || summaryLoading">刷新</el-button>
      <el-button type="primary" plain @click="exportLogs" :loading="exporting">导出</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item>
          <el-input
            v-model.trim="filters.operator"
            placeholder="操作人"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.module" placeholder="模块" clearable style="width: 180px">
            <el-option label="全部模块" value="" />
            <el-option
              v-for="item in moduleOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.result" placeholder="结果" clearable style="width: 140px">
            <el-option label="全部结果" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilters">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">筛选后日志数</div>
        <div class="page-kpi__value">{{ summary.total }}</div>
        <div class="page-kpi__desc">基于当前筛选条件统计的操作记录总数。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">成功记录</div>
        <div class="page-kpi__value">{{ summary.success }}</div>
        <div class="page-kpi__desc">执行成功的登录、维护与配置操作数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">失败记录</div>
        <div class="page-kpi__value">{{ summary.failed }}</div>
        <div class="page-kpi__desc">执行失败或被拦截的关键操作数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">涉及模块</div>
        <div class="page-kpi__value">{{ summary.modules }}</div>
        <div class="page-kpi__desc">当前筛选范围内出现过的模块数量。</div>
      </article>
    </section>

    <SectionCard title="日志列表">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="时间" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" min-width="120" />
        <el-table-column prop="module" label="模块" min-width="150" />
        <el-table-column prop="type" label="类型" min-width="120" />
        <el-table-column prop="ip" label="IP" min-width="140" />
        <el-table-column label="结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.resultStatus === 'success' ? 'success' : 'danger'" effect="light">
              {{ row.resultLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detailPreview" label="操作详情" min-width="280" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetailDialog(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          @current-change="loadTable"
          @size-change="handlePageSizeChange"
        />
      </div>
    </SectionCard>

    <el-dialog v-model="detailVisible" title="日志详情" width="720px" destroy-on-close>
      <div v-if="currentRow" class="log-detail">
        <div class="log-detail__item">
          <span class="log-detail__label">操作时间</span>
          <span>{{ formatDateTime(currentRow.time) }}</span>
        </div>
        <div class="log-detail__item">
          <span class="log-detail__label">操作人</span>
          <span>{{ currentRow.operator || '-' }}</span>
        </div>
        <div class="log-detail__item">
          <span class="log-detail__label">所属模块</span>
          <span>{{ currentRow.module || '-' }}</span>
        </div>
        <div class="log-detail__item">
          <span class="log-detail__label">日志类型</span>
          <span>{{ currentRow.type || '-' }}</span>
        </div>
        <div class="log-detail__item">
          <span class="log-detail__label">请求来源 IP</span>
          <span>{{ currentRow.ip || '-' }}</span>
        </div>
        <div class="log-detail__item">
          <span class="log-detail__label">执行结果</span>
          <el-tag :type="currentRow.resultStatus === 'success' ? 'success' : 'danger'" effect="light">
            {{ currentRow.resultLabel }}
          </el-tag>
        </div>
        <div class="log-detail__block">
          <div class="log-detail__label">操作详情</div>
          <pre class="log-detail__content">{{ currentRow.detail || '-' }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const loading = ref(false);
const summaryLoading = ref(false);
const exporting = ref(false);
const tableData = ref([]);
const summaryRows = ref([]);
const detailVisible = ref(false);
const currentRow = ref(null);

const filters = reactive({
  operator: '',
  module: '',
  result: '',
  dateRange: []
});

const appliedFilters = reactive({
  operator: '',
  module: '',
  result: '',
  startDate: '',
  endDate: ''
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const moduleOptions = computed(() => {
  const source = summaryRows.value.length ? summaryRows.value : tableData.value;
  return Array.from(new Set(source.map((item) => item.module).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
});

const summary = computed(() => {
  const success = summaryRows.value.filter((item) => item.resultStatus === 'success').length;
  const failed = summaryRows.value.filter((item) => item.resultStatus === 'failed').length;
  return {
    total: summaryRows.value.length,
    success,
    failed,
    modules: moduleOptions.value.length
  };
});

onMounted(() => {
  reloadData();
});

function resolveResultStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) {
    return 'failed';
  }
  if (text.includes('success') || text.includes('成功')) {
    return 'success';
  }
  return 'failed';
}

function normalizeRow(item) {
  const resultStatus = resolveResultStatus(item.result);
  return {
    ...item,
    resultStatus,
    resultLabel: resultStatus === 'success' ? '成功' : '失败',
    detail: String(item.detail || '').trim(),
    detailPreview: String(item.detail || '').trim() || '-'
  };
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

function buildParams(override = {}) {
  const result = override.result ?? appliedFilters.result;
  const startDate = override.startDate ?? appliedFilters.startDate;
  const endDate = override.endDate ?? appliedFilters.endDate;
  return {
    pageNum: override.pageNum ?? pagination.currentPage,
    pageSize: override.pageSize ?? pagination.pageSize,
    operator: override.operator ?? appliedFilters.operator,
    module: override.module ?? appliedFilters.module,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    result
  };
}

async function loadTable() {
  loading.value = true;
  try {
    const page = await request.get('/system/logs', {
      params: buildParams()
    });
    const records = (page.records || []).map(normalizeRow);
    tableData.value = filterByResult(records, appliedFilters.result);
    pagination.total = resolveTotal(page.total, records, appliedFilters.result);
  } finally {
    loading.value = false;
  }
}

async function loadSummary() {
  summaryLoading.value = true;
  try {
    const page = await request.get('/system/logs', {
      params: buildParams({
        pageNum: 1,
        pageSize: 500
      })
    });
    summaryRows.value = filterByResult((page.records || []).map(normalizeRow), appliedFilters.result);
  } finally {
    summaryLoading.value = false;
  }
}

function filterByResult(rows, result) {
  if (!result) {
    return rows;
  }
  return rows.filter((item) => item.resultStatus === result);
}

function resolveTotal(total, rows, result) {
  if (!result) {
    return total || 0;
  }
  return rows.length;
}

async function reloadData() {
  await Promise.all([loadTable(), loadSummary()]);
}

async function exportLogs() {
  exporting.value = true;
  try {
    const rows = await request.get('/system/logs/export', {
      params: {
        operator: appliedFilters.operator,
        module: appliedFilters.module,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined
      }
    });
    const normalized = filterByResult((rows || []).map(normalizeRow), appliedFilters.result);
    if (!normalized.length) {
      ElMessage.warning('当前筛选条件下没有可导出的日志');
      return;
    }

    const csvRows = [
      ['时间', '操作人', '模块', '类型', 'IP', '结果', '详情'],
      ...normalized.map((item) => [
        formatDateTime(item.time),
        item.operator || '',
        item.module || '',
        item.type || '',
        item.ip || '',
        item.resultLabel || '',
        item.detail || ''
      ])
    ];
    const csvContent = `\uFEFF${csvRows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success('日志导出成功');
  } finally {
    exporting.value = false;
  }
}

function applyFilters() {
  appliedFilters.operator = filters.operator.trim();
  appliedFilters.module = filters.module;
  appliedFilters.result = filters.result;
  appliedFilters.startDate = filters.dateRange?.[0] || '';
  appliedFilters.endDate = filters.dateRange?.[1] || '';
  pagination.currentPage = 1;
  reloadData();
}

function resetFilters() {
  filters.operator = '';
  filters.module = '';
  filters.result = '';
  filters.dateRange = [];
  appliedFilters.operator = '';
  appliedFilters.module = '';
  appliedFilters.result = '';
  appliedFilters.startDate = '';
  appliedFilters.endDate = '';
  pagination.currentPage = 1;
  reloadData();
}

function handlePageSizeChange() {
  pagination.currentPage = 1;
  loadTable();
}

function openDetailDialog(row) {
  currentRow.value = row;
  detailVisible.value = true;
}

function escapeCsvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}
</script>

<style scoped>
.log-detail {
  display: grid;
  gap: 14px;
}

.log-detail__item {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.log-detail__block {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}

.log-detail__label {
  color: var(--text-secondary);
  font-size: 13px;
}

.log-detail__content {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(17, 24, 39, 0.04);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  font-family: Consolas, 'Courier New', monospace;
}
</style>
