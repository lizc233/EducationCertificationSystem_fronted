<template>
  <StandardPage
    title="成绩录入"
    :breadcrumbs="['首页', '教学执行', '成绩录入']"
    description="维护成绩批次、学生分数，并支持批量录入、提交和锁定。"
  >
    <template #actions>
      <el-button type="primary" @click="openBatchDialog()">新建批次</el-button>
      <el-button @click="openImportDialog">批量录入</el-button>
      <el-button @click="exportDetails">导出明细</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="batchFilters" class="crud-filter-form">
        <el-form-item label="授课任务">
          <el-select v-model="batchFilters.taskId" clearable filterable style="width: 240px;">
            <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程目标">
          <el-select v-model="batchFilters.objectiveId" clearable filterable style="width: 260px;">
            <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核方式">
          <el-select v-model="batchFilters.methodId" clearable filterable style="width: 240px;">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次状态">
          <el-select v-model="batchFilters.calcStatus" clearable style="width: 180px;">
            <el-option v-for="item in calcStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="batchFilters.keyword" clearable placeholder="批次号 / 备注" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.batches" @click="loadBatches">查询批次</el-button>
          <el-button @click="resetBatchFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="成绩批次">
      <el-table
        v-loading="loading.batches"
        :data="batchPage.records"
        border
        stripe
        highlight-current-row
        @current-change="handleBatchSelect"
      >
        <el-table-column prop="batchNo" label="批次号" min-width="160" />
        <el-table-column label="授课任务" min-width="220">
          <template #default="{ row }">{{ resolveOptionLabel(taskOptions, row.taskId) }}</template>
        </el-table-column>
        <el-table-column label="课程目标" min-width="220">
          <template #default="{ row }">{{ resolveOptionLabel(objectiveOptions, row.objectiveId) }}</template>
        </el-table-column>
        <el-table-column label="考核方式" min-width="200">
          <template #default="{ row }">{{ resolveOptionLabel(methodOptions, row.methodId) }}</template>
        </el-table-column>
        <el-table-column label="批次状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.calcStatus === 'LOCKED' ? 'danger' : row.calcStatus === 'DONE' ? 'success' : 'info'">
              {{ resolveOptionLabel(calcStatusOptions, row.calcStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否锁定" width="100">
          <template #default="{ row }">
            <el-tag :type="row.lockedFlag === 1 ? 'danger' : 'info'">{{ row.lockedFlag === 1 ? '已锁定' : '未锁定' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" min-width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBatchDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="recalculateBatch(row)">重算</el-button>
            <el-button type="primary" link @click="lockBatch(row)">锁定</el-button>
            <el-button type="primary" link @click="selectBatch(row)">查看明细</el-button>
            <el-button type="danger" link @click="removeBatch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="batchFilters.page"
          v-model:page-size="batchFilters.size"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="batchPage.total"
          @current-change="loadBatches"
          @size-change="loadBatches"
        />
      </div>
    </SectionCard>

    <SectionCard title="成绩明细">
      <template #extra>
        <div class="detail-actions">
          <el-select v-model="detailFilters.batchId" filterable placeholder="选择批次" style="width: 240px;" @change="loadDetails">
            <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" :disabled="!detailFilters.batchId" @click="openDetailDialog()">新增明细</el-button>
        </div>
      </template>

      <div class="detail-filter-row">
        <el-select v-model="detailFilters.studentId" clearable filterable placeholder="按学生筛选" style="width: 220px;">
          <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="detailFilters.submitStatus" clearable placeholder="按提交状态筛选" style="width: 180px;">
          <el-option v-for="item in submitStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-model.trim="detailFilters.keyword" clearable placeholder="来源类型 / 备注" style="width: 220px;" />
        <el-button type="primary" :loading="loading.details" @click="loadDetails">查询明细</el-button>
      </div>

      <el-table v-loading="loading.details" :data="detailPage.records" border stripe>
        <el-table-column label="学生" min-width="160">
          <template #default="{ row }">{{ resolveOptionLabel(studentOptions, row.studentId) }}</template>
        </el-table-column>
        <el-table-column prop="rawScore" label="原始分" width="100" />
        <el-table-column prop="weightedScore" label="折算分" width="100" />
        <el-table-column prop="totalScore" label="总分" width="100" />
        <el-table-column prop="sourceType" label="来源类型" min-width="120" />
        <el-table-column prop="sourceRefId" label="来源编号" min-width="120" />
        <el-table-column label="提交状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.submitStatus === 'SUBMITTED' ? 'success' : 'info'">
              {{ resolveOptionLabel(submitStatusOptions, row.submitStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="90">
          <template #default="{ row }">
            <el-tag :type="row.lockedFlag === 1 ? 'danger' : 'info'">{{ row.lockedFlag === 1 ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" min-width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetailDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="submitDetail(row)">提交</el-button>
            <el-button type="danger" link @click="removeDetail(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="detailFilters.page"
          v-model:page-size="detailFilters.size"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="detailPage.total"
          @current-change="loadDetails"
          @size-change="loadDetails"
        />
      </div>
    </SectionCard>

    <el-dialog v-model="batchDialog.visible" :title="batchDialog.form.id ? '编辑成绩批次' : '新建成绩批次'" width="720px">
      <el-form ref="batchFormRef" :model="batchDialog.form" :rules="batchRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="批次号" prop="batchNo"><el-input v-model.trim="batchDialog.form.batchNo" /></el-form-item>
          <el-form-item label="批次状态">
            <el-select v-model="batchDialog.form.calcStatus" style="width: 100%;">
              <el-option v-for="item in calcStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="授课任务" prop="taskId">
            <el-select v-model="batchDialog.form.taskId" filterable style="width: 100%;">
              <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程目标" prop="objectiveId">
            <el-select v-model="batchDialog.form.objectiveId" filterable style="width: 100%;">
              <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="考核方式" prop="methodId">
          <el-select v-model="batchDialog.form.methodId" filterable style="width: 100%;">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="batchDialog.form.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.batch" @click="submitBatch">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" :title="detailDialog.form.id ? '编辑成绩明细' : '新增成绩明细'" width="720px">
      <el-form ref="detailFormRef" :model="detailDialog.form" :rules="detailRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="批次" prop="batchId">
            <el-select v-model="detailDialog.form.batchId" filterable style="width: 100%;">
              <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="学生" prop="studentId">
            <el-select v-model="detailDialog.form.studentId" filterable style="width: 100%;">
              <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--three">
          <el-form-item label="原始分"><el-input-number v-model="detailDialog.form.rawScore" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
          <el-form-item label="折算分"><el-input-number v-model="detailDialog.form.weightedScore" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
          <el-form-item label="总分"><el-input-number v-model="detailDialog.form.totalScore" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="来源类型"><el-input v-model.trim="detailDialog.form.sourceType" placeholder="如：MANUAL / IMPORT" /></el-form-item>
          <el-form-item label="来源编号"><el-input-number v-model="detailDialog.form.sourceRefId" :min="0" style="width: 100%;" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="提交状态">
            <el-select v-model="detailDialog.form.submitStatus" style="width: 100%;">
              <el-option v-for="item in submitStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="锁定">
            <el-switch v-model="detailDialog.form.lockedFlag" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="detailDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.detail" @click="submitDetailForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialog.visible" title="批量录入成绩" width="860px">
      <div class="import-header">
        <div>当前批次：{{ resolveOptionLabel(batchOptions, importDialog.batchId, '未选择') }}</div>
        <el-select v-model="importDialog.batchId" filterable placeholder="选择要录入的批次" style="width: 260px;">
          <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <div class="import-list">
        <div v-for="(row, index) in importDialog.rows" :key="index" class="import-row">
          <el-select v-model="row.studentId" filterable placeholder="学生" style="width: 180px;">
            <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input-number v-model="row.rawScore" :min="0" :max="100" :precision="2" style="width: 120px;" />
          <el-input v-model.trim="row.sourceType" placeholder="来源类型" style="width: 140px;" />
          <el-input-number v-model="row.sourceRefId" :min="0" style="width: 120px;" />
          <el-input v-model.trim="row.remark" placeholder="备注" style="width: 180px;" />
          <el-button type="danger" link @click="removeImportRow(index)">删除</el-button>
        </div>
      </div>

      <div class="import-toolbar">
        <el-button @click="addImportRow">新增一行</el-button>
      </div>

      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.importRows" @click="submitImportRows">提交批量录入</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { calcStatusOptions, lookupApi, resolveOptionLabel, scoreApi, submitStatusOptions, teachingApi } from '../../api/bc';

const loading = reactive({
  batches: false,
  details: false
});
const saving = reactive({
  batch: false,
  detail: false,
  importRows: false
});

const taskOptions = ref([]);
const objectiveOptions = ref([]);
const methodOptions = ref([]);
const studentOptions = ref([]);

const batchFilters = reactive({
  page: 1,
  size: 10,
  taskId: null,
  objectiveId: null,
  methodId: null,
  calcStatus: '',
  keyword: ''
});
const detailFilters = reactive({
  page: 1,
  size: 10,
  batchId: null,
  studentId: null,
  submitStatus: '',
  keyword: ''
});

const batchPage = reactive({
  records: [],
  total: 0
});
const detailPage = reactive({
  records: [],
  total: 0
});

const batchOptions = computed(() =>
  batchPage.records.map((item) => ({
    value: item.id,
    label: item.batchNo
  }))
);

const batchDialog = reactive({
  visible: false,
  form: {}
});
const detailDialog = reactive({
  visible: false,
  form: {}
});
const importDialog = reactive({
  visible: false,
  batchId: null,
  rows: []
});

const batchFormRef = ref();
const detailFormRef = ref();

const batchRules = {
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  taskId: [{ required: true, message: '请选择授课任务', trigger: 'change' }],
  objectiveId: [{ required: true, message: '请选择课程目标', trigger: 'change' }],
  methodId: [{ required: true, message: '请选择考核方式', trigger: 'change' }]
};
const detailRules = {
  batchId: [{ required: true, message: '请选择批次', trigger: 'change' }],
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }]
};

function createBatchForm(row = {}) {
  return {
    id: row.id || null,
    batchNo: row.batchNo || '',
    taskId: row.taskId || batchFilters.taskId || null,
    objectiveId: row.objectiveId || batchFilters.objectiveId || null,
    methodId: row.methodId || batchFilters.methodId || null,
    calcStatus: row.calcStatus || 'PENDING',
    remark: row.remark || ''
  };
}

function createDetailForm(row = {}) {
  return {
    id: row.id || null,
    batchId: row.batchId || detailFilters.batchId || null,
    studentId: row.studentId || null,
    rawScore: Number(row.rawScore || 0),
    weightedScore: row.weightedScore !== undefined && row.weightedScore !== null ? Number(row.weightedScore) : null,
    totalScore: row.totalScore !== undefined && row.totalScore !== null ? Number(row.totalScore) : null,
    sourceType: row.sourceType || 'MANUAL',
    sourceRefId: row.sourceRefId || null,
    submitStatus: row.submitStatus || 'DRAFT',
    lockedFlag: row.lockedFlag ?? 0,
    remark: row.remark || ''
  };
}

function createImportRow() {
  return {
    studentId: null,
    rawScore: 0,
    sourceType: 'IMPORT',
    sourceRefId: null,
    remark: ''
  };
}

async function loadLookups() {
  const [taskPageResult, objectives, methods, students] = await Promise.all([
    teachingApi.listTasks({ page: 1, size: 200 }),
    lookupApi.courseObjectives(),
    lookupApi.assessmentMethods(),
    lookupApi.students()
  ]);
  taskOptions.value = (taskPageResult.records || []).map((item) => ({ value: item.id, label: item.taskCode }));
  objectiveOptions.value = objectives;
  methodOptions.value = methods;
  studentOptions.value = students;
}

async function loadBatches() {
  loading.batches = true;
  try {
    const result = await scoreApi.listBatches(batchFilters);
    batchPage.records = result.records || [];
    batchPage.total = result.total || 0;
    if (!detailFilters.batchId || !batchPage.records.some((item) => item.id === detailFilters.batchId)) {
      detailFilters.batchId = batchPage.records[0]?.id || null;
    }
  } finally {
    loading.batches = false;
  }
  await loadDetails();
}

async function loadDetails() {
  if (!detailFilters.batchId) {
    detailPage.records = [];
    detailPage.total = 0;
    return;
  }
  loading.details = true;
  try {
    const result = await scoreApi.listDetails(detailFilters);
    detailPage.records = result.records || [];
    detailPage.total = result.total || 0;
  } finally {
    loading.details = false;
  }
}

function resetBatchFilters() {
  batchFilters.page = 1;
  batchFilters.size = 10;
  batchFilters.taskId = null;
  batchFilters.objectiveId = null;
  batchFilters.methodId = null;
  batchFilters.calcStatus = '';
  batchFilters.keyword = '';
  loadBatches();
}

function handleBatchSelect(row) {
  if (row?.id) {
    detailFilters.batchId = row.id;
    loadDetails();
  }
}

function selectBatch(row) {
  detailFilters.batchId = row.id;
  loadDetails();
}

function openBatchDialog(row) {
  batchDialog.form = createBatchForm(row);
  batchDialog.visible = true;
}

async function submitBatch() {
  const valid = await batchFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.batch = true;
  try {
    const { id, ...payload } = batchDialog.form;
    id ? await scoreApi.updateBatch(id, payload) : await scoreApi.createBatch(payload);
    batchDialog.visible = false;
    ElMessage.success('成绩批次已保存');
    await loadBatches();
  } finally {
    saving.batch = false;
  }
}

async function recalculateBatch(row) {
  await scoreApi.recalculateBatch(row.id);
  ElMessage.success('批次已重算');
  await loadBatches();
}

async function lockBatch(row) {
  await scoreApi.lockBatch(row.id);
  ElMessage.success('批次已锁定');
  await loadBatches();
}

async function removeBatch(row) {
  try {
    await ElMessageBox.confirm('确认删除这个成绩批次吗？', '删除确认', { type: 'warning' });
    await scoreApi.deleteBatch(row.id);
    ElMessage.success('成绩批次已删除');
    await loadBatches();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

function openDetailDialog(row) {
  detailDialog.form = createDetailForm(row);
  detailDialog.visible = true;
}

async function submitDetailForm() {
  const valid = await detailFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.detail = true;
  try {
    const { id, ...payload } = detailDialog.form;
    if (payload.weightedScore === null) {
      delete payload.weightedScore;
    }
    if (payload.totalScore === null) {
      delete payload.totalScore;
    }
    id ? await scoreApi.updateDetail(id, payload) : await scoreApi.createDetail(payload);
    detailDialog.visible = false;
    ElMessage.success('成绩明细已保存');
    await loadDetails();
  } finally {
    saving.detail = false;
  }
}

async function submitDetail(row) {
  await scoreApi.submitDetail(row.id);
  ElMessage.success('成绩已提交');
  await loadDetails();
  await loadBatches();
}

async function removeDetail(row) {
  try {
    await ElMessageBox.confirm('确认删除这条成绩明细吗？', '删除确认', { type: 'warning' });
    await scoreApi.deleteDetail(row.id);
    ElMessage.success('成绩明细已删除');
    await loadDetails();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

function openImportDialog() {
  importDialog.batchId = detailFilters.batchId || batchPage.records[0]?.id || null;
  importDialog.rows = [createImportRow()];
  importDialog.visible = true;
}

function addImportRow() {
  importDialog.rows.push(createImportRow());
}

function removeImportRow(index) {
  importDialog.rows.splice(index, 1);
}

async function submitImportRows() {
  if (!importDialog.batchId) {
    ElMessage.warning('请先选择批次');
    return;
  }
  if (!importDialog.rows.length) {
    ElMessage.warning('请至少保留一行数据');
    return;
  }
  const payload = importDialog.rows.map((row) => ({
    batchId: importDialog.batchId,
    studentId: row.studentId,
    rawScore: row.rawScore,
    sourceType: row.sourceType || 'IMPORT',
    sourceRefId: row.sourceRefId,
    remark: row.remark
  }));
  saving.importRows = true;
  try {
    await scoreApi.importDetails(payload);
    importDialog.visible = false;
    detailFilters.batchId = importDialog.batchId;
    ElMessage.success('批量录入已提交');
    await loadDetails();
  } finally {
    saving.importRows = false;
  }
}

async function exportDetails() {
  if (!detailFilters.batchId) {
    ElMessage.warning('请先选择一个批次');
    return;
  }
  await scoreApi.exportDetails(detailFilters);
}

onMounted(async () => {
  await loadLookups();
  await loadBatches();
});
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-actions,
.detail-filter-row,
.import-header,
.import-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-filter-row {
  margin-bottom: 16px;
}

.import-list {
  display: grid;
  gap: 12px;
}

.import-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: #faf7f3;
}

@media (max-width: 760px) {
  .form-grid,
  .form-grid--three {
    grid-template-columns: 1fr;
  }
}
</style>
