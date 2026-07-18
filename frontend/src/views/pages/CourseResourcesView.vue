<template>
  <StandardPage
    title="教学资源"
    :breadcrumbs="['首页', '课程建设', '教学资源']"
    description="上传课程教学文件，维护资源记录，并控制是否发布给学生查看。"
  >
    <template #actions>
      <el-button type="primary" @click="openDialog()">新增资源</el-button>
      <el-button @click="exportData">导出列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" clearable filterable style="width: 240px;">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课任务">
          <el-select v-model="filters.taskId" clearable filterable style="width: 260px;">
            <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="filters.resourceType" clearable style="width: 180px;">
            <el-option v-for="item in resourceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="资源名称 / 说明" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="资源列表">
      <el-table v-loading="loading" :data="pageData.records" border stripe>
        <el-table-column label="课程" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(courseOptions, row.courseId) }}</template>
        </el-table-column>
        <el-table-column label="授课任务" min-width="220">
          <template #default="{ row }">{{ resolveOptionLabel(taskOptions, row.taskId, '-') }}</template>
        </el-table-column>
        <el-table-column prop="resourceName" label="资源名称" min-width="220" />
        <el-table-column prop="resourceType" label="资源类型" min-width="120" />
        <el-table-column prop="visibleScopeType" label="可见范围" min-width="120" />
        <el-table-column label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">{{ row.publishStatus === 1 ? '已发布' : '未发布' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resourceDesc" label="资源说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" min-width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="previewFile(row)">预览</el-button>
            <el-button type="primary" link @click="downloadFile(row)">下载</el-button>
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="togglePublish(row)">{{ row.publishStatus === 1 ? '取消发布' : '发布' }}</el-button>
            <el-button type="danger" link @click="removeResource(row)">删除</el-button>
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

    <el-dialog v-model="dialog.visible" :title="dialog.form.id ? '编辑教学资源' : '新增教学资源'" width="760px">
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="课程" prop="courseId">
            <el-select v-model="dialog.form.courseId" filterable style="width: 100%;">
              <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="授课任务">
            <el-select v-model="dialog.form.taskId" clearable filterable style="width: 100%;">
              <el-option v-for="item in taskOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="资源类型">
            <el-select v-model="dialog.form.resourceType" style="width: 100%;">
              <el-option v-for="item in resourceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态">
            <el-switch v-model="dialog.form.publishStatus" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        <el-form-item label="资源名称">
          <el-input v-model.trim="dialog.form.resourceName" placeholder="可留空，默认取上传文件名" />
        </el-form-item>
        <el-form-item label="资源说明">
          <el-input v-model="dialog.form.resourceDesc" type="textarea" :rows="3" />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="可见范围">
            <el-select v-model="dialog.form.visibleScopeType" style="width: 100%;">
              <el-option v-for="item in visibleScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="范围编号">
            <el-input v-model.trim="dialog.form.visibleScopeId" placeholder="可留空" />
          </el-form-item>
        </div>
        <el-form-item label="上传文件" prop="fileId">
          <el-upload
            class="uploader"
            :show-file-list="false"
            :http-request="uploadResourceFile"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
          >
            <el-button :loading="uploading">{{ dialog.form.fileId ? '重新上传文件' : '选择文件上传' }}</el-button>
          </el-upload>
          <div class="upload-tip">
            <div v-if="uploadedFileName">当前文件：{{ uploadedFileName }}</div>
            <div v-else>尚未上传文件</div>
          </div>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitDialog">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fileApi, resourceApi, resolveOptionLabel, teachingApi, lookupApi } from '../../api/bc';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const formRef = ref();

const courseOptions = ref([]);
const taskOptions = ref([]);

const resourceTypeOptions = [
  { label: '教学大纲', value: 'SYLLABUS' },
  { label: '课件', value: 'SLIDE' },
  { label: '实验资料', value: 'LAB' },
  { label: '作业资料', value: 'ASSIGNMENT' },
  { label: '考试资料', value: 'EXAM' },
  { label: '其他', value: 'OTHER' }
];

const visibleScopeOptions = [
  { label: '课程内可见', value: 'COURSE' },
  { label: '班级可见', value: 'CLASS' },
  { label: '仅教师可见', value: 'PRIVATE' }
];

