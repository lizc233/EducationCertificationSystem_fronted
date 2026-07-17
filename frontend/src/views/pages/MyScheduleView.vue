<template>
  <StandardPage
    title="我的课表"
    :breadcrumbs="['首页', isTeacher ? '我的工作台' : '我的学习', '我的课表']"
    :description="isTeacher ? '按教师视角查看本周授课安排、教室与今日提醒。' : '按学生视角查看本周课程安排、教室与学习节奏。'"
  >
    <template #actions>
      <el-button type="primary" @click="router.push(isTeacher ? '/my-courses' : '/course-selection')">
        {{ isTeacher ? '返回我的课程' : '前往选课中心' }}
      </el-button>
      <el-button @click="router.push(isTeacher ? '/course-students' : '/course-announcements-view')">
        {{ isTeacher ? '查看学生名单' : '查看课程公告' }}
      </el-button>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.2fr) 320px;">
      <SectionCard title="本周课表">
        <el-table :data="scheduleRows" border stripe>
          <el-table-column prop="weekDay" label="星期" min-width="90" />
          <el-table-column prop="period" label="节次" min-width="100" />
          <el-table-column prop="course" label="课程名称" min-width="170" />
          <el-table-column :prop="isTeacher ? 'className' : 'teacher'" :label="isTeacher ? '班级' : '授课教师'" min-width="120" />
          <el-table-column prop="room" label="教室" min-width="120" />
          <el-table-column prop="time" label="时间" min-width="140" />
        </el-table>
      </SectionCard>

      <SectionCard :title="isTeacher ? '今日课程提醒' : '今日学习提醒'">
        <div class="list-panel">
          <article v-for="item in reminderRows" :key="item.title" class="list-item">
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();

const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER);

const teacherRows = [
  { weekDay: '周一', period: '1-2 节', course: '软件工程', className: '软工 2301', room: '主楼 402', time: '08:00-09:35' },
  { weekDay: '周一', period: '3-4 节', course: '软件工程', className: '软工 2302', room: '主楼 405', time: '10:00-11:35' },
  { weekDay: '周二', period: '5-6 节', course: '需求分析与建模', className: '软工 2301', room: '实训楼 201', time: '14:00-15:35' },
  { weekDay: '周二', period: '7-8 节', course: '需求分析与建模', className: '软工 2302', room: '实训楼 203', time: '16:00-17:35' },
  { weekDay: '周三', period: '1-2 节', course: '课程设计', className: '软工 2303', room: '机房 601', time: '08:00-09:35' },
  { weekDay: '周三', period: '3-4 节', course: '课程设计', className: '软工 2303', room: '机房 601', time: '10:00-11:35' },
  { weekDay: '周四', period: '5-6 节', course: '软件测试', className: '软工 2303', room: '主楼 408', time: '14:00-15:35' },
  { weekDay: '周四', period: '7-8 节', course: '软件测试', className: '软工 2303', room: '主楼 408', time: '16:00-17:35' },
  { weekDay: '周五', period: '1-2 节', course: '软件工程', className: '软工 2301', room: '主楼 402', time: '08:00-09:35' },
  { weekDay: '周五', period: '3-4 节', course: '需求分析与建模', className: '软工 2302', room: '实训楼 203', time: '10:00-11:35' }
];

const studentRows = [
  { weekDay: '周一', period: '1-2 节', course: '软件工程', teacher: '李老师', room: '主楼 402', time: '08:00-09:35' },
  { weekDay: '周一', period: '5-6 节', course: '数据库原理', teacher: '陈老师', room: '主楼 305', time: '14:00-15:35' },
  { weekDay: '周二', period: '1-2 节', course: '计算机网络', teacher: '何老师', room: '主楼 406', time: '08:00-09:35' },
  { weekDay: '周二', period: '7-8 节', course: '操作系统', teacher: '周老师', room: '主楼 501', time: '16:00-17:35' },
  { weekDay: '周三', period: '3-4 节', course: '工程伦理', teacher: '王老师', room: '文科楼 201', time: '10:00-11:35' },
  { weekDay: '周三', period: '5-6 节', course: '人工智能导论', teacher: '赵老师', room: '实验楼 301', time: '14:00-15:35' },
  { weekDay: '周四', period: '1-2 节', course: '软件测试', teacher: '黄老师', room: '主楼 408', time: '08:00-09:35' },
  { weekDay: '周四', period: '3-4 节', course: '编译原理', teacher: '孙老师', room: '主楼 502', time: '10:00-11:35' },
  { weekDay: '周五', period: '5-6 节', course: '离散数学', teacher: '张老师', room: '主楼 302', time: '14:00-15:35' },
  { weekDay: '周五', period: '7-8 节', course: '数据结构', teacher: '吴老师', room: '主楼 304', time: '16:00-17:35' }
];

const teacherReminders = [
  { title: '今天 08:00 软件工程 2301 上课', desc: '主楼 402，课前请确认项目分组讨论材料。', time: '今天' },
  { title: '今天 14:00 需求分析与建模作业讲评', desc: '需提前准备案例点评文件。', time: '今天' },
  { title: '本周五需提交成绩审核批次', desc: '软件工程 2301 成绩需在 2026 年 7 月 17 日前提交审核。', time: '本周' }
];

const studentReminders = [
  { title: '今天 08:00 软件工程上课', desc: '主楼 402，记得带课程项目记录本。', time: '今天' },
  { title: '数据库原理实验报告截止提醒', desc: '请在 2026 年 7 月 19 日前完成提交。', time: '本周' },
  { title: '软件测试课程公告已更新', desc: '新增案例讲解和课后练习说明。', time: '刚刚' }
];

const scheduleRows = computed(() => (isTeacher.value ? teacherRows : studentRows));
const reminderRows = computed(() => (isTeacher.value ? teacherReminders : studentReminders));
</script>
