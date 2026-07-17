<template>
  <StandardPage
    title="佐证材料"
    :breadcrumbs="['首页', '教学执行', '佐证材料']"
    description="维护考核佐证文件，支持批量上传、审核和导出。"
  >
    <template #actions>
      <el-button type="primary" @click="openEditDialog()">新增材料</el-button>
      <el-button @click="openBatchDialog">批量上传</el-button>
      <el-button @click="exportData">导出列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="授课任务">
          <el-select v-model="filters.taskId" clearable filterable style="width: 260px;">
            <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核方式">
          <el-select v-model="filters.methodId" clearable filterable style="width: 260px;">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="filters.reviewStatus" clearable style="width: 180px;">
            <el-option v-for="item in reviewStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="材料类型 / 备注" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="材料列表">
      <el-table v-loading="loading" :data="pageData.records" border stripe>
        <el-table-column label="授课任务" min-width="220">
          <template #default="{ row }">{{ resolveOptionLabel(taskOptions, row.taskId) }}</template>
        </el-table-column>
        <el-table-column label="考核方式" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(methodOptions, row.methodId) }}</template>
        </el-table-column>
        <el-table-column prop="materialType" label="材料类型" min-width="120" />
        <el-table-column label="来源学生" min-width="160">
          <template #default="{ row }">{{ resolveOptionLabel(studentOptions, row.sourceStudentId, '-') }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="110">
          <template #default="{ row }">
            <el-tag :type="reviewTagType[row.reviewStatus] || 'info'">
              {{ resolveOptionLabel(reviewStatusOptions, row.reviewStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewComment" label="审核意见" min-width="180" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" min-width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="previewFile(row)">预览</el-button>
            <el-button type="primary" link @click="downloadFile(row)">下载</el-button>
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="openReviewDialog(row)">审核</el-button>
            <el-button type="danger" link @click="removeMaterial(row)">删除</el-button>
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
          :total="pageData.total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </SectionCard>

    <el-dialog v-model="editDialog.visible" :title="editDialog.form.id ? '编辑材料' : '新增材料'" width="760px">
      <el-form ref="editFormRef" :model="editDialog.form" :rules="editRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="授课任务" prop="taskId">
            <el-select v-model="editDialog.form.taskId" filterable style="width: 100%;">
              <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="考核方式" prop="methodId">
            <el-select v-model="editDialog.form.methodId" filterable style="width: 100%;">
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="材料类型"><el-input v-model.trim="editDialog.form.materialType" placeholder="如：实验报告、试卷、作业" /></el-form-item>
          <el-form-item label="来源学生">
            <el-select v-model="editDialog.form.sourceStudentId" clearable filterable style="width: 100%;">
              <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="上传文件" prop="fileId">
          <el-upload
            :show-file-list="false"
            :http-request="uploadSingleFile"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
          >
            <el-button :loading="uploading.single">{{ editDialog.form.fileId ? '重新上传文件' : '选择文件上传' }}</el-button>
          </el-upload>
          <div class="upload-tip">
            <div v-if="editDialog.form.uploadedFileName">当前文件：{{ editDialog.form.uploadedFileName }}</div>
            <div v-else>尚未上传文件</div>
          </div>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="editDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.edit" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchDialog.visible" title="批量上传材料" width="780px">
      <el-form ref="batchFormRef" :model="batchDialog.form" :rules="batchRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="授课任务" prop="taskId">
            <el-select v-model="batchDialog.form.taskId" filterable style="width: 100%;">
              <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="考核方式" prop="methodId">
            <el-select v-model="batchDialog.form.methodId" filterable style="width: 100%;">
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="材料类型"><el-input v-model.trim="batchDialog.form.materialType" /></el-form-item>
          <el-form-item label="来源学生">
            <el-select v-model="batchDialog.form.sourceStudentId" clearable filterable style="width: 100%;">
              <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="选择多个文件" prop="files">
          <el-upload
            multiple
            :show-file-list="false"
            :http-request="uploadBatchFile"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
          >
            <el-button :loading="uploading.batch">选择并上传文件</el-button>
          </el-upload>
          <div class="upload-list" v-if="batchDialog.files.length">
            <div v-for="item in batchDialog.files" :key="item.fileId" class="upload-list__item">
              <span>{{ item.name }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="batchDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.batch" @click="submitBatch">保存批量材料</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewDialog.visible" title="审核材料" width="560px">
      <el-form ref="reviewFormRef" :model="reviewDialog.form" label-position="top">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewDialog.form.status">
            <el-radio v-for="item in reviewStatusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="reviewDialog.form.comment" type="textarea" :rows="4" placeholder="可选填写" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.review" @click="submitReview">提交审核</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fileApi, lookupApi, resolveOptionLabel, resourceApi, reviewStatusOptions, teachingApi } from '../../api/bc';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();
const loading = ref(false);
const uploading = reactive({
  single: false,
  batch: false
});
const saving = reactive({
  edit: false,
  batch: false,
  review: false
});

const taskOptions = ref([]);
const methodOptions = ref([]);
const studentOptions = ref([]);

const filters = reactive({
  page: 1,
  size: 10,
  taskId: null,
  methodId: null,
  reviewStatus: '',
  keyword: ''
});

const pageData = reactive({
  records: [],
  total: 0
});

const editDialog = reactive({
  visible: false,
  form: {}
});
const batchDialog = reactive({
  visible: false,
  form: {},
  files: []
});
const reviewDialog = reactive({
  visible: false,
  materialId: null,
  form: {
    status: 'APPROVED',
    comment: ''
  }
});

const editFormRef = ref();
const batchFormRef = ref();

const editRules = {
  taskId: [{ required: true, message: '请选择授课任务', trigger: 'change' }],
  methodId: [{ required: true, message: '请选择考核方式', trigger: 'change' }],
  fileId: [{ required: true, message: '请先上传文件', trigger: 'change' }]
};
const batchRules = {
  taskId: [{ required: true, message: '请选择授课任务', trigger: 'change' }],
  methodId: [{ required: true, message: '请选择考核方式', trigger: 'change' }]
};

const reviewTagType = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger'
};

function createEditForm(row = {}) {
  return {
    id: row.id || null,
    taskId: row.taskId || filters.taskId || null,
    methodId: row.methodId || filters.methodId || null,
    materialType: row.materialType || '',
    fileId: row.fileId || null,
    uploadedFileName: row.uploadedFileName || '',
    sourceStudentId: row.sourceStudentId || null,
    remark: row.remark || ''
  };
}

function createBatchForm() {
  return {
    taskId: filters.taskId || null,
    methodId: filters.methodId || null,
    materialType: '',
    sourceStudentId: null,
    remark: ''
  };
}

async function loadLookups() {
  const [taskPage, methods, students] = await Promise.all([
    teachingApi.listTasks({ page: 1, size: 200 }),
    lookupApi.assessmentMethods(),
    lookupApi.students()
  ]);
  taskOptions.value = (taskPage.records || []).map((item) => ({
    value: item.id,
    label: item.taskCode
  }));
  methodOptions.value = methods;
  studentOptions.value = students;
}

async function loadData() {
  loading.value = true;
  try {
    const result = await resourceApi.listMaterials(filters);
    pageData.records = result.records || [];
    pageData.total = result.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.taskId = null;
  filters.methodId = null;
  filters.reviewStatus = '';
  filters.keyword = '';
  loadData();
}

function openEditDialog(row) {
  editDialog.form = createEditForm(row);
  editDialog.visible = true;
}

function openBatchDialog() {
  batchDialog.form = createBatchForm();
  batchDialog.files = [];
  batchDialog.visible = true;
}

function openReviewDialog(row) {
  reviewDialog.materialId = row.id;
  reviewDialog.form = {
    status: row.reviewStatus || 'APPROVED',
    comment: row.reviewComment || ''
  };
  reviewDialog.visible = true;
}

async function uploadSingleFile({ file }) {
  uploading.single = true;
  try {
    const result = await fileApi.upload(file, {
      uploadUserId: userStore.userInfo.id || 1,
      bizType: 'EVIDENCE_MATERIAL',
      visibilityScope: 'PRIVATE'
    });
    editDialog.form.fileId = result.id;
    editDialog.form.uploadedFileName = result.originalName || file.name;
    ElMessage.success('文件上传成功');
  } finally {
    uploading.single = false;
  }
}

async function uploadBatchFile({ file }) {
  uploading.batch = true;
  try {
    const result = await fileApi.upload(file, {
      uploadUserId: userStore.userInfo.id || 1,
      bizType: 'EVIDENCE_MATERIAL',
      visibilityScope: 'PRIVATE'
    });
    batchDialog.files.push({
      fileId: result.id,
      name: result.originalName || file.name
    });
    ElMessage.success(`已上传 ${result.originalName || file.name}`);
  } finally {
    uploading.batch = false;
  }
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.edit = true;
  try {
    const payload = { ...editDialog.form };
    delete payload.id;
    delete payload.uploadedFileName;
    if (editDialog.form.id) {
      await resourceApi.updateMaterial(editDialog.form.id, payload);
    } else {
      await resourceApi.createMaterial(payload);
    }
    editDialog.visible = false;
    ElMessage.success('材料已保存');
    await loadData();
  } finally {
    saving.edit = false;
  }
}

async function submitBatch() {
  const valid = await batchFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  if (!batchDialog.files.length) {
    ElMessage.warning('请先上传至少一个文件');
    return;
  }
  saving.batch = true;
  try {
    const payload = batchDialog.files.map((item) => ({
      taskId: batchDialog.form.taskId,
      methodId: batchDialog.form.methodId,
      materialType: batchDialog.form.materialType,
      fileId: item.fileId,
      sourceStudentId: batchDialog.form.sourceStudentId,
      remark: batchDialog.form.remark
    }));
    await resourceApi.createMaterialBatch(payload);
    batchDialog.visible = false;
    ElMessage.success('批量材料已保存');
    await loadData();
  } finally {
    saving.batch = false;
  }
}

async function submitReview() {
  if (!reviewDialog.materialId) {
    return;
  }
  saving.review = true;
  try {
    await resourceApi.reviewMaterial(reviewDialog.materialId, reviewDialog.form.status, reviewDialog.form.comment);
    reviewDialog.visible = false;
    ElMessage.success('审核结果已提交');
    await loadData();
  } finally {
    saving.review = false;
  }
}

function previewFile(row) {
  if (!row.fileId) {
    ElMessage.warning('当前记录没有绑定文件');
    return;
  }
  window.open(fileApi.previewUrl(row.fileId), '_blank');
}

function downloadFile(row) {
  if (!row.fileId) {
    ElMessage.warning('当前记录没有绑定文件');
    return;
  }
  window.open(fileApi.downloadUrl(row.fileId), '_blank');
}

async function exportData() {
  await resourceApi.exportMaterials(filters);
}

async function removeMaterial(row) {
  try {
    await ElMessageBox.confirm('确认删除这条佐证材料吗？', '删除确认', { type: 'warning' });
    await resourceApi.deleteMaterial(row.id);
    ElMessage.success('材料已删除');
    await loadData();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadLookups();
  await loadData();
});
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.upload-tip {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

.upload-list {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.upload-list__item {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #faf7f3;
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
