<template>
  <StandardPage
    title="首页概览"
    :breadcrumbs="['首页', '首页概览']"
    :description="dashboardContent.description"
  >
    <template #actions>
      <el-button
        v-for="action in dashboardContent.actions"
        :key="action.path"
        :type="action.type || 'default'"
        @click="router.push(action.path)"
      >
        {{ action.label }}
      </el-button>
    </template>

    <div class="info-grid">
      <div v-for="item in dashboardContent.metrics" :key="item.label" class="metric-card">
        <div class="metric-card__label">{{ item.label }}</div>
        <div class="metric-card__value">{{ item.value }}</div>
        <div class="metric-card__trend" :class="item.trend >= 0 ? 'is-up' : 'is-down'">
          {{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
        </div>
        <div class="metric-card__sub">{{ item.sub }}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <SectionCard :title="dashboardContent.quickTitle">
        <div class="feature-links">
          <button
            v-for="item in dashboardContent.quickEntries"
            :key="item.path"
            type="button"
            class="feature-link-card"
            @click="router.push(item.path)"
          >
            <div class="feature-link-card__eyebrow">{{ item.group }}</div>
            <div class="feature-link-card__title">{{ item.label }}</div>
            <div class="feature-link-card__desc">{{ item.summary }}</div>
          </button>
        </div>
      </SectionCard>

      <SectionCard :title="dashboardContent.rightTitle">
        <div class="list-panel">
          <button
            v-for="item in dashboardContent.rightList"
            :key="item.title"
            type="button"
            class="list-item dashboard-action"
            @click="item.path ? router.push(item.path) : undefined"
          >
            <div class="dashboard-action__row">
              <div>
                <div class="dashboard-action__title">{{ item.title }}</div>
                <div class="dashboard-action__desc">{{ item.desc }}</div>
              </div>
              <div class="dashboard-action__time">{{ item.time }}</div>
            </div>
          </button>
        </div>
      </SectionCard>
    </div>

    <div class="dashboard-grid dashboard-grid--equal">
      <SectionCard :title="dashboardContent.leftBottomTitle">
        <template v-if="isStudent">
          <div class="study-progress-card">
            <div class="study-progress-card__header">
              <div>
                <div class="study-progress-card__label">学业进度</div>
                <div class="study-progress-card__value">86 / 150 学分</div>
              </div>
              <el-tag type="success">进度稳定</el-tag>
            </div>
            <el-progress :percentage="57" :stroke-width="16" />
            <div class="study-progress-card__meta">
              <span>本学期已修 18 学分</span>
              <span>待修核心课程 4 门</span>
            </div>
          </div>
        </template>
        <template v-else-if="isTeacher">
          <div class="list-panel">
            <article v-for="item in dashboardContent.leftBottomList" :key="item.title" class="list-item">
              <div class="dashboard-action__row">
                <div>
                  <div class="dashboard-action__title">{{ item.title }}</div>
                  <div class="dashboard-action__desc">{{ item.desc }}</div>
                </div>
                <el-tag :type="item.tagType || 'info'">{{ item.tag }}</el-tag>
              </div>
            </article>
          </div>
        </template>
        <template v-else>
          <div class="system-status-board">
            <article v-for="item in dashboardContent.leftBottomList" :key="item.title" class="status-board__item">
              <div class="status-board__title">{{ item.title }}</div>
              <div class="status-board__value">{{ item.value }}</div>
              <div class="status-board__desc">{{ item.desc }}</div>
            </article>
          </div>
        </template>
      </SectionCard>

      <SectionCard :title="dashboardContent.rightBottomTitle">
        <template v-if="isSuper">
          <div class="list-panel">
            <button
              v-for="item in dashboardContent.rightBottomList"
              :key="item.title"
              type="button"
              class="list-item dashboard-action"
              @click="router.push('/messages')"
            >
              <div class="dashboard-action__row">
                <div>
                  <div class="dashboard-action__title">{{ item.title }}</div>
                  <div class="dashboard-action__desc">{{ item.desc }}</div>
                </div>
                <div class="dashboard-action__time">{{ item.time }}</div>
              </div>
            </button>
          </div>
        </template>
        <template v-else-if="isTeacher">
          <el-table :data="teacherCourseRows" border stripe>
            <el-table-column prop="course" label="课程" min-width="150" />
            <el-table-column prop="className" label="班级" min-width="120" />
            <el-table-column prop="schedule" label="时间" min-width="140" />
            <el-table-column prop="status" label="状态" min-width="110">
              <template #default="{ row }">
                <el-tag :type="row.status === '待录成绩' ? 'warning' : 'success'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-else>
          <div class="list-panel">
            <article v-for="item in dashboardContent.rightBottomList" :key="item.title" class="list-item">
              <div class="dashboard-action__row">
                <div>
                  <div class="dashboard-action__title">{{ item.title }}</div>
                  <div class="dashboard-action__desc">{{ item.desc }}</div>
                </div>
                <div class="dashboard-action__time">{{ item.time }}</div>
              </div>
            </article>
          </div>
        </template>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import StandardPage from '../components/page/StandardPage.vue';
import SectionCard from '../components/page/SectionCard.vue';
import { ROLES } from '../data/navigation';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const isSuper = computed(() => userStore.userInfo.role === ROLES.SUPER);
const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER);
const isStudent = computed(() => userStore.userInfo.role === ROLES.STUDENT);

const teacherCourseRows = [
  { course: '软件工程', className: '软工 2301', schedule: '周一 1-2 节', status: '待录成绩' },
  { course: '需求分析与建模', className: '软工 2302', schedule: '周三 3-4 节', status: '进行中' },
  { course: '课程设计', className: '软工 2303', schedule: '周五 1-2 节', status: '进行中' }
];

const dashboardContent = computed(() => {
  if (isTeacher.value) {
    return {
      description: '围绕个人授课任务、成绩录入、资源上传和教学提醒组织首页内容。',
      actions: [
        { label: '进入我的授课', path: '/my-teaching', type: 'primary' },
        { label: '进入成绩录入', path: '/evaluation/scores' }
      ],
      metrics: [
        { label: '我的授课数', value: '06', trend: 12, sub: '覆盖 3 个年级、8 个教学班。' },
        { label: '待录入成绩课程数', value: '02', trend: -8, sub: '需在 2026-07-19 前完成提交锁定。' },
        { label: '未读通知数', value: '05', trend: 20, sub: '包含成绩提交提醒和问卷填报消息。' }
      ],
      quickTitle: '快捷入口',
      quickEntries: [
        { path: '/my-teaching', label: '我的授课', summary: '查看本学期授课任务、班级安排和课堂提醒。', group: '我的工作台' },
        { path: '/evaluation/scores', label: '成绩录入', summary: '按课程目标录入成绩并提交锁定。', group: '成绩管理' },
        { path: '/my-courses', label: '课程资源', summary: '上传课件、作业、实验指导和教学资料。', group: '我的工作台' }
      ],
      rightTitle: '今日待办',
      rightList: [
        { title: '软件工程 2301 成绩待提交', desc: '请在今晚 18:00 前完成课程目标成绩锁定。', time: '今天', path: '/evaluation/scores' },
        { title: '课程资源补充提醒', desc: '《需求分析与建模》缺少实验指导书，请尽快上传。', time: '今天', path: '/my-courses' },
        { title: '教师问卷待填报', desc: '课程达成度反馈问卷尚未完成。', time: '07-18', path: '/survey/fill' }
      ],
      leftBottomTitle: '通知公告',
      leftBottomList: [
        { title: '教学巡检提示', desc: '本周需要补齐 2 门课程的考核材料与资源目录。', tag: '待处理', tagType: 'warning' },
        { title: '成绩提交规范更新', desc: '课程目标成绩表新增锁定校验项，请按新模板处理。', tag: '已发布', tagType: 'success' },
        { title: '学生问卷回收提醒', desc: '软件工程 2302 班问卷回收率已达到 68%。', tag: '跟进中', tagType: 'info' }
      ],
      rightBottomTitle: '我的课程'
    };
  }

  if (isStudent.value) {
    return {
      description: '聚焦成绩查询、达成度报告、问卷填报和个人学业进度。',
      actions: [
        { label: '查看我的成绩', path: '/my-scores', type: 'primary' },
        { label: '查看达成度报告', path: '/my-achievement' }
      ],
      metrics: [
        { label: '已修学分', value: '86', trend: 6, sub: '占培养方案总学分的 57%。' },
        { label: '平均成绩', value: '88.5', trend: 3, sub: '最近一学期较上学期提升 2.4 分。' },
        { label: '待完成问卷数', value: '02', trend: -20, sub: '毕业要求反馈与课程资源反馈待填写。' }
      ],
      quickTitle: '快捷入口',
      quickEntries: [
        { path: '/my-scores', label: '我的成绩', summary: '查看课程成绩、绩点和最新发布结果。', group: '我的学习' },
        { path: '/my-achievement', label: '达成度报告', summary: '查看课程目标达成情况和改进建议。', group: '我的学习' },
        { path: '/survey/fill', label: '问卷填报', summary: '参与课程与毕业要求反馈问卷。', group: '问卷填报' }
      ],
      rightTitle: '最新成绩',
      rightList: [
        { title: '软件工程', desc: '课程总评 91 分，课程目标 2 表现突出。', time: '07-16' },
        { title: '数据库原理', desc: '课程总评 86 分，实验报告部分已完成复核。', time: '07-15' },
        { title: '计算机网络', desc: '课程总评 89 分，已开放成绩明细查看。', time: '07-13' }
      ],
      leftBottomTitle: '学业进度',
      rightBottomTitle: '通知公告',
      rightBottomList: [
        { title: '毕业要求满意度问卷发布', desc: '请于 2026-07-22 前完成填报。', time: '今天' },
        { title: '课程成绩复核开放', desc: '数据库原理成绩复核申请入口已开放。', time: '07-16' },
        { title: '暑期实践提醒', desc: '实践课程材料提交截止到 2026-07-25。', time: '07-15' }
      ]
    };
  }

  return {
    description: '面向认证管理与过程监控，聚合展示关键数据、审核事项、系统状态和通知公告。',
    actions: [
      { label: '进入方案管理', path: '/program', type: 'primary' },
      { label: '查看达成看板', path: '/achievement/dashboard' }
    ],
    metrics: [
      { label: '总用户数', value: '128', trend: 8, sub: '覆盖管理员、教师与学生三类账号。' },
      { label: '进行中方案数', value: '18', trend: 11, sub: '含启用版本与待归档版本。' },
      { label: '待处理预警数', value: '07', trend: -5, sub: '低于阈值的达成度与回收率问题。' },
      { label: '进行中问卷数', value: '04', trend: 15, sub: '处于发布和回收阶段的问卷任务。' }
    ],
    quickTitle: '快捷入口',
    quickEntries: [
      { path: '/users', label: '用户管理', summary: '维护账号、角色、院系信息和启停状态。', group: '基础管理' },
      { path: '/program', label: '方案管理', summary: '维护培养方案版本与适用年级。', group: '方案与课程' },
      { path: '/achievement/course', label: '达成度评价', summary: '查看课程目标与毕业要求达成情况。', group: '评价与达成' },
      { path: '/report', label: '自评报告', summary: '进入报告大纲、章节编辑和导出页面。', group: '报告中心' }
    ],
    rightTitle: '待审核事项',
    rightList: [
      { title: '新注册教师待审核', desc: '计算机学院提交 3 个教师账号申请，请确认角色和院系。', time: '今天', path: '/users' },
      { title: '培养方案版本待确认', desc: '2025 版软件工程培养方案已提交归档确认。', time: '07-18', path: '/program' },
      { title: '考核材料待复核', desc: '有 13 份课程考核材料等待审核通过或退回。', time: '07-19', path: '/evaluation/materials' }
    ],
    leftBottomTitle: '系统运行状态',
    leftBottomList: [
      { title: '用户活跃度', value: '82%', desc: '近 7 日内活跃用户占比，教师端访问明显提升。' },
      { title: '操作日志摘要', value: '126 条', desc: '今天新增日志 126 条，其中异常操作 3 条。' },
      { title: '消息处理效率', value: '91%', desc: '待办消息平均 4.2 小时内完成处理。' }
    ],
    rightBottomTitle: '通知公告',
    rightBottomList: [
      { title: '2026 年专业认证材料汇总通知', desc: '请各学院于 2026-07-25 前完成材料归档。', time: '今天' },
      { title: '达成度模型阈值复核提醒', desc: '本周需完成 3 个专业阈值参数复核。', time: '07-16' },
      { title: '问卷回收阶段性通报', desc: '毕业要求满意度问卷整体回收率达到 72%。', time: '07-15' }
    ]
  };
});
</script>
