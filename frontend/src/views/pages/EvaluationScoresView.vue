<template>
  <StandardPage title="按课程目标成绩管理" :breadcrumbs="['首页', '评价与达成', '按课程目标成绩管理']" description="按学期和课程维护课程目标成绩，并支持导入、导出与锁定。">
    <template #actions>
      <el-button type="primary" :loading="loading.import" @click="runAction('import', '导入成绩')">导入成绩</el-button>
      <el-button :loading="loading.export" @click="runAction('export', '导出成绩')">导出成绩</el-button>
      <el-button :loading="loading.lock" @click="runAction('lock', '提交锁定')">提交锁定</el-button>
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
            <el-option label="软件工程" value="软件工程" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.search" @click="runAction('search', '查询成绩')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="学生成绩列表">
      <el-table :data="scores" border stripe>
        <el-table-column prop="studentId" label="学号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="className" label="班级" min-width="120" />
        <el-table-column prop="homework" label="平时作业" min-width="100" />
        <el-table-column prop="lab" label="实验报告" min-width="100" />
        <el-table-column prop="project" label="课程项目" min-width="100" />
        <el-table-column prop="total" label="总分" min-width="90" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openWorkspace('view', row)">查看详情</el-button>
            <el-button type="primary" link @click="openWorkspace('edit', row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const route = useRoute();
const router = useRouter();
const loading = reactive({
  import: false,
  export: false,
  lock: false,
  search: false
});

const selector = reactive({
  term: '2025-2026-2',
  course: '软件工程'
});

const scores = [
  { id: 'score-1', studentId: '20230001', name: '刘晨', className: '软工 2301', homework: 85, lab: 88, project: 90, total: 88.2 },
  { id: 'score-2', studentId: '20230002', name: '孙悦', className: '软工 2301', homework: 78, lab: 82, project: 86, total: 82.0 },
  { id: 'score-3', studentId: '20230003', name: '何宇', className: '软工 2301', homework: 92, lab: 95, project: 94, total: 93.9 },
  { id: 'score-4', studentId: '20230004', name: '杨帆', className: '软工 2301', homework: 76, lab: 80, project: 84, total: 80.4 },
  { id: 'score-5', studentId: '20230005', name: '陈楠', className: '软工 2302', homework: 88, lab: 87, project: 92, total: 89.6 },
  { id: 'score-6', studentId: '20230006', name: '顾安', className: '软工 2302', homework: 81, lab: 83, project: 86, total: 83.9 },
  { id: 'score-7', studentId: '20230007', name: '罗佳', className: '软工 2302', homework: 79, lab: 82, project: 80, total: 80.4 },
  { id: 'score-8', studentId: '20230008', name: '马腾', className: '软工 2302', homework: 90, lab: 94, project: 95, total: 93.2 },
  { id: 'score-9', studentId: '20230009', name: '张宁', className: '软工 2303', homework: 74, lab: 78, project: 81, total: 78.2 },
  { id: 'score-10', studentId: '20230010', name: '邵琪', className: '软工 2303', homework: 86, lab: 88, project: 89, total: 87.9 }
];

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}

function resetFilters() {
  selector.term = '2025-2026-2';
  selector.course = '软件工程';
  ElMessage.success('已重置筛选条件');
}

async function openWorkspace(mode, row) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'evaluation-scores', mode, id: row.id },
    query: {
      from: route.path,
      title: '按课程目标成绩管理',
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'studentId', label: '学号', type: 'input' },
        { prop: 'name', label: '姓名', type: 'input' },
        { prop: 'className', label: '班级', type: 'input' },
        { prop: 'homework', label: '平时作业', type: 'input' },
        { prop: 'lab', label: '实验报告', type: 'input' },
        { prop: 'project', label: '课程项目', type: 'input' },
        { prop: 'total', label: '总分', type: 'input' }
      ])
    }
  });
}
</script>
