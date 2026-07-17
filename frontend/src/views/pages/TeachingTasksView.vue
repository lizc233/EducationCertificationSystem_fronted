<template>
  <StandardPage
    title="授课任务"
    :breadcrumbs="['首页', '教学执行', '授课任务']"
    description="安排学期授课任务，并从教师视角查看“我的授课”列表。"
  >
    <template #actions>
      <el-button type="primary" @click="openDialog()">新建任务</el-button>
      <el-button @click="loadTasks">刷新列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="学期">
          <el-select v-model="filters.semesterId" clearable filterable style="width: 200px;">
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" clearable filterable style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.classId" clearable filterable style="width: 220px;">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select v-model="filters.teacherId" clearable filterable style="width: 220px;">
            <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.taskStatus" clearable style="width: 180px;">
            <el-option v-for="item in taskStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="任务编号 / 安排说明 / 备注" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.tasks" @click="loadTasks">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="任务列表">
      <el-table v-loading="loading.tasks" :data="taskPage.records" border stripe>
        <el-table-column prop="taskCode" label="任务编号" min-width="160" />
        <el-table-column label="学期" min-width="150">
          <template #default="{ row }">{{ resolveOptionLabel(semesterOptions, row.semesterId) }}</template>
        </el-table-column>
        <el-table-column label="课程" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(courseOptions, row.courseId) }}</template>
        </el-table-column>
        <el-table-column label="班级" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(classOptions, row.classId) }}</template>
        </el-table-column>
        <el-table-column label="教师" min-width="160">
          <template #default="{ row }">{{ resolveOptionLabel(teacherOptions, row.teacherId) }}</template>
        </el-table-column>
        <el-table-column label="方案版本" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(versionOptions, row.programVersionId) }}</template>
        </el-table-column>
        <el-table-column prop="totalHours" label="总学时" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.taskStatus === 'PUBLISHED' ? 'success' : row.taskStatus === 'REVOKED' ? 'warning' : 'info'">
              {{ resolveOptionLabel(taskStatusOptions, row.taskStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scheduleDesc" label="安排说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" min-width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-dropdown trigger="click" @command="(status) => changeStatus(row, status)">
              <el-button type="primary" link>状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in taskStatusOptions" :key="item.value" :command="item.value">
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="removeTask(row)">删除</el-button>
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
          :total="taskPage.total"
          @current-change="loadTasks"
          @size-change="loadTasks"
        />
      </div>
    </SectionCard>

    <SectionCard title="我的授课">
      <template #extra>
        <el-select v-model="myTaskTeacherId" filterable placeholder="选择教师查看" style="width: 240px;" @change="loadMyTasks">
          <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>

      <el-table v-loading="loading.myTasks" :data="myTasks.records" border stripe>
        <el-table-column prop="taskCode" label="任务编号" min-width="160" />
        <el-table-column label="学期" min-width="150">
          <template #default="{ row }">{{ resolveOptionLabel(semesterOptions, row.semesterId) }}</template>
        </el-table-column>
        <el-table-column label="课程" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(courseOptions, row.courseId) }}</template>
        </el-table-column>
        <el-table-column label="班级" min-width="180">
          <template #default="{ row }">{{ resolveOptionLabel(classOptions, row.classId) }}</template>
        </el-table-column>
        <el-table-column prop="totalHours" label="总学时" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.taskStatus === 'PUBLISHED' ? 'success' : row.taskStatus === 'REVOKED' ? 'warning' : 'info'">
              {{ resolveOptionLabel(taskStatusOptions, row.taskStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="dialog.visible" :title="dialog.form.id ? '编辑授课任务' : '新建授课任务'" width="720px">
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="任务编号">
            <el-input v-model.trim="dialog.form.taskCode" placeholder="可留空，后端自动生成" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="dialog.form.taskStatus" style="width: 100%;">
              <el-option v-for="item in taskStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="学期" prop="semesterId">
            <el-select v-model="dialog.form.semesterId" filterable style="width: 100%;">
              <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程" prop="courseId">
            <el-select v-model="dialog.form.courseId" filterable style="width: 100%;">
              <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="班级" prop="classId">
            <el-select v-model="dialog.form.classId" filterable style="width: 100%;">
              <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="教师" prop="teacherId">
            <el-select v-model="dialog.form.teacherId" filterable style="width: 100%;">
              <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="方案版本">
            <el-select v-model="dialog.form.programVersionId" filterable clearable style="width: 100%;">
              <el-option v-for="item in versionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="总学时">
            <el-input-number v-model="dialog.form.totalHours" :min="0" style="width: 100%;" />
          </el-form-item>
        </div>
        <el-form-item label="安排说明"><el-input v-model="dialog.form.scheduleDesc" type="textarea" :rows="3" /></el-form-item>
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
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { lookupApi, resolveOptionLabel, taskStatusOptions, teachingApi } from '../../api/bc';

const loading = reactive({
  tasks: false,
  myTasks: false
});

const saving = ref(false);
const formRef = ref();

const semesterOptions = ref([]);
const courseOptions = ref([]);
const classOptions = ref([]);
const teacherOptions = ref([]);
const versionOptions = ref([]);

const filters = reactive({
  page: 1,
  size: 10,
  semesterId: null,
  courseId: null,
  classId: null,
  teacherId: null,
  taskStatus: '',
  keyword: ''
});

const taskPage = reactive({
  records: [],
  total: 0
});

const myTaskTeacherId = ref(null);
const myTasks = reactive({
  records: [],
  total: 0
});

const dialog = reactive({
  visible: false,
  form: {}
});

const rules = {
  semesterId: [{ required: true, message: '请选择学期', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }]
};

function createForm(row = {}) {
  return {
    id: row.id || null,
    taskCode: row.taskCode || '',
    semesterId: row.semesterId || null,
    courseId: row.courseId || null,
    classId: row.classId || null,
    teacherId: row.teacherId || null,
    programVersionId: row.programVersionId || null,
    taskStatus: row.taskStatus || 'DRAFT',
    totalHours: row.totalHours ?? 0,
    scheduleDesc: row.scheduleDesc || '',
    remark: row.remark || ''
  };
}

async function loadLookups() {
  const [semesters, courses, classes, teachers, versions] = await Promise.all([
    lookupApi.semesters(),
    lookupApi.courses(),
    lookupApi.classes(),
    lookupApi.teachers(),
    lookupApi.programVersions()
  ]);
  semesterOptions.value = semesters;
  courseOptions.value = courses;
  classOptions.value = classes;
  teacherOptions.value = teachers;
  versionOptions.value = versions;
  if (!myTaskTeacherId.value && teacherOptions.value.length) {
    myTaskTeacherId.value = teacherOptions.value[0].value;
  }
}

async function loadTasks() {
  loading.tasks = true;
  try {
    const result = await teachingApi.listTasks(filters);
    taskPage.records = result.records || [];
    taskPage.total = result.total || 0;
  } finally {
    loading.tasks = false;
  }
}

async function loadMyTasks() {
  if (!myTaskTeacherId.value) {
    myTasks.records = [];
    myTasks.total = 0;
    return;
  }
  loading.myTasks = true;
  try {
    const result = await teachingApi.listMyTasks({
      teacherId: myTaskTeacherId.value,
      page: 1,
      size: 50
    });
    myTasks.records = result.records || [];
    myTasks.total = result.total || 0;
  } finally {
    loading.myTasks = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.semesterId = null;
  filters.courseId = null;
  filters.classId = null;
  filters.teacherId = null;
  filters.taskStatus = '';
  filters.keyword = '';
  loadTasks();
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
    id ? await teachingApi.updateTask(id, payload) : await teachingApi.createTask(payload);
    dialog.visible = false;
    ElMessage.success('授课任务已保存');
    await Promise.all([loadTasks(), loadMyTasks()]);
  } finally {
    saving.value = false;
  }
}

async function changeStatus(row, status) {
  if (row.taskStatus === status) {
    return;
  }
  await teachingApi.updateTaskStatus(row.id, status);
  ElMessage.success('任务状态已更新');
  await Promise.all([loadTasks(), loadMyTasks()]);
}

async function removeTask(row) {
  try {
    await ElMessageBox.confirm(`确认删除任务“${row.taskCode}”吗？`, '删除确认', { type: 'warning' });
    await teachingApi.deleteTask(row.id);
    ElMessage.success('授课任务已删除');
    await Promise.all([loadTasks(), loadMyTasks()]);
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadLookups();
  await Promise.all([loadTasks(), loadMyTasks()]);
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
