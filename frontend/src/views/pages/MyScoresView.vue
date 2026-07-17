<template>
  <StandardPage
    title="我的成绩"
    :breadcrumbs="['首页', '我的学习', '我的成绩']"
    description="学生个人成绩查询页，聚合课程成绩、绩点与成绩变化。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-achievement')">查看达成度报告</el-button>
      <el-button @click="router.push('/survey/fill')">前往问卷填报</el-button>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.25fr) 340px;">
      <SectionCard title="成绩列表">
        <el-table :data="scoreRows" border stripe>
          <el-table-column prop="term" label="学期" min-width="120" />
          <el-table-column prop="course" label="课程" min-width="180" />
          <el-table-column prop="credit" label="学分" min-width="80" />
          <el-table-column prop="usual" label="平时" min-width="80" />
          <el-table-column prop="exam" label="期末" min-width="80" />
          <el-table-column prop="total" label="总评" min-width="80" />
          <el-table-column prop="gpa" label="绩点" min-width="80" />
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

        <SectionCard title="最近发布">
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
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();

const scoreRows = [
  { term: '2025-2026-2', course: '软件工程', credit: 3, usual: 92, exam: 90, total: 91, gpa: 4.0, status: '已发布' },
  { term: '2025-2026-2', course: '数据库原理', credit: 3.5, usual: 88, exam: 84, total: 86, gpa: 3.8, status: '已发布' },
  { term: '2025-2026-2', course: '计算机网络', credit: 3, usual: 90, exam: 87, total: 89, gpa: 3.9, status: '已发布' },
  { term: '2025-2026-2', course: '工程伦理', credit: 1.5, usual: 94, exam: 92, total: 93, gpa: 4.0, status: '已发布' },
  { term: '2025-2026-1', course: '操作系统', credit: 4, usual: 85, exam: 88, total: 87, gpa: 3.8, status: '已发布' }
];

const statCards = [
  { label: '平均成绩', value: '88.5', desc: '较上学期提升 2.4 分。' },
  { label: '累计学分', value: '86', desc: '距离毕业要求还差 64 学分。' },
  { label: '最高课程总评', value: '93', desc: '工程伦理。' }
];

const latestScores = [
  { course: '软件工程', desc: '课程目标 2 达成优良，建议继续保持项目实践投入。', time: '2026-07-16' },
  { course: '数据库原理', desc: '实验成绩已完成复核，当前总评 86 分。', time: '2026-07-15' },
  { course: '计算机网络', desc: '已开放总评明细查看。', time: '2026-07-13' }
];
</script>
