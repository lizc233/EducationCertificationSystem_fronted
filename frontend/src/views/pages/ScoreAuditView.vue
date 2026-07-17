<template>
  <StandardPage
    title="成绩审核"
    :breadcrumbs="['首页', '选课与成绩', '成绩审核']"
    description="查看教师提交的成绩批次，执行审核通过或驳回，并记录驳回原因。"
  >
    <template #actions>
      <el-button :loading="loading.export" @click="runAction('export', '导出审核列表')">导出</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="审核状态">
          <el-select v-model="filters.status" clearable style="width: 180px;">
            <el-option label="待审核" value="待审核" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已驳回" value="已驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model.trim="filters.teacher" placeholder="搜索教师姓名" clearable style="width: 220px;" />
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model.trim="filters.course" placeholder="搜索课程名称" clearable style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.search" @click="runAction('search', '查询审核任务')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.2fr) 320px;">
      <SectionCard title="成绩审核列表">
        <el-table :data="filteredRows" border stripe>
          <el-table-column prop="course" label="课程名称" min-width="170" />
          <el-table-column prop="teacher" label="授课教师" min-width="120" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="submittedAt" label="提交时间" min-width="180" />
          <el-table-column prop="status" label="审核状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="statusTag[row.status]">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :loading="rowLoading[`approve-${row.id}`]" @click="approve(row)">审核通过</el-button>
              <el-button type="danger" link :loading="rowLoading[`reject-${row.id}`]" @click="openRejectDialog(row)">驳回</el-button>
              <el-button type="primary" link @click="selectRow(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <SectionCard title="审核概况">
        <div class="list-panel">
          <article v-for="item in stats" :key="item.label" class="list-item">
            <div class="dashboard-action__title">{{ item.label }}</div>
            <div class="dashboard-action__desc">{{ item.desc }}</div>
            <div class="dashboard-action__time">{{ item.value }}</div>
          </article>
        </div>
        <div class="paper-note" style="margin-top: 16px;">
          当前选中课程：{{ currentRow.course }}，授课教师：{{ currentRow.teacher }}，如驳回请填写明确原因，便于教师重新提交。
        </div>
      </SectionCard>
    </div>

    <el-dialog v-model="rejectDialogVisible" title="驳回成绩提交" width="560px">
      <el-form label-position="top">
        <el-form-item label="驳回原因">
          <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="loading.reject" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const filters = reactive({
  status: '',
  teacher: '',
  course: ''
});

const loading = reactive({
  search: false,
  export: false,
  reject: false
});

const rowLoading = reactive({});
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const rejectTarget = ref(null);

const rows = ref([
  { id: 'audit-1', course: '软件工程', teacher: '李老师', className: '软工 2301', submittedAt: '2026-07-17 09:10', status: '待审核' },
  { id: 'audit-2', course: '软件工程', teacher: '李老师', className: '软工 2302', submittedAt: '2026-07-17 09:15', status: '待审核' },
  { id: 'audit-3', course: '数据库原理', teacher: '陈老师', className: '计科 2301', submittedAt: '2026-07-16 16:10', status: '已通过' },
  { id: 'audit-4', course: '计算机网络', teacher: '何老师', className: '计科 2302', submittedAt: '2026-07-16 15:40', status: '待审核' },
  { id: 'audit-5', course: '操作系统', teacher: '周老师', className: '计科 2303', submittedAt: '2026-07-15 18:20', status: '已驳回' },
  { id: 'audit-6', course: '人工智能导论', teacher: '赵老师', className: '智科 2301', submittedAt: '2026-07-15 17:30', status: '待审核' },
  { id: 'audit-7', course: '软件测试', teacher: '黄老师', className: '软工 2303', submittedAt: '2026-07-15 16:10', status: '待审核' },
  { id: 'audit-8', course: '编译原理', teacher: '孙老师', className: '计科 2304', submittedAt: '2026-07-14 19:00', status: '已通过' },
  { id: 'audit-9', course: '工程伦理', teacher: '王老师', className: '全校通识 2301', submittedAt: '2026-07-14 14:20', status: '待审核' },
  { id: 'audit-10', course: '需求分析与建模', teacher: '吴老师', className: '软工 2302', submittedAt: '2026-07-14 11:40', status: '已驳回' }
]);

const currentRow = ref(rows.value[0]);

const statusTag = {
  待审核: 'warning',
  已通过: 'success',
  已驳回: 'danger'
};

const filteredRows = computed(() => {
  return rows.value.filter((item) => {
    const statusMatched = !filters.status || item.status === filters.status;
    const teacherMatched = !filters.teacher || item.teacher.includes(filters.teacher);
    const courseMatched = !filters.course || item.course.includes(filters.course);
    return statusMatched && teacherMatched && courseMatched;
  });
});

const stats = computed(() => {
  const pending = rows.value.filter((item) => item.status === '待审核').length;
  const passed = rows.value.filter((item) => item.status === '已通过').length;
  const rejected = rows.value.filter((item) => item.status === '已驳回').length;

  return [
    { label: '待审核批次', value: `${pending}`, desc: '需要在本周内完成审核。' },
    { label: '已通过批次', value: `${passed}`, desc: '已通过后学生端可查看成绩。' },
    { label: '已驳回批次', value: `${rejected}`, desc: '教师需根据原因重新修正后提交。' }
  ];
});

function resetFilters() {
  filters.status = '';
  filters.teacher = '';
  filters.course = '';
  ElMessage.success('已重置筛选条件');
}

function selectRow(row) {
  currentRow.value = row;
  ElMessage.success(`已定位到 ${row.course} 审核记录`);
}

async function approve(row) {
  rowLoading[`approve-${row.id}`] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  row.status = '已通过';
  currentRow.value = row;
  rowLoading[`approve-${row.id}`] = false;
  ElMessage.success('审核通过成功');
}

function openRejectDialog(row) {
  rejectTarget.value = row;
  rejectReason.value = '';
  rejectDialogVisible.value = true;
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.error('请输入驳回原因');
    return;
  }

  loading.reject = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  rejectTarget.value.status = '已驳回';
  currentRow.value = rejectTarget.value;
  loading.reject = false;
  rejectDialogVisible.value = false;
  ElMessage.success('驳回成功');
}

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