const filters = reactive({
  page: 1,
  size: 10,
  courseId: null,
  taskId: null,
  resourceType: '',
  keyword: ''
});

const pageData = reactive({
  records: [],
  total: 0
});

const dialog = reactive({
  visible: false,
  form: {}
});

const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  fileId: [{ required: true, message: '请先上传文件', trigger: 'change' }]
};

const uploadedFileName = computed(() => dialog.form.uploadedFileName || '');

function createForm(row = {}) {
  return {
    id: row.id || null,
    courseId: row.courseId || filters.courseId || null,
    taskId: row.taskId || filters.taskId || null,
    resourceType: row.resourceType || 'OTHER',
    resourceName: row.resourceName || '',
    fileId: row.fileId || null,
    uploadedFileName: row.uploadedFileName || '',
    resourceDesc: row.resourceDesc || '',
    visibleScopeType: row.visibleScopeType || 'COURSE',
    visibleScopeId: row.visibleScopeId || '',
    publishStatus: row.publishStatus ?? 0,
    remark: row.remark || ''
  };
}

async function loadLookups() {
  const [courses, taskPage] = await Promise.all([
    lookupApi.courses(),
    teachingApi.listTasks({ page: 1, size: 200 })
  ]);
  courseOptions.value = courses;
  taskOptions.value = (taskPage.records || []).map((item) => ({
    value: item.id,
    label: `${item.taskCode} / ${resolveOptionLabel(courses, item.courseId, '未命名课程')}`
  }));
}

async function loadData() {
  loading.value = true;
  try {
    const result = await resourceApi.listResources(filters);
    pageData.records = result.records || [];
    pageData.total = result.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.courseId = null;
  filters.taskId = null;
  filters.resourceType = '';
  filters.keyword = '';
  loadData();
}

function openDialog(row) {
  dialog.form = createForm(row);
  dialog.visible = true;
}

async function uploadResourceFile({ file }) {
  uploading.value = true;
  try {
    const result = await fileApi.upload(file, {
      uploadUserId: userStore.userInfo.id || 1,
      bizType: 'COURSE_RESOURCE',
      visibilityScope: dialog.form.visibleScopeType || 'COURSE',
      remark: dialog.form.remark || ''
    });
    dialog.form.fileId = result.id;
    dialog.form.uploadedFileName = result.originalName || file.name;
    ElMessage.success('文件上传成功');
  } finally {
    uploading.value = false;
  }
}

async function submitDialog() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.value = true;
  try {
    const payload = {
      ...dialog.form,
      visibleScopeId: dialog.form.visibleScopeId ? Number(dialog.form.visibleScopeId) : null
    };
    delete payload.id;
    delete payload.uploadedFileName;
    if (dialog.form.id) {
      await resourceApi.updateResource(dialog.form.id, payload);
    } else {
      await resourceApi.createResource(payload);
    }
    dialog.visible = false;
    ElMessage.success('资源记录已保存');
    await loadData();
  } finally {
    saving.value = false;
  }
}

async function togglePublish(row) {
  const nextStatus = row.publishStatus === 1 ? 0 : 1;
  await resourceApi.publishResource(row.id, nextStatus);
  ElMessage.success(nextStatus === 1 ? '资源已发布' : '已取消发布');
  await loadData();
}

function previewFile(row) {
  if (!row.fileId) {
    ElMessage.warning('当前资源没有绑定文件');
    return;
  }
  window.open(fileApi.previewUrl(row.fileId), '_blank');
}

function downloadFile(row) {
  if (!row.fileId) {
    ElMessage.warning('当前资源没有绑定文件');
    return;
  }
  window.open(fileApi.downloadUrl(row.fileId), '_blank');
}

async function exportData() {
  await resourceApi.exportResources(filters);
}

async function removeResource(row) {
  try {
    await ElMessageBox.confirm(`确认删除资源“${row.resourceName}”吗？`, '删除确认', { type: 'warning' });
    await resourceApi.deleteResource(row.id);
    ElMessage.success('资源已删除');
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

.uploader {
  width: 100%;
}

.upload-tip {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
