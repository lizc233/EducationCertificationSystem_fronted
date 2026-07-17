<template>
  <StandardPage
    title="课程学生名单"
    :breadcrumbs="['首页', '我的工作台', '课程学生名单']"
    description="查看任课课程下的选课学生名单，并按课程、班级筛选和导出。"
  >
    <template #actions>
      <el-button type="primary" :loading="loading.export" @click="runAction('export', '导出学生名单')">导出名单</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="课程">
          <el-select v-model="filters.course" clearable style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.className" clearable style="width: 180px;">
            <el-option v-for="item in classOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" placeholder="搜索学号或姓名" clearable style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.search" @click="runAction('search', '查询学生名单')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="选课学生列表">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="studentId" label="学号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="className" label="班级" min-width="120" />
        <el-table-column prop="course" label="课程" min-width="170" />
        <el-table-column prop="selectedAt" label="选课时间" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已选' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const loading = reactive({
  search: false,
  export: false
});

const filters = reactive({
  course: '',
  className: '',
  keyword: ''
});

const courseOptions = ['软件工程', '需求分析与建模', '课程设计', '软件测试'];
const classOptions = ['软工 2301', '软工 2302', '软工 2303'];

const rows = [
  { studentId: '20231001', name: '张晨', className: '软工 2301', course: '软件工程', selectedAt: '2026-07-18 08:02', status: '已选' },
  { studentId: '20231002', name: '李彤', className: '软工 2301', course: '软件工程', selectedAt: '2026-07-18 08:05', status: '已选' },
  { studentId: '20231003', name: '王宁', className: '软工 2301', course: '需求分析与建模', selectedAt: '2026-07-18 08:08', status: '已选' },
  { studentId: '20231004', name: '赵宇', className: '软工 2301', course: '需求分析与建模', selectedAt: '2026-07-18 08:10', status: '已选' },
  { studentId: '20231005', name: '陈越', className: '软工 2302', course: '软件工程', selectedAt: '2026-07-18 08:13', status: '已选' },
  { studentId: '20231006', name: '何川', className: '软工 2302', course: '课程设计', selectedAt: '2026-07-18 08:15', status: '已选' },
  { studentId: '20231007', name: '周帆', className: '软工 2302', course: '课程设计', selectedAt: '2026-07-18 08:18', status: '已选' },
  { studentId: '20231008', name: '吴航', className: '软工 2303', course: '软件测试', selectedAt: '2026-07-18 08:20', status: '已选' },
  { studentId: '20231009', name: '郑凯', className: '软工 2303', course: '软件测试', selectedAt: '2026-07-18 08:23', status: '已选' },
  { studentId: '20231010', name: '孙可', className: '软工 2303', course: '软件工程', selectedAt: '2026-07-18 08:28', status: '已选' }
];

const filteredRows = computed(() => {
  return rows.filter((item) => {
    const courseMatched = !filters.course || item.course === filters.course;
    const classMatched = !filters.className || item.className === filters.className;
    const keywordMatched = !filters.keyword || item.studentId.includes(filters.keyword) || item.name.includes(filters.keyword);
    return courseMatched && classMatched && keywordMatched;
  });
});

function resetFilters() {
  filters.course = '';
  filters.className = '';
  filters.keyword = '';
  ElMessage.success('已重置筛选条件');
}

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
