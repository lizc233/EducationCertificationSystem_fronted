<template>
  <StandardPage
    :title="pageTitle"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <template #actions>
      <el-button
        v-for="action in actions"
        :key="action.key"
        :type="action.type || 'default'"
        :loading="loading[action.key]"
        @click="runAction(action.key, action.label)"
      >
        {{ action.label }}
      </el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="selector">
        <el-form-item label="学期">
          <el-select v-model="selector.term" style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="selector.course" style="width: 240px;">
            <el-option v-for="item in availableCourses" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="selector.className" style="width: 180px;">
            <el-option v-for="item in availableClasses" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.search" @click="runAction('search', isTeacher ? '查询成绩录入' : '查询成绩总表')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" :style="{ gridTemplateColumns: isTeacher ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)' }">
      <SectionCard :title="isTeacher ? '成绩录入列表' : '课程目标成绩总表'">
        <el-table :data="scores" border stripe>
          <el-table-column prop="studentId" label="学号" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="usual" label="平时" min-width="90" />
          <el-table-column prop="midterm" label="期中" min-width="90" />
          <el-table-column prop="finalExam" label="期末" min-width="90" />
          <el-table-column prop="total" label="总分" min-width="90" />
          <el-table-column prop="auditStatus" label="审核状态" min-width="110">
            <template #default="{ row }">
              <el-tag :type="auditTag[row.auditStatus]">{{ row.auditStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link @click="openWorkspace('view', row)">查看详情</el-button>
              <el-button type="primary" link @click="openWorkspace('edit', row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <SectionCard v-if="isTeacher" title="提交审核提示">
        <div class="list-panel">
          <article v-for="item in teacherTips" :key="item.title" class="list-item">
            <div class="dashboard-action__title">{{ item.title }}</div>
            <div class="dashboard-action__desc">{{ item.desc }}</div>
            <div class="dashboard-action__time">{{ item.time }}</div>
          </article>
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigationV2';
import { useUserStore } from '../../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER || route.path === '/score-input');

const loading = reactive({
  import: false,
  export: false,
  submit: false,
  search: false
});

const selector = reactive({
  term: '2025-2026-2',
  course: '软件工程',
  className: '软工 2301'
});

const allCourses = ['软件工程', '需求分析与建模', '数据库原理', '计算机网络'];
const teacherCourses = ['软件工程', '需求分析与建模'];
const allClasses = ['软工 2301', '软工 2302', '计科 2303'];
const teacherClasses = ['软工 2301', '软工 2302'];

const availableCourses = computed(() => (isTeacher.value ? teacherCourses : allCourses));
const availableClasses = computed(() => (isTeacher.value ? teacherClasses : allClasses));

const pageTitle = computed(() => (isTeacher.value ? '成绩录入与提交' : '按课程目标成绩管理'));
const breadcrumbs = computed(() => {
  return isTeacher.value
    ? ['首页', '成绩管理', '成绩录入与提交']
    : ['首页', '评价与达成', '按课程目标成绩管理'];
});

const pageDescription = computed(() => {
  return isTeacher.value
    ? '选择课程后录入学生成绩，提交后进入成绩审核流程，审核通过后学生端可见。'
    : '查看全校课程目标成绩总表、锁定状态和提交结果。';
});

const actions = computed(() => {
  if (isTeacher.value) {
    return [
      { key: 'submit', label: '提交审核', type: 'primary' }
    ];
  }

  return [
    { key: 'import', label: '导入成绩', type: 'primary' },
    { key: 'export', label: '导出成绩' }
  ];
});

const auditTag = {
  待提交: 'info',
  待审核: 'warning',
  已通过: 'success'
};

const sourceRows = [
  { id: 'score-1', studentId: '20230001', name: '刘晨', className: '软工 2301', course: '软件工程', usual: 85, midterm: 82, finalExam: 90, total: 86.8, auditStatus: '待审核' },
  { id: 'score-2', studentId: '20230002', name: '孙悦', className: '软工 2301', course: '软件工程', usual: 78, midterm: 80, finalExam: 86, total: 81.6, auditStatus: '待审核' },
  { id: 'score-3', studentId: '20230003', name: '何宇', className: '软工 2301', course: '软件工程', usual: 92, midterm: 91, finalExam: 94, total: 92.8, auditStatus: '已通过' },
  { id: 'score-4', studentId: '20230004', name: '杨帆', className: '软工 2301', course: '软件工程', usual: 76, midterm: 79, finalExam: 84, total: 79.8, auditStatus: '待审核' },
  { id: 'score-5', studentId: '20230005', name: '陈楠', className: '软工 2302', course: '需求分析与建模', usual: 88, midterm: 86, finalExam: 92, total: 88.8, auditStatus: '待提交' },
  { id: 'score-6', studentId: '20230006', name: '顾安', className: '软工 2302', course: '需求分析与建模', usual: 81, midterm: 82, finalExam: 86, total: 83.2, auditStatus: '待提交' },
  { id: 'score-7', studentId: '20230007', name: '罗佳', className: '软工 2302', course: '需求分析与建模', usual: 79, midterm: 80, finalExam: 80, total: 79.6, auditStatus: '待提交' },
  { id: 'score-8', studentId: '20230008', name: '马腾', className: '软工 2302', course: '需求分析与建模', usual: 90, midterm: 92, finalExam: 95, total: 92.6, auditStatus: '已通过' },
  { id: 'score-9', studentId: '20230009', name: '张宁', className: '计科 2303', course: '数据库原理', usual: 74, midterm: 76, finalExam: 81, total: 77.4, auditStatus: '已通过' },
  { id: 'score-10', studentId: '20230010', name: '邓琴', className: '计科 2303', course: '计算机网络', usual: 86, midterm: 88, finalExam: 89, total: 87.8, auditStatus: '已通过' }
];

const scores = computed(() => {
  return sourceRows.filter((item) => {
    const courseMatched = !selector.course || item.course === selector.course;
    const classMatched = !selector.className || item.className === selector.className;
    const roleMatched = !isTeacher.value || teacherCourses.includes(item.course);
    return courseMatched && classMatched && roleMatched;
  });
});

const teacherTips = [
  { title: '软件工程 2301 仍有 4 名学生待确认成绩', desc: '建议在 2026 年 7 月 17 日 18:00 前完成复核并提交审核。', time: '2026-07-17' },
  { title: '需求分析与建模批次尚未提交', desc: '提交审核后，教务老师会在 2026 年 7 月 18 日开始审核。', time: '2026-07-17' },
  { title: '审核通过后学生才可查看成绩', desc: '若被驳回，请根据原因修正后再次提交。', time: '2026-07-17' }
];

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}

function resetFilters() {
  selector.term = '2025-2026-2';
  selector.course = availableCourses.value[0];
  selector.className = availableClasses.value[0];
  ElMessage.success('已重置筛选条件');
}

async function openWorkspace(mode, row) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: isTeacher.value ? 'score-input' : 'evaluation-scores', mode, id: row.id },
    query: {
      from: route.path,
      title: pageTitle.value,
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'studentId', label: '学号', type: 'input' },
        { prop: 'name', label: '姓名', type: 'input' },
        { prop: 'className', label: '班级', type: 'input' },
        { prop: 'usual', label: '平时成绩', type: 'input' },
        { prop: 'midterm', label: '期中成绩', type: 'input' },
        { prop: 'finalExam', label: '期末成绩', type: 'input' },
        { prop: 'total', label: '总分', type: 'input' }
      ])
    }
  });
}
</script>
