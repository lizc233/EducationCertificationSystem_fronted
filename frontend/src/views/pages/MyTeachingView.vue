<template>
  <StandardPage
    title="我的授课任务"
    :breadcrumbs="['首页', '我的工作台', '我的授课任务']"
    description="按教学老师视角展示本学期授课安排、班级状态和近期教学待办。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/evaluation/scores')">进入成绩录入</el-button>
      <el-button @click="router.push('/evaluation/materials')">查看考核材料</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="学期">
          <el-select v-model="filters.term" style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filters.course" clearable style="width: 220px;">
            <el-option label="软件工程" value="软件工程" />
            <el-option label="需求分析与建模" value="需求分析与建模" />
            <el-option label="课程设计" value="课程设计" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.2fr) 360px;">
      <SectionCard title="本学期授课列表">
        <el-table :data="taskRows" border stripe>
          <el-table-column prop="course" label="课程" min-width="150" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="schedule" label="上课时间" min-width="140" />
          <el-table-column prop="location" label="地点" min-width="120" />
          <el-table-column prop="progress" label="进度" min-width="150">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :stroke-width="12" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="110">
            <template #default="{ row }">
              <el-tag :type="row.status === '待录成绩' ? 'warning' : 'success'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <div class="list-panel">
        <SectionCard title="今日提醒">
          <div class="list-panel">
            <article v-for="item in reminders" :key="item.title" class="list-item">
              <div class="dashboard-action__title">{{ item.title }}</div>
              <div class="dashboard-action__desc">{{ item.desc }}</div>
              <div class="dashboard-action__time">{{ item.time }}</div>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="教学节奏">
          <div class="teacher-pulse-grid">
            <article v-for="item in pulseCards" :key="item.label" class="teacher-pulse-card">
              <div class="teacher-pulse-card__label">{{ item.label }}</div>
              <div class="teacher-pulse-card__value">{{ item.value }}</div>
              <div class="teacher-pulse-card__desc">{{ item.desc }}</div>
            </article>
          </div>
        </SectionCard>
      </div>
    </div>
  </StandardPage>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();

const filters = reactive({
  term: '2025-2026-2',
  course: ''
});

const taskRows = [
  { course: '软件工程', className: '软工 2301', schedule: '周一 1-2 节', location: '主楼 402', progress: 65, status: '待录成绩' },
  { course: '软件工程', className: '软工 2302', schedule: '周二 3-4 节', location: '主楼 405', progress: 58, status: '进行中' },
  { course: '需求分析与建模', className: '软工 2301', schedule: '周三 1-2 节', location: '实训楼 201', progress: 72, status: '进行中' },
  { course: '需求分析与建模', className: '软工 2302', schedule: '周三 3-4 节', location: '实训楼 203', progress: 70, status: '进行中' },
  { course: '课程设计', className: '软工 2303', schedule: '周四 1-4 节', location: '机房 601', progress: 46, status: '待录成绩' }
];

const reminders = [
  { title: '软件工程 2301 成绩需在今天 18:00 前提交', desc: '课程目标 2 与课程目标 3 的项目成绩尚未锁定。', time: '今天 18:00' },
  { title: '需求分析与建模实验指导书待补充', desc: '资源目录中缺少第 6 周实验指导与评分细则。', time: '今天 20:00' },
  { title: '课程满意度问卷回收率 61%', desc: '建议提醒学生在本周内完成问卷填报。', time: '本周' }
];

const pulseCards = [
  { label: '本周课时', value: '14', desc: '包含理论课与实验课。' },
  { label: '待上传资源', value: '03', desc: '需补充课件、实验指导和评分说明。' },
  { label: '待处理材料', value: '05', desc: '考核证据材料待上传或待确认。' }
];
</script>
