<template>
  <StandardPage
    title="课程公告查看"
    :breadcrumbs="['首页', '我的学习', '课程公告查看']"
    description="按课程查看教师发布的公告，支持课程筛选和时间排序。"
  >
    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="课程">
          <el-select v-model="filters.course" clearable style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="课程公告列表">
      <div class="list-panel">
        <article v-for="item in filteredRows" :key="item.title" class="list-item">
          <div class="dashboard-action__row">
            <div>
              <div class="dashboard-action__title">{{ item.title }}</div>
              <div class="dashboard-action__desc">{{ item.course }} · {{ item.teacher }} · {{ item.content }}</div>
            </div>
            <div class="dashboard-action__time">{{ item.time }}</div>
          </div>
        </article>
      </div>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const courseOptions = ['软件工程', '数据库原理', '计算机网络', '操作系统', '工程伦理'];
const filters = reactive({
  course: ''
});

const rows = [
  { title: '软件工程课程项目分组公布', course: '软件工程', teacher: '李老师', content: '请于 2026 年 7 月 18 日前完成组队确认。', time: '2026-07-17' },
  { title: '数据库原理实验三说明', course: '数据库原理', teacher: '陈老师', content: '实验报告提交截止为 2026 年 7 月 20 日。', time: '2026-07-16' },
  { title: '计算机网络课堂调整', course: '计算机网络', teacher: '何老师', content: '周二课程调整至实验楼 403。', time: '2026-07-16' },
  { title: '操作系统随堂测验提醒', course: '操作系统', teacher: '周老师', content: '下周进行章节测验，请提前复习。', time: '2026-07-15' },
  { title: '工程伦理讨论安排', course: '工程伦理', teacher: '王老师', content: '本周讨论主题已更新。', time: '2026-07-15' },
  { title: '软件工程中期汇报要求', course: '软件工程', teacher: '李老师', content: '请按模板准备中期汇报材料。', time: '2026-07-14' },
  { title: '数据库原理答疑时间', course: '数据库原理', teacher: '陈老师', content: '周五下午 4 点线上答疑。', time: '2026-07-14' },
  { title: '计算机网络课后练习说明', course: '计算机网络', teacher: '何老师', content: '新增两道拓展题。', time: '2026-07-13' },
  { title: '操作系统作业提交提醒', course: '操作系统', teacher: '周老师', content: '作业二将在 2026 年 7 月 19 日截止。', time: '2026-07-13' },
  { title: '工程伦理案例阅读补充', course: '工程伦理', teacher: '王老师', content: '补充案例阅读材料已上传。', time: '2026-07-12' }
];

const filteredRows = computed(() => {
  return rows.filter((item) => !filters.course || item.course === filters.course);
});
</script>
