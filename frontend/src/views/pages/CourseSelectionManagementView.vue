<template>
  <StandardPage
    title="选课管理"
    :breadcrumbs="['首页', '选课与成绩', '选课管理']"
    description="发布选课任务、控制可选人数、查看名单并跟踪选课状态。"
  >
    <template #actions>
      <el-button type="primary" :loading="actionLoading.create" @click="openDialog()">新增选课任务</el-button>
      <el-button :loading="actionLoading.export" @click="runAction('export', '导出选课任务')">导出任务</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="学期">
          <el-select v-model="filters.term" clearable style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
            <el-option label="2025-2026-1" value="2025-2026-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 160px;">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model.trim="filters.keyword" placeholder="搜索课程名称" clearable style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="actionLoading.search" @click="runAction('search', '查询选课任务')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="page-kpis">
      <article v-for="item in stats" :key="item.label" class="page-kpi">
        <div class="page-kpi__label">{{ item.label }}</div>
        <div class="page-kpi__value">{{ item.value }}</div>
        <div class="page-kpi__desc">{{ item.desc }}</div>
      </article>
    </div>

    <SectionCard title="选课任务列表">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="term" label="学期" min-width="120" />
        <el-table-column prop="course" label="课程名称" min-width="180" />
        <el-table-column prop="teacher" label="授课教师" min-width="120" />
        <el-table-column prop="capacityText" label="已选人数 / 可选人数" min-width="150" />
        <el-table-column prop="timeRange" label="选课时间范围" min-width="220" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link :loading="rowLoading[`view-${row.id}`]" @click="openStudentDialog(row)">查看名单</el-button>
            <el-button type="danger" link :loading="rowLoading[`end-${row.id}`]" @click="endSelection(row)">结束选课</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增选课任务' : '编辑选课任务'" width="680px">
      <el-form :model="dialogForm" label-position="top">
        <el-form-item label="学期">
          <el-select v-model="dialogForm.term">
            <el-option label="2025-2026-2" value="2025-2026-2" />
            <el-option label="2025-2026-1" value="2025-2026-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="dialogForm.course" />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="dialogForm.teacher" />
        </el-form-item>
        <el-form-item label="可选人数">
          <el-input v-model="dialogForm.capacity" />
        </el-form-item>
        <el-form-item label="选课时间范围">
          <el-input v-model="dialogForm.timeRange" placeholder="例如 2026-07-18 08:00 至 2026-07-25 18:00" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading.save" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="studentDialogVisible" :title="studentDialogTitle" width="760px">
      <el-table :data="studentRows" border stripe>
        <el-table-column prop="studentId" label="学号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="className" label="班级" min-width="120" />
        <el-table-column prop="selectedAt" label="选课时间" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已选' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const filters = reactive({
  term: '',
  status: '',
  keyword: ''
});

const dialogVisible = ref(false);
const dialogMode = ref('create');
const studentDialogVisible = ref(false);
const studentDialogTitle = ref('选课名单');
const actionLoading = reactive({
  create: false,
  search: false,
  save: false,
  export: false
});
const rowLoading = reactive({});
const dialogForm = reactive({
  id: '',
  term: '2025-2026-2',
  course: '',
  teacher: '',
  capacity: '80',
  timeRange: ''
});

