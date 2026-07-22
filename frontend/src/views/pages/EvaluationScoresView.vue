<template>
  <StandardPage
    title="按课程目标成绩管理"
    :breadcrumbs="['首页', '评价与达成', '按课程目标成绩管理']"
    description="按授课任务与课程目标维护成绩批次，录入/导入学生成绩，重算加权分并提交锁定，供达成度评价读取。"
  >
    <template #actions>
      <el-button type="primary" @click="openBatchDialog()">新建成绩批次</el-button>
      <el-button @click="loadBatches">刷新批次</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="授课任务">
          <el-select v-model="filters.taskId" clearable filterable style="width: 220px;" @change="loadBatches">
            <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程目标">
          <el-select v-model="filters.objectiveId" clearable filterable style="width: 220px;" @change="loadBatches">
            <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="计算状态">
          <el-select v-model="filters.calcStatus" clearable style="width: 160px;" @change="loadBatches">
            <el-option v-for="item in calcStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="批次编号 / 备注" style="width: 200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.batches" @click="loadBatches">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
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
        @current-change="selectBatch"
      >
        <el-table-column prop="batchNo" label="批次编号" min-width="180" />
        <el-table-column label="授课任务" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(taskOptions, row.taskId) }}</template>
        </el-table-column>
        <el-table-column label="课程目标" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(objectiveOptions, row.objectiveId) }}</template>
        </el-table-column>
        <el-table-column label="考核方式" min-width="160">
          <template #default="{ row }">{{ resolveOptionLabel(methodOptions, row.methodId) }}</template>
        </el-table-column>
        <el-table-column label="计算状态" width="110">
          <template #default="{ row }">
            <el-tag :type="calcStatusTag[row.calcStatus] || 'info'">
              {{ resolveOptionLabel(calcStatusOptions, row.calcStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="80">
          <template #default="{ row }">
            <el-tag :type="row.lockedFlag === 1 ? 'danger' : 'success'">
              {{ row.lockedFlag === 1 ? '已锁定' : '未锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="selectBatch(row)">查看成绩</el-button>
            <el-button type="primary" link :disabled="row.lockedFlag === 1" @click="openBatchDialog(row)">编辑</el-button>
            <el-button type="primary" link :loading="rowLoading[`recalc-${row.id}`]" :disabled="row.lockedFlag === 1" @click="recalculate(row)">重算</el-button>
            <el-button type="warning" link :disabled="row.lockedFlag === 1" @click="lock(row)">锁定</el-button>
            <el-button type="danger" link :disabled="row.lockedFlag === 1" @click="removeBatch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.size"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="batchPage.total"
          @current-change="loadBatches"
          @size-change="loadBatches"
        />
      </div>
    </SectionCard>

    <SectionCard :title="detailTitle">
      <template #extra>
        <div v-if="currentBatch">
          <el-button type="primary" size="small" :disabled="currentBatch.lockedFlag === 1" @click="openDetailDialog()">录入成绩</el-button>
          <el-button size="small" :disabled="currentBatch.lockedFlag === 1" @click="openImportDialog">批量导入</el-button>
          <el-button size="small" :loading="loading.export" @click="exportDetails">导出成绩</el-button>
        </div>
      </template>

      <el-empty v-if="!currentBatch" description="请选择上方的成绩批次以查看成绩明细" />
      <el-table v-else v-loading="loading.details" :data="details" border stripe>
        <el-table-column prop="studentNo" label="学号" min-width="130" />
        <el-table-column prop="studentName" label="姓名" min-width="110" />
        <el-table-column prop="className" label="班级" min-width="140" />
        <el-table-column prop="rawScore" label="原始分" min-width="90" />
        <el-table-column prop="weightedScore" label="加权分" min-width="90" />
        <el-table-column prop="totalScore" label="总分" min-width="90" />
        <el-table-column label="提交状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.submitStatus === 'SUBMITTED' ? 'success' : 'info'">
              {{ resolveOptionLabel(submitStatusOptions, row.submitStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="80">
          <template #default="{ row }">
            <el-tag :type="row.lockedFlag === 1 ? 'danger' : 'success'">
              {{ row.lockedFlag === 1 ? '已锁定' : '未锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :disabled="row.lockedFlag === 1 || row.submitStatus === 'SUBMITTED'" @click="openDetailDialog(row)">编辑</el-button>
            <el-button type="primary" link :loading="rowLoading[`submit-${row.id}`]" :disabled="row.lockedFlag === 1 || row.submitStatus === 'SUBMITTED'" @click="submitDetail(row)">提交</el-button>
            <el-button type="danger" link :disabled="row.lockedFlag === 1" @click="removeDetail(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <!-- 批次编辑弹窗 -->
    <el-dialog v-model="batchDialog.visible" :title="batchDialog.form.id ? '编辑成绩批次' : '新建成绩批次'" width="640px">
      <el-form ref="batchFormRef" :model="batchDialog.form" :rules="batchRules" label-position="top">
        <el-form-item label="批次编号">
          <el-input v-model.trim="batchDialog.form.batchNo" placeholder="可留空，后端自动生成" />
        </el-form-item>
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
        <div class="form-grid">
          <el-form-item label="考核方式">
            <el-select v-model="batchDialog.form.methodId" clearable filterable style="width: 100%;">
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="计算状态">
            <el-select v-model="batchDialog.form.calcStatus" style="width: 100%;">
              <el-option v-for="item in calcStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="batchDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.batch" @click="submitBatchDialog">保存</el-button>
      </template>
    </el-dialog>

    <!-- 明细编辑弹窗 -->
    <el-dialog v-model="detailDialog.visible" :title="detailDialog.form.id ? '编辑成绩' : '录入成绩'" width="560px">
      <el-form ref="detailFormRef" :model="detailDialog.form" :rules="detailRules" label-position="top">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="detailDialog.form.studentId" filterable :disabled="!!detailDialog.form.id" style="width: 100%;">
            <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="原始分（0-100）" prop="rawScore">
          <el-input-number v-model="detailDialog.form.rawScore" :min="0" :max="100" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="detailDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.detail" @click="submitDetailDialog">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialog.visible" title="批量导入成绩" width="560px">
      <p class="paper-note">
        每行格式：学号,原始分。已存在的学生将更新原始分，不存在的将新增。示例：<br />
        20230001,85<br />
        20230002,92
      </p>
      <el-input v-model="importDialog.text" type="textarea" :rows="8" placeholder="每行一条：学号,原始分" />
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.import" @click="submitImport">导入</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  calcStatusOptions,
  lookupApi,
  resolveOptionLabel,
  scoreApi,
  submitStatusOptions,
  teachingApi
} from '../../api/bc';

const loading = reactive({
  batches: false,
  details: false,
  export: false
});
const saving = reactive({
  batch: false,
  detail: false,
  import: false
});
const rowLoading = reactive({});

const batchFormRef = ref();
const detailFormRef = ref();

const taskOptions = ref([]);
const objectiveOptions = ref([]);
const methodOptions = ref([]);
const studentOptions = ref([]);

const calcStatusTag = {
  PENDING: 'info',
  DONE: 'success',
  LOCKED: 'warning'
};

const filters = reactive({
  page: 1,
  size: 10,
  taskId: null,
  objectiveId: null,
  calcStatus: '',
  keyword: ''
});

const batchPage = reactive({
  records: [],
  total: 0
});

const currentBatch = ref(null);
const details = ref([]);

const detailTitle = computed(() =>
  currentBatch.value ? `成绩明细 - ${currentBatch.value.batchNo}` : '成绩明细'
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
  text: ''
});

const batchRules = {
  taskId: [{ required: true, message: '请选择授课任务', trigger: 'change' }],
  objectiveId: [{ required: true, message: '请选择课程目标', trigger: 'change' }]
};
const detailRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  rawScore: [{ required: true, message: '请输入原始分', trigger: 'blur' }]
};

function createBatchForm(row = {}) {
  return {
    id: row.id || null,
    batchNo: row.batchNo || '',
    taskId: row.taskId || null,
    objectiveId: row.objectiveId || null,
    methodId: row.methodId || null,
    calcStatus: row.calcStatus || 'PENDING',
    remark: row.remark || ''
  };
}

function createDetailForm(row = {}) {
  return {
    id: row.id || null,
    studentId: row.studentId || null,
    rawScore: row.rawScore != null ? Number(row.rawScore) : 0,
    remark: row.remark || ''
  };
}

async function loadLookups() {
  const [tasks, objectives, methods, students] = await Promise.all([
    teachingApi.listTasks({ page: 1, size: 200 }),
    lookupApi.courseObjectives(),
    lookupApi.assessmentMethods(),
    lookupApi.students()
  ]);
  taskOptions.value = (tasks.records || []).map((item) => ({
    value: item.id,
    label: item.taskCode || `任务#${item.id}`
  }));
  objectiveOptions.value = objectives || [];
  methodOptions.value = methods || [];
  studentOptions.value = students || [];
}

async function loadBatches() {
  loading.batches = true;
  try {
    const result = await scoreApi.listBatches(filters);
    batchPage.records = result.records || [];
    batchPage.total = result.total || 0;
    if (currentBatch.value) {
      const refreshed = batchPage.records.find((item) => item.id === currentBatch.value.id);
      currentBatch.value = refreshed || null;
      if (!refreshed) {
        details.value = [];
      }
    }
  } finally {
    loading.batches = false;
  }
}

async function selectBatch(row) {
  if (!row) {
    return;
  }
  currentBatch.value = row;
  await loadDetails();
}

async function loadDetails() {
  if (!currentBatch.value) {
    details.value = [];
    return;
  }
  loading.details = true;
  try {
    details.value = await scoreApi.listDetails({ batchId: currentBatch.value.id });
  } finally {
    loading.details = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.taskId = null;
  filters.objectiveId = null;
  filters.calcStatus = '';
  filters.keyword = '';
  loadBatches();
}

function openBatchDialog(row) {
  batchDialog.form = createBatchForm(row);
  batchDialog.visible = true;
}

async function submitBatchDialog() {
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
  } catch (error) {
    return;
  } finally {
    saving.batch = false;
  }
}

async function recalculate(row) {
  rowLoading[`recalc-${row.id}`] = true;
  try {
    await scoreApi.recalculateBatch(row.id);
    ElMessage.success('重算完成');
    await loadBatches();
    if (currentBatch.value?.id === row.id) {
      await loadDetails();
    }
  } finally {
    rowLoading[`recalc-${row.id}`] = false;
  }
}

async function lock(row) {
  try {
    await ElMessageBox.confirm(`锁定后批次“${row.batchNo}”及其成绩将不可再修改，确认锁定吗？`, '锁定确认', { type: 'warning' });
    await scoreApi.lockBatch(row.id);
    ElMessage.success('批次已锁定');
    await loadBatches();
    if (currentBatch.value?.id === row.id) {
      await loadDetails();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeBatch(row) {
  try {
    await ElMessageBox.confirm(`确认删除成绩批次“${row.batchNo}”吗？其下成绩明细将一并删除。`, '删除确认', { type: 'warning' });
    await scoreApi.deleteBatch(row.id);
    ElMessage.success('成绩批次已删除');
    if (currentBatch.value?.id === row.id) {
      currentBatch.value = null;
      details.value = [];
    }
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

async function submitDetailDialog() {
  const valid = await detailFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.detail = true;
  try {
    const { id, ...rest } = detailDialog.form;
    if (id) {
      await scoreApi.updateDetail(id, rest);
    } else {
      await scoreApi.createDetail({ ...rest, batchId: currentBatch.value.id });
    }
    detailDialog.visible = false;
    ElMessage.success('成绩已保存');
    await loadDetails();
  } catch (error) {
    return;
  } finally {
    saving.detail = false;
  }
}

async function submitDetail(row) {
  rowLoading[`submit-${row.id}`] = true;
  try {
    await scoreApi.submitDetail(row.id);
    ElMessage.success('成绩已提交');
    await loadDetails();
  } finally {
    rowLoading[`submit-${row.id}`] = false;
  }
}

async function removeDetail(row) {
  try {
    await ElMessageBox.confirm(`确认删除学生“${row.studentName || row.studentNo}”的成绩吗？`, '删除确认', { type: 'warning' });
    await scoreApi.deleteDetail(row.id);
    ElMessage.success('成绩已删除');
    await loadDetails();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

function openImportDialog() {
  importDialog.text = '';
  importDialog.visible = true;
}

function buildStudentNoMap() {
  return Object.fromEntries(studentOptions.value.map((item) => [String(item.label), item.value]));
}

async function submitImport() {
  const lines = importDialog.text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (!lines.length) {
    ElMessage.warning('请输入导入内容');
    return;
  }
  const studentNoMap = buildStudentNoMap();
  const items = [];
  const invalid = [];
  lines.forEach((line, index) => {
    const [noPart, scorePart] = line.split(/[,，\t]/).map((cell) => (cell || '').trim());
    const studentId = studentNoMap[noPart];
    const rawScore = Number(scorePart);
    if (!studentId || Number.isNaN(rawScore)) {
      invalid.push(`第${index + 1}行：${line}`);
      return;
    }
    items.push({ studentId, rawScore });
  });
  if (!items.length) {
    ElMessage.error(`没有可导入的有效行。请检查学号是否存在。${invalid.length ? '无效行：' + invalid.join('；') : ''}`);
    return;
  }
  saving.import = true;
  try {
    const result = await scoreApi.importDetails({ batchId: currentBatch.value.id, items });
    const parts = [`新增 ${result.inserted} 条`, `更新 ${result.updated} 条`];
    if (result.failed) {
      parts.push(`失败 ${result.failed} 条`);
    }
    ElMessage.success(`导入完成：${parts.join('，')}`);
    if (result.errors?.length) {
      ElMessage.warning(result.errors.join('；'));
    }
    importDialog.visible = false;
    await loadDetails();
  } catch (error) {
    return;
  } finally {
    saving.import = false;
  }
}

async function exportDetails() {
  if (!currentBatch.value) {
    return;
  }
  loading.export = true;
  try {
    await scoreApi.exportDetails({ batchId: currentBatch.value.id });
    ElMessage.success('导出成功，文件已开始下载');
  } finally {
    loading.export = false;
  }
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

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
