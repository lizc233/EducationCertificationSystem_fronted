<template>
  <StandardPage
    :title="pageTitle"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <template #actions>
      <el-button v-for="action in actions" :key="action.path" :type="action.type || 'default'" @click="router.push(action.path)">
        {{ action.label }}
      </el-button>
    </template>

    <div v-if="isTeacher" class="split-grid" style="grid-template-columns: minmax(0, 1.15fr) 360px;">
      <SectionCard title="当前学期任教课程">
        <div class="feature-links">
          <button v-for="course in teacherCourses" :key="course.id" type="button" class="feature-link-card" @click="router.push('/course-students')">
            <div class="feature-link-card__eyebrow">{{ course.term }}</div>
            <div class="feature-link-card__title">{{ course.name }}</div>
            <div class="feature-link-card__desc">{{ course.className }} · {{ course.students }} 人 · {{ course.schedule }}</div>
            <div class="feature-link-card__desc">入口：进入课程 / 查看学生名单 / 发布公告</div>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="课程概览">
        <div class="teacher-pulse-grid">
          <article v-for="item in teacherStats" :key="item.label" class="teacher-pulse-card">
            <div class="teacher-pulse-card__label">{{ item.label }}</div>
            <div class="teacher-pulse-card__value">{{ item.value }}</div>
            <div class="teacher-pulse-card__desc">{{ item.desc }}</div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="课程资源清单" style="grid-column: 1 / -1;">
        <el-table :data="resourceRows" border stripe>
          <el-table-column prop="course" label="课程" min-width="160" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="resource" label="资源名称" min-width="220" />
          <el-table-column prop="type" label="类型" min-width="110" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '完整' ? 'success' : 'warning'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="preview(row)">查看</el-button>
              <el-button type="primary" link :loading="uploading" @click="upload">替换</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>

    <div v-else class="split-grid" style="grid-template-columns: minmax(0, 1.1fr) 360px;">
      <SectionCard title="已选课程">
        <el-table :data="studentCourses" border stripe>
          <el-table-column prop="course" label="课程名称" min-width="170" />
          <el-table-column prop="teacher" label="授课教师" min-width="120" />
          <el-table-column prop="schedule" label="上课时间" min-width="160" />
          <el-table-column prop="credit" label="学分" min-width="80" />
          <el-table-column prop="status" label="学习状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '进行中' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="router.push('/course-announcements-view')">查看公告</el-button>
              <el-button type="primary" link @click="router.push('/course-evaluate')">课程评价</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <SectionCard title="课程公告">
        <div class="list-panel">
          <article v-for="notice in courseNotices" :key="notice.title" class="list-item">
            <div class="dashboard-action__title">{{ notice.title }}</div>
            <div class="dashboard-action__desc">{{ notice.course }} · {{ notice.content }}</div>
            <div class="dashboard-action__time">{{ notice.time }}</div>
          </article>
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigationV2';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();
const uploading = ref(false);

const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER);

const pageTitle = computed(() => '我的课程');
const breadcrumbs = computed(() => ['首页', isTeacher.value ? '我的工作台' : '我的学习', '我的课程']);
const pageDescription = computed(() => {
  return isTeacher.value
    ? '查看当前学期任教课程、班级规模、资源状态和操作入口。'
    : '查看已选课程、任课教师、上课时间和课程公告。';
});

const actions = computed(() => {
  return isTeacher.value
    ? [
        { label: '我的课表', path: '/my-schedule', type: 'primary' },
        { label: '课程学生名单', path: '/course-students' },
        { label: '课程公告', path: '/course-announcements' }
      ]
    : [
        { label: '选课中心', path: '/course-selection', type: 'primary' },
        { label: '我的课表', path: '/my-schedule' },
        { label: '课程公告查看', path: '/course-announcements-view' }
      ];
});

const teacherCourses = [
  { id: 'tc-1', term: '2025-2026-2', name: '软件工程', className: '软工 2301', students: 76, schedule: '周一 1-2 节' },
  { id: 'tc-2', term: '2025-2026-2', name: '软件工程', className: '软工 2302', students: 74, schedule: '周二 3-4 节' },
  { id: 'tc-3', term: '2025-2026-2', name: '需求分析与建模', className: '软工 2301', students: 68, schedule: '周三 1-2 节' },
  { id: 'tc-4', term: '2025-2026-2', name: '需求分析与建模', className: '软工 2302', students: 70, schedule: '周三 3-4 节' },
  { id: 'tc-5', term: '2025-2026-2', name: '课程设计', className: '软工 2303', students: 42, schedule: '周四 1-4 节' },
  { id: 'tc-6', term: '2025-2026-2', name: '软件测试', className: '软工 2303', students: 48, schedule: '周五 1-2 节' }
];