const rows = ref([
  { id: 'sel-1', term: '2025-2026-2', course: '软件工程', teacher: '李老师', selected: 76, capacity: 80, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' },
  { id: 'sel-2', term: '2025-2026-2', course: '数据库原理', teacher: '陈老师', selected: 62, capacity: 70, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' },
  { id: 'sel-3', term: '2025-2026-2', course: '计算机网络', teacher: '何老师', selected: 58, capacity: 60, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' },
  { id: 'sel-4', term: '2025-2026-2', course: '工程伦理', teacher: '王老师', selected: 40, capacity: 45, timeRange: '2026-07-20 08:00 至 2026-07-27 18:00', status: '未开始' },
  { id: 'sel-5', term: '2025-2026-2', course: '操作系统', teacher: '周老师', selected: 54, capacity: 55, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' },
  { id: 'sel-6', term: '2025-2026-2', course: '编译原理', teacher: '孙老师', selected: 43, capacity: 45, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' },
  { id: 'sel-7', term: '2025-2026-1', course: '离散数学', teacher: '张老师', selected: 70, capacity: 70, timeRange: '2026-02-10 08:00 至 2026-02-18 18:00', status: '已结束' },
  { id: 'sel-8', term: '2025-2026-1', course: '数据结构', teacher: '吴老师', selected: 68, capacity: 72, timeRange: '2026-02-10 08:00 至 2026-02-18 18:00', status: '已结束' },
  { id: 'sel-9', term: '2025-2026-2', course: '人工智能导论', teacher: '赵老师', selected: 35, capacity: 40, timeRange: '2026-07-19 08:00 至 2026-07-24 18:00', status: '未开始' },
  { id: 'sel-10', term: '2025-2026-2', course: '软件测试', teacher: '黄老师', selected: 48, capacity: 50, timeRange: '2026-07-18 08:00 至 2026-07-25 18:00', status: '进行中' }
]);

const studentRows = ref([
  { studentId: '20231001', name: '张晨', className: '软工 2301', selectedAt: '2026-07-18 08:02', status: '已选' },
  { studentId: '20231002', name: '李彤', className: '软工 2301', selectedAt: '2026-07-18 08:05', status: '已选' },
  { studentId: '20231003', name: '王宁', className: '软工 2301', selectedAt: '2026-07-18 08:08', status: '已选' },
  { studentId: '20231004', name: '赵宇', className: '软工 2301', selectedAt: '2026-07-18 08:10', status: '已选' },
  { studentId: '20231005', name: '陈越', className: '软工 2302', selectedAt: '2026-07-18 08:13', status: '已选' },
  { studentId: '20231006', name: '何川', className: '软工 2302', selectedAt: '2026-07-18 08:15', status: '已选' },
  { studentId: '20231007', name: '周帆', className: '软工 2302', selectedAt: '2026-07-18 08:18', status: '已选' },
  { studentId: '20231008', name: '吴航', className: '软工 2303', selectedAt: '2026-07-18 08:20', status: '已选' },
  { studentId: '20231009', name: '郑凯', className: '软工 2303', selectedAt: '2026-07-18 08:23', status: '已选' },
  { studentId: '20231010', name: '孙可', className: '软工 2303', selectedAt: '2026-07-18 08:28', status: '已选' }
]);

const stats = [
  { label: '进行中任务', value: '6', desc: '当前允许学生选课的任务数量。' },
  { label: '待开始任务', value: '2', desc: '已配置但尚未开启的选课任务。' },
  { label: '已结束任务', value: '2', desc: '已关闭并保留历史记录的任务。' },
  { label: '总选课人次', value: '554', desc: '本学期累计选课记录总数。' }
];

const statusTag = {
  未开始: 'info',
  进行中: 'success',
  已结束: 'warning'
};

const filteredRows = computed(() => {
  return rows.value
    .map((item) => ({
      ...item,
      capacityText: `${item.selected} / ${item.capacity}`
    }))
    .filter((item) => {
      const termMatched = !filters.term || item.term === filters.term;
      const statusMatched = !filters.status || item.status === filters.status;
      const keywordMatched = !filters.keyword || item.course.includes(filters.keyword);
      return termMatched && statusMatched && keywordMatched;
    });
});

function resetFilters() {
  filters.term = '';
  filters.status = '';
  filters.keyword = '';
  ElMessage.success('已重置筛选条件');
}

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'create';
  dialogForm.id = row?.id || '';
  dialogForm.term = row?.term || '2025-2026-2';
  dialogForm.course = row?.course || '';
  dialogForm.teacher = row?.teacher || '';
  dialogForm.capacity = row?.capacity ? String(row.capacity) : '80';
  dialogForm.timeRange = row?.timeRange || '';
  dialogVisible.value = true;
}

async function saveTask() {
  actionLoading.save = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  if (dialogMode.value === 'create') {
    rows.value.unshift({
      id: `sel-${Date.now()}`,
      term: dialogForm.term,
      course: dialogForm.course,
      teacher: dialogForm.teacher,
      selected: 0,
      capacity: Number(dialogForm.capacity || 0),
      timeRange: dialogForm.timeRange,
      status: '未开始'
    });
  } else {
    const target = rows.value.find((item) => item.id === dialogForm.id);
    if (target) {
      target.term = dialogForm.term;
      target.course = dialogForm.course;
      target.teacher = dialogForm.teacher;
      target.capacity = Number(dialogForm.capacity || 0);
      target.timeRange = dialogForm.timeRange;
    }
  }

  actionLoading.save = false;
  dialogVisible.value = false;
  ElMessage.success('保存成功');
}

async function openStudentDialog(row) {
  rowLoading[`view-${row.id}`] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  studentDialogTitle.value = `${row.course} 选课名单`;
  studentDialogVisible.value = true;
  rowLoading[`view-${row.id}`] = false;
}

async function endSelection(row) {
  try {
    await ElMessageBox.confirm(`确认结束“${row.course}”的选课吗？`, '结束选课确认', { type: 'warning' });
    rowLoading[`end-${row.id}`] = true;
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    row.status = '已结束';
    rowLoading[`end-${row.id}`] = false;
    ElMessage.success('选课任务已结束');
  } catch {
    ElMessage.info('已取消结束操作');
  }
}

async function runAction(key, label) {
  actionLoading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  actionLoading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
