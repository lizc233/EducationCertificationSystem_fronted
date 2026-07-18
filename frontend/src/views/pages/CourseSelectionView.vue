<template>
  <StandardPage
    title="选课中心"
    :breadcrumbs="['首页', '我的学习', '选课中心']"
    description="查看当前可选课程、容量和截止时间，并完成选课或退选。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-courses')">查看我的课程</el-button>
      <el-button @click="router.push('/my-schedule')">查看我的课表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="学期">
          <el-input v-model.trim="filters.term" placeholder="如 2025-2026-2" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" placeholder="搜索课程或教师" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTasks">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="可选课程列表">
      <el-table v-loading="loading" :data="taskRows" border stripe>
        <el-table-column prop="courseName" label="课程名称" min-width="180" />
        <el-table-column prop="teacherName" label="授课教师" min-width="140" />
        <el-table-column prop="credit" label="学分" min-width="90" align="center" />
        <el-table-column label="容量 / 已选" min-width="120" align="center">
          <template #default="{ row }">
            {{ row.capacity }} / {{ row.selectedCount }}
          </template>
        </el-table-column>
        <el-table-column label="选课截止时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.selectionEndTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.selectionStatus] || 'info'" effect="light">
              {{ row.selectionStatusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.selectionStatus === 'AVAILABLE'"
              type="primary"
              link
              :loading="rowLoading[`select-${row.id}`]"
              @click="selectCourse(row)"
            >
              选课
            </el-button>
            <el-button
              v-else-if="row.selectionStatus === 'SELECTED'"
              type="danger"
              link
              :loading="rowLoading[`drop-${row.id}`]"
              @click="dropCourse(row)"
            >
              退选
            </el-button>
            <span v-else>{{ row.selectionStatusLabel }}</span>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const router = useRouter();
const loading = ref(false);
const taskRows = ref([]);
const rowLoading = reactive({});

const filters = reactive({
  term: '',
  keyword: ''
});

const statusTagMap = {
  AVAILABLE: 'success',
  SELECTED: 'warning',
  FULL: 'info',
  CLOSED: 'danger'
};

onMounted(() => {
  loadTasks();
});

async function loadTasks() {
  loading.value = true;
  try {
    const rows = await request.get('/course-selection/student/tasks', {
      params: {
        term: filters.term || undefined,
        keyword: filters.keyword || undefined
      }
    });
    taskRows.value = rows || [];
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.term = '';
  filters.keyword = '';
  loadTasks();
}

async function selectCourse(row) {
  rowLoading[`select-${row.id}`] = true;
  try {
    await request.post(`/course-selection/student/tasks/${row.id}/select`);
    ElMessage.success(`已选上 ${row.courseName}`);
    await loadTasks();
  } finally {
    rowLoading[`select-${row.id}`] = false;
  }
}

async function dropCourse(row) {
  try {
    await ElMessageBox.confirm(
      `确认退选“${row.courseName}”吗？仅在 ${formatDateTime(row.selectionEndTime)} 前允许退选。`,
      '退选确认',
      { type: 'warning' }
    );
  } catch {
    return;
  }

  rowLoading[`drop-${row.id}`] = true;
  try {
    await request.delete(`/course-selection/student/tasks/${row.id}/select`);
    ElMessage.success('退选成功');
    await loadTasks();
  } finally {
    rowLoading[`drop-${row.id}`] = false;
  }
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}
</script>
