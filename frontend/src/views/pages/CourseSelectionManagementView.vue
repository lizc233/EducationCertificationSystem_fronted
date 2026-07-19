<template>
  <StandardPage
    title="选课管理"
    :breadcrumbs="['首页', '选课与成绩', '选课管理']"
    description="发布选课任务、控制容量、结束任务并查看学生选课名单。"
  >
    <template #actions>
      <el-button @click="loadTasks" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openDialog()">新增选课任务</el-button>
      <el-button :disabled="!taskRows.length" @click="exportTasks">导出任务</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="学期">
          <el-input v-model.trim="filters.term" placeholder="如 2025-2026-2" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 160px">
            <el-option label="未开始" value="NOT_STARTED" />
            <el-option label="进行中" value="OPEN" />
            <el-option label="已结束" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" placeholder="搜索课程或教师" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTasks">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">进行中任务</div>
        <div class="page-kpi__value">{{ openCount }}</div>
        <div class="page-kpi__desc">当前允许学生选课的任务数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">待开始任务</div>
        <div class="page-kpi__value">{{ pendingCount }}</div>
        <div class="page-kpi__desc">已配置完成但尚未开放选课的任务数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">已结束任务</div>
        <div class="page-kpi__value">{{ closedCount }}</div>
        <div class="page-kpi__desc">已结束并保留历史记录的选课任务数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">总选课人次</div>
        <div class="page-kpi__value">{{ totalSelectedCount }}</div>
        <div class="page-kpi__desc">当前筛选条件下所有任务累计已选人次。</div>
      </article>
    </section>

    <SectionCard title="选课任务列表">
      <el-table v-loading="loading" :data="taskRows" border stripe>
        <el-table-column prop="term" label="学期" min-width="120" />
        <el-table-column prop="courseName" label="课程名称" min-width="180" />
        <el-table-column prop="teacherName" label="授课教师" min-width="140" />
        <el-table-column prop="credit" label="学分" min-width="90" align="center" />
        <el-table-column label="已选 / 容量" min-width="120" align="center">
          <template #default="{ row }">
            {{ row.selectedCount }} / {{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column label="选课时间范围" min-width="280">
          <template #default="{ row }">
            {{ formatDateTime(row.selectionStartTime) }} 至 {{ formatDateTime(row.selectionEndTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status] || 'info'" effect="light">
              {{ row.statusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="openRosterDialog(row)">查看名单</el-button>
            <el-button type="warning" link :disabled="row.status === 'CLOSED'" @click="closeTask(row)">结束选课</el-button>
            <el-button type="danger" link @click="deleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增选课任务' : '编辑选课任务'"
      width="680px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="96px">
        <el-form-item label="学期" prop="term">
          <el-input v-model.trim="dialogForm.term" placeholder="如 2025-2026-2" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model.trim="dialogForm.courseName" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherName">
          <el-input v-model.trim="dialogForm.teacherName" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number v-model="dialogForm.credit" :min="0.5" :step="0.5" class="w-full" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="dialogForm.capacity" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="dialogForm.dateRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="dialogForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rosterDialogVisible" :title="rosterDialogTitle" width="760px" destroy-on-close>
      <el-table v-loading="rosterLoading" :data="rosterRows" border stripe>
        <el-table-column prop="studentNo" label="学号" min-width="140" />
        <el-table-column prop="studentName" label="姓名" min-width="120" />
        <el-table-column prop="className" label="班级" min-width="160" />
        <el-table-column label="选课时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.selectedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" effect="light">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const loading = ref(false);
const saving = ref(false);
const rosterLoading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref('create');
const rosterDialogVisible = ref(false);
const rosterDialogTitle = ref('选课名单');
const formRef = ref();
const taskRows = ref([]);
const rosterRows = ref([]);

const filters = reactive({
  term: '',
  status: '',
  keyword: ''
});

const dialogForm = reactive(createDialogForm());

const dialogRules = {
  term: [{ required: true, message: '请输入学期', trigger: 'blur' }],
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入授课教师', trigger: 'blur' }],
  credit: [{ required: true, message: '请输入学分', trigger: 'change' }],
  capacity: [{ required: true, message: '请输入容量', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }]
};

const statusTagMap = {
  NOT_STARTED: 'info',
  OPEN: 'success',
  CLOSED: 'warning'
};

const openCount = computed(() => taskRows.value.filter((item) => item.status === 'OPEN').length);
const pendingCount = computed(() => taskRows.value.filter((item) => item.status === 'NOT_STARTED').length);
const closedCount = computed(() => taskRows.value.filter((item) => item.status === 'CLOSED').length);
const totalSelectedCount = computed(() => taskRows.value.reduce((sum, item) => sum + Number(item.selectedCount || 0), 0));

onMounted(() => {
  loadTasks();
});

function createDialogForm() {
  return {
    id: null,
    term: '',
    courseName: '',
    teacherName: '',
    credit: 3,
    capacity: 40,
    dateRange: [],
    remark: ''
  };
}

function isMissingEndpoint(error) {
  return error?.response?.status === 404;
}

async function loadTasks() {
  loading.value = true;
  try {
    const rows = await request.get('/course-selection/admin/tasks', {
      params: {
        term: filters.term || undefined,
        status: filters.status || undefined,
        keyword: filters.keyword || undefined
      },
      skipErrorMessage: true
    });
    taskRows.value = rows || [];
  } catch (error) {
    if (!isMissingEndpoint(error)) {
      throw error;
    }
    taskRows.value = [];
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.term = '';
  filters.status = '';
  filters.keyword = '';
  loadTasks();
}

function openDialog(row = null) {
  dialogMode.value = row ? 'edit' : 'create';
  Object.assign(dialogForm, createDialogForm(), row ? {
    id: row.id,
    term: row.term,
    courseName: row.courseName,
    teacherName: row.teacherName,
    credit: Number(row.credit || 0),
    capacity: Number(row.capacity || 0),
    dateRange: [row.selectionStartTime, row.selectionEndTime],
    remark: row.remark || ''
  } : {});
  dialogVisible.value = true;
}

async function saveTask() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.value = true;
  try {
    const payload = {
      term: dialogForm.term,
      courseName: dialogForm.courseName,
      teacherName: dialogForm.teacherName,
      credit: Number(dialogForm.credit || 0),
      capacity: Number(dialogForm.capacity || 0),
      selectionStartTime: dialogForm.dateRange[0],
      selectionEndTime: dialogForm.dateRange[1],
      remark: dialogForm.remark
    };
    if (dialogMode.value === 'create') {
      await request.post('/course-selection/admin/tasks', payload);
      ElMessage.success('选课任务新增成功');
    } else {
      await request.put(`/course-selection/admin/tasks/${dialogForm.id}`, payload);
      ElMessage.success('选课任务更新成功');
    }
    dialogVisible.value = false;
    await loadTasks();
  } finally {
    saving.value = false;
  }
}

async function openRosterDialog(row) {
  rosterLoading.value = true;
  rosterDialogTitle.value = `${row.courseName} 选课名单`;
  rosterDialogVisible.value = true;
  try {
    const rows = await request.get(`/course-selection/admin/tasks/${row.id}/students`, {
      skipErrorMessage: true
    });
    rosterRows.value = rows || [];
  } catch (error) {
    if (!isMissingEndpoint(error)) {
      throw error;
    }
    rosterRows.value = [];
  } finally {
    rosterLoading.value = false;
  }
}

async function closeTask(row) {
  try {
    await ElMessageBox.confirm(`确认结束“${row.courseName}”的选课吗？`, '结束选课确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.post(`/course-selection/admin/tasks/${row.id}/close`);
  ElMessage.success('选课任务已结束');
  await loadTasks();
}

async function deleteTask(row) {
  try {
    await ElMessageBox.confirm(`确认删除“${row.courseName}”任务吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(`/course-selection/admin/tasks/${row.id}`);
  ElMessage.success('选课任务删除成功');
  await loadTasks();
}

function exportTasks() {
  const csvRows = [
    ['学期', '课程名称', '授课教师', '学分', '已选人数', '容量', '开始时间', '结束时间', '状态', '备注'],
    ...taskRows.value.map((item) => [
      item.term,
      item.courseName,
      item.teacherName,
      item.credit,
      item.selectedCount,
      item.capacity,
      formatDateTime(item.selectionStartTime),
      formatDateTime(item.selectionEndTime),
      item.statusLabel,
      item.remark || ''
    ])
  ];
  const csvContent = `\uFEFF${csvRows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `course-selection-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success('选课任务导出成功');
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}
</script>
