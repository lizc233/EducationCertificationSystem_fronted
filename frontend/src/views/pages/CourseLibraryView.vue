<template>
  <StandardPage
    title="课程库"
    :breadcrumbs="['首页', '课程建设', '课程库']"
    description="维护课程基础信息、启停状态，并提供导出能力。"
  >
    <template #actions>
      <el-button type="primary" @click="openDialog()">新建课程</el-button>
      <el-button @click="exportData">导出列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="课程代码 / 名称 / 备注" style="width: 260px;" />
        </el-form-item>
        <el-form-item label="开课单位">
          <el-select v-model="filters.offeringUnitId" clearable filterable style="width: 220px;">
            <el-option v-for="item in collegeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 180px;">
            <el-option v-for="item in courseStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="课程列表">
      <el-table v-loading="loading" :data="pageData.records" border stripe>
        <el-table-column prop="courseCode" label="课程代码" width="140" />
        <el-table-column prop="courseName" label="课程名称" min-width="200" />
        <el-table-column prop="courseType" label="课程性质" min-width="140" />
        <el-table-column prop="credit" label="学分" width="90" />
        <el-table-column prop="totalHours" label="总学时" width="90" />
        <el-table-column prop="theoryHours" label="理论" width="90" />
        <el-table-column prop="practiceHours" label="实践" width="90" />
        <el-table-column label="开课单位" min-width="160">
          <template #default="{ row }">
            {{ resolveOptionLabel(collegeOptions, row.offeringUnitId) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" min-width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="toggleStatus(row)">{{ row.status === 1 ? '停用' : '启用' }}</el-button>
            <el-button type="danger" link @click="removeCourse(row)">删除</el-button>
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

    <el-dialog v-model="dialog.visible" :title="dialog.form.id ? '编辑课程' : '新建课程'" width="720px">
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="课程代码" prop="courseCode"><el-input v-model.trim="dialog.form.courseCode" /></el-form-item>
          <el-form-item label="课程名称" prop="courseName"><el-input v-model.trim="dialog.form.courseName" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="课程性质"><el-input v-model.trim="dialog.form.courseType" placeholder="如：专业核心课" /></el-form-item>
          <el-form-item label="开课单位">
            <el-select v-model="dialog.form.offeringUnitId" filterable style="width: 100%;">
              <el-option v-for="item in collegeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--three">
          <el-form-item label="学分"><el-input-number v-model="dialog.form.credit" :min="0" :precision="1" style="width: 100%;" /></el-form-item>
          <el-form-item label="总学时"><el-input-number v-model="dialog.form.totalHours" :min="0" style="width: 100%;" /></el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="理论学时"><el-input-number v-model="dialog.form.theoryHours" :min="0" style="width: 100%;" /></el-form-item>
          <el-form-item label="实践学时"><el-input-number v-model="dialog.form.practiceHours" :min="0" style="width: 100%;" /></el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="dialog.form.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitDialog">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { courseApi, courseStatusOptions, lookupApi, resolveOptionLabel } from '../../api/bc';

const loading = ref(false);
const saving = ref(false);
const collegeOptions = ref([]);
const formRef = ref();

const filters = reactive({
  page: 1,
  size: 10,
  keyword: '',
  offeringUnitId: null,
  status: null
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
  courseCode: [{ required: true, message: '请输入课程代码', trigger: 'blur' }],
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }]
};

function createForm(row = {}) {
  return {
    id: row.id || null,
    courseCode: row.courseCode || '',
    courseName: row.courseName || '',
    courseType: row.courseType || '',
    credit: Number(row.credit || 0),
    totalHours: row.totalHours ?? 0,
    theoryHours: row.theoryHours ?? 0,
    practiceHours: row.practiceHours ?? 0,
    offeringUnitId: row.offeringUnitId || null,
    status: row.status ?? 1,
    remark: row.remark || ''
  };
}

async function loadLookups() {
  collegeOptions.value = await lookupApi.colleges();
}

async function loadData() {
  loading.value = true;
  try {
    const result = await courseApi.listCourses(filters);
    pageData.records = result.records || [];
    pageData.total = result.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.keyword = '';
  filters.offeringUnitId = null;
  filters.status = null;
  loadData();
}

function openDialog(row) {
  dialog.form = createForm(row);
  dialog.visible = true;
}

async function submitDialog() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.value = true;
  try {
    const { id, ...payload } = dialog.form;
    id ? await courseApi.updateCourse(id, payload) : await courseApi.createCourse(payload);
    dialog.visible = false;
    ElMessage.success('课程信息已保存');
    await loadData();
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(row) {
  const nextStatus = row.status === 1 ? 0 : 1;
  await courseApi.updateCourseStatus(row.id, nextStatus);
  ElMessage.success(`课程已${nextStatus === 1 ? '启用' : '停用'}`);
  await loadData();
}

async function exportData() {
  await courseApi.exportCourses(filters);
}

async function removeCourse(row) {
  try {
    await ElMessageBox.confirm(`确认删除课程“${row.courseName}”吗？`, '删除确认', { type: 'warning' });
    await courseApi.deleteCourse(row.id);
    ElMessage.success('课程已删除');
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

.form-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 760px) {
  .form-grid,
  .form-grid--three {
    grid-template-columns: 1fr;
  }
}
</style>
