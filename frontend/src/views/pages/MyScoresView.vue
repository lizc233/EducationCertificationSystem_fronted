<template>
  <StandardPage
    title="我的成绩"
    :breadcrumbs="['首页', '我的学习', '我的成绩']"
    description="查看个人课程成绩、考核项分数、总评成绩，并按学期筛选。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-achievement')">查看达成度报告</el-button>
      <el-button @click="router.push('/academic-progress')">查看学业进度</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="学期">
          <el-select v-model="filters.term" clearable style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
            <el-option label="2025-2026-1" value="2025-2026-1" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.25fr) 340px;">
      <SectionCard title="成绩列表">
        <el-table :data="filteredRows" border stripe>
          <el-table-column prop="term" label="学期" min-width="120" />
          <el-table-column prop="course" label="课程名称" min-width="170" />
          <el-table-column prop="credit" label="学分" min-width="80" />
          <el-table-column prop="usual" label="平时成绩" min-width="90" />
          <el-table-column prop="midterm" label="期中成绩" min-width="90" />
          <el-table-column prop="finalExam" label="期末成绩" min-width="90" />
          <el-table-column prop="total" label="总评成绩" min-width="90" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已发布' ? 'success' : 'warning'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <div class="list-panel">
        <SectionCard title="成绩概览">
          <div class="student-stat-stack">
            <article v-for="item in statCards" :key="item.label" class="student-stat-card">
              <div class="student-stat-card__label">{{ item.label }}</div>
              <div class="student-stat-card__value">{{ item.value }}</div>
              <div class="student-stat-card__desc">{{ item.desc }}</div>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="最近发布成绩">
          <div class="list-panel">
            <article v-for="item in latestScores" :key="item.course" class="list-item">
              <div class="dashboard-action__title">{{ item.course }}</div>
              <div class="dashboard-action__desc">{{ item.desc }}</div>
              <div class="dashboard-action__time">{{ item.time }}</div>
            </article>
          </div>
        </SectionCard>
      </div>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const filters = reactive({
  term: ''
});

const rows = [
  { term: '2025-2026-2', course: '软件工程', credit: 3, usual: 92, midterm: 89, finalExam: 90, total: 91, status: '已发布' },
  { term: '2025-2026-2', course: '数据库原理', credit: 3.5, usual: 88, midterm: 84, finalExam: 86, total: 86, status: '已发布' },
  { term: '2025-2026-2', course: '计算机网络', credit: 3, usual: 90, midterm: 86, finalExam: 89, total: 89, status: '已发布' },
  { term: '2025-2026-2', course: '操作系统', credit: 4, usual: 84, midterm: 85, finalExam: 88, total: 87, status: '已发布' },
  { term: '2025-2026-2', course: '工程伦理', credit: 1.5, usual: 94, midterm: 93, finalExam: 92, total: 93, status: '已发布' },
  { term: '2025-2026-1', course: '人工智能导论', credit: 2, usual: 87, midterm: 88, finalExam: 90, total: 89, status: '已发布' },
  { term: '2025-2026-1', course: '软件测试', credit: 2, usual: 85, midterm: 83, finalExam: 86, total: 85, status: '已发布' },
  { term: '2025-2026-1', course: '编译原理', credit: 3, usual: 82, midterm: 84, finalExam: 85, total: 84, status: '已发布' },
  { term: '2025-2026-1', course: '离散数学', credit: 3, usual: 91, midterm: 90, finalExam: 92, total: 91, status: '已发布' },
  { term: '2025-2026-1', course: '数据结构', credit: 3.5, usual: 89, midterm: 88, finalExam: 90, total: 89, status: '已发布' }
];

const filteredRows = computed(() => {
  return rows.filter((item) => !filters.term || item.term === filters.term);
});

const statCards = [
  { label: '平均成绩', value: '88.5', desc: '相比 2025 年秋季学期提升 2.4 分。' },
  { label: '累计学分', value: '86', desc: '距离毕业要求还差 64 学分。' },
  { label: '已发布课程', value: '10', desc: '全部课程成绩均已开放查看。' }
];

const latestScores = [
  { course: '软件工程', desc: '总评成绩 91 分，课程目标 2 表现突出。', time: '2026-07-16' },
  { course: '数据库原理', desc: '实验成绩已完成复核，当前总评 86 分。', time: '2026-07-15' },
  { course: '计算机网络', desc: '已开放总评明细查看。', time: '2026-07-13' }
];
</script>