const teacherStats = [
  { label: '任教课程数', value: '6', desc: '本学期共承担 6 门课程。' },
  { label: '覆盖班级数', value: '8', desc: '涉及 8 个教学班。' },
  { label: '总选课人数', value: '378', desc: '当前学生选课总人数。' },
  { label: '待补资源', value: '3', desc: '仍有 3 个资源项待补充。' }
];

const resourceRows = [
  { course: '软件工程', className: '软工 2301', resource: '软件工程教学大纲.pdf', type: '教学文档', updatedAt: '2026-07-16 09:30', status: '完整' },
  { course: '软件工程', className: '软工 2301', resource: '第 5 周课件.pptx', type: '课件', updatedAt: '2026-07-16 10:00', status: '完整' },
  { course: '软件工程', className: '软工 2302', resource: '实验指导书.docx', type: '实验文档', updatedAt: '2026-07-15 14:20', status: '完整' },
  { course: '需求分析与建模', className: '软工 2301', resource: '需求分析案例包.zip', type: '案例资料', updatedAt: '2026-07-15 16:10', status: '完整' },
  { course: '需求分析与建模', className: '软工 2302', resource: '第 6 周课件.pptx', type: '课件', updatedAt: '2026-07-14 18:00', status: '待补充' },
  { course: '课程设计', className: '软工 2303', resource: '评分细则.xlsx', type: '评分规则', updatedAt: '2026-07-14 11:10', status: '待补充' },
  { course: '软件测试', className: '软工 2303', resource: '课堂练习题.pdf', type: '习题', updatedAt: '2026-07-13 20:30', status: '完整' },
  { course: '软件测试', className: '软工 2303', resource: '测试用例模板.docx', type: '模板', updatedAt: '2026-07-13 20:45', status: '完整' },
  { course: '软件工程', className: '软工 2302', resource: '课程项目说明书.pdf', type: '项目说明', updatedAt: '2026-07-13 21:10', status: '完整' },
  { course: '课程设计', className: '软工 2303', resource: '答辩安排表.xlsx', type: '安排表', updatedAt: '2026-07-13 21:30', status: '完整' }
];

const studentCourses = [
  { course: '软件工程', teacher: '李老师', schedule: '周一 1-2 节', credit: 3, status: '进行中' },
  { course: '数据库原理', teacher: '陈老师', schedule: '周二 1-2 节', credit: 3.5, status: '进行中' },
  { course: '计算机网络', teacher: '何老师', schedule: '周二 5-6 节', credit: 3, status: '进行中' },
  { course: '操作系统', teacher: '周老师', schedule: '周三 1-2 节', credit: 4, status: '进行中' },
  { course: '工程伦理', teacher: '王老师', schedule: '周三 7-8 节', credit: 1.5, status: '进行中' },
  { course: '人工智能导论', teacher: '赵老师', schedule: '周四 3-4 节', credit: 2, status: '进行中' },
  { course: '软件测试', teacher: '黄老师', schedule: '周四 7-8 节', credit: 2, status: '进行中' },
  { course: '编译原理', teacher: '孙老师', schedule: '周五 1-2 节', credit: 3, status: '进行中' },
  { course: '离散数学', teacher: '张老师', schedule: '周五 3-4 节', credit: 3, status: '已修完' },
  { course: '数据结构', teacher: '吴老师', schedule: '周五 5-6 节', credit: 3.5, status: '已修完' }
];

const courseNotices = [
  { title: '软件工程课程项目分组公布', course: '软件工程', content: '请于 2026 年 7 月 18 日前完成组队确认。', time: '2026-07-17' },
  { title: '数据库原理实验三说明', course: '数据库原理', content: '实验报告提交截止为 2026 年 7 月 20 日。', time: '2026-07-16' },
  { title: '计算机网络课堂调整', course: '计算机网络', content: '周二第 5-6 节课程调整至实验楼 403。', time: '2026-07-16' },
  { title: '操作系统随堂测验提醒', course: '操作系统', content: '下周进行章节测验，请提前复习。', time: '2026-07-15' },
  { title: '工程伦理课程讨论安排', course: '工程伦理', content: '本周讨论主题已更新。', time: '2026-07-15' },
  { title: '人工智能导论补充材料', course: '人工智能导论', content: '补充阅读资料已上传。', time: '2026-07-14' },
  { title: '软件测试案例讲解安排', course: '软件测试', content: '周四课程将新增案例讨论环节。', time: '2026-07-14' },
  { title: '编译原理作业提交提醒', course: '编译原理', content: '作业一请在周日前提交。', time: '2026-07-13' },
  { title: '离散数学成绩复核说明', course: '离散数学', content: '如需复核请在 2026 年 7 月 19 日前申请。', time: '2026-07-13' },
  { title: '数据结构答疑时间', course: '数据结构', content: '本周五下午开放线上答疑。', time: '2026-07-12' }
];

async function upload() {
  uploading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  uploading.value = false;
  ElMessage.success('资源上传成功');
}

function preview(row) {
  ElMessage.success(`已打开 ${row.resource}`);
}
</script>
