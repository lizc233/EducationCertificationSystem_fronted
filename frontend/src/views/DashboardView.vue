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
        <template v-if="isSuper">
          <div class="system-status-board">
            <article v-for="item in dashboardContent.leftBottomList" :key="item.title" class="status-board__item">
              <div class="status-board__title">{{ item.title }}</div>
              <div class="status-board__value">{{ item.value }}</div>
              <div class="status-board__desc">{{ item.desc }}</div>
            </article>
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
                <el-tag :type="item.tagType">{{ item.tag }}</el-tag>
              </div>
            </article>
          </div>
        </template>
        <template v-else>
          <div class="study-progress-card">
            <div class="study-progress-card__header">
              <div>
                <div class="study-progress-card__label">学分完成情况</div>
                <div class="study-progress-card__value">86 / 150 学分</div>
              </div>
              <el-tag type="success">57%</el-tag>
            </div>
            <el-progress :percentage="57" :stroke-width="16" />
            <div class="study-progress-card__meta">
              <span>公共课 34 学分</span>
              <span>专业课 42 学分</span>
              <span>选修课 10 学分</span>
            </div>
          </div>
        </template>
      </SectionCard>

      <SectionCard :title="dashboardContent.rightBottomTitle">
        <template v-if="isTeacher">
          <el-table :data="teacherCourseRows" border stripe>
            <el-table-column prop="course" label="课程" min-width="150" />
            <el-table-column prop="className" label="班级" min-width="120" />
            <el-table-column prop="schedule" label="上课时间" min-width="140" />
            <el-table-column prop="status" label="状态" min-width="110">
              <template #default="{ row }">
                <el-tag :type="row.status === '待审核' ? 'warning' : 'success'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-else>
          <div class="list-panel">
            <button
              v-for="item in dashboardContent.rightBottomList"
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
import { ROLES } from '../data/navigationV2';
import { getRoleStatSummary, getUserDirectory } from '../data/users';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const isSuper = computed(() => userStore.userInfo.role === ROLES.SUPER);
const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER);
const adminUserStats = computed(() => getRoleStatSummary(getUserDirectory()));

const teacherCourseRows = [
  { course: '软件工程', className: '软工 2301', schedule: '周一 1-2 节', status: '待审核' },
  { course: '软件工程', className: '软工 2302', schedule: '周二 3-4 节', status: '待审核' },
  { course: '需求分析与建模', className: '软工 2301', schedule: '周三 1-2 节', status: '进行中' },
  { course: '课程设计', className: '软工 2303', schedule: '周四 1-4 节', status: '进行中' }
];

const dashboardContent = computed(() => {
  if (isTeacher.value) {
    return {
      description: '围绕课程、课表、成绩提交、学生名单和课程公告组织教师首页内容。',
      actions: [
        { label: '进入我的课程', path: '/my-courses', type: 'primary' },
        { label: '进入成绩录入', path: '/score-input' },
        { label: '进入用户管理', path: '/users' }
      ],
      metrics: [
        { label: '我的课程数', value: '6', trend: 8, sub: '本学期共承担 6 门课程。' },
        { label: '待审核成绩数', value: '2', trend: -10, sub: '已有 2 个批次提交后待教务审核。' },
        { label: '未读通知数', value: '5', trend: 16, sub: '包括课程公告、审核提醒和问卷消息。' },
        { label: '今日课程数', value: '3', trend: 0, sub: '今天共有 3 次授课安排。' }
      ],
      quickTitle: '快捷入口',
      quickEntries: [
        { path: '/my-courses', label: '我的课程', summary: '查看任教课程、班级人数和资源入口。', group: '我的工作台' },
        { path: '/my-schedule', label: '我的课表', summary: '查看本周上课时间、教室和节次安排。', group: '我的工作台' },
        { path: '/course-students', label: '课程学生名单', summary: '查看学生名单并导出。', group: '我的工作台' },
        { path: '/course-announcements', label: '课程公告', summary: '向班级发布课程通知和作业提醒。', group: '我的工作台' },
        { path: '/users', label: '用户管理', summary: '新增、批量添加并维护三类用户账号。', group: '用户管理' }
      ],
      rightTitle: '今日待办',
      rightList: [
        { title: '今天 08:00 软件工程 2301 上课', desc: '主楼 402，课前请确认项目资料。', time: '2026-07-17', path: '/my-schedule' },
        { title: '成绩提交审核提醒', desc: '软件工程 2301 批次已于 2026 年 7 月 17 日上午提交，当前待审核。', time: '2026-07-17', path: '/score-input' },
        { title: '课程公告待发布', desc: '需求分析与建模第 6 周公告尚未发布。', time: '2026-07-17', path: '/course-announcements' }
      ],
      leftBottomTitle: '通知公告',
      leftBottomList: [
        { title: '教务提醒', desc: '教师成绩批次需在 2026 年 7 月 18 日 18:00 前完成提交。', tag: '待处理', tagType: 'warning' },
        { title: '课程反馈回收', desc: '软件工程 2302 的反馈问卷回收率已达 68%。', tag: '进行中', tagType: 'success' },
        { title: '资源补充提醒', desc: '课程设计答辩安排表仍需补充附件。', tag: '待补充', tagType: 'info' }
      ],
      rightBottomTitle: '我的课程'
    };
  }

  if (!isSuper.value) {
    return {
      description: '围绕选课、课表、成绩、课程评价和学业进度组织学生首页内容。',
      actions: [
        { label: '前往选课中心', path: '/course-selection', type: 'primary' },
        { label: '查看学业进度', path: '/academic-progress' }
      ],
      metrics: [
        { label: '已选课程数', value: '10', trend: 12, sub: '本学期已选 10 门课程。' },
        { label: '待评价课程数', value: '2', trend: -20, sub: '请在 2026 年 7 月 22 日前完成课程评价。' },
        { label: '待完成问卷数', value: '2', trend: -10, sub: '包括课程评价问卷和满意度调查。' },
        { label: '平均成绩', value: '88.5', trend: 3, sub: '较上一学期提升 2.4 分。' }
      ],
      quickTitle: '快捷入口',
      quickEntries: [
        { path: '/course-selection', label: '选课中心', summary: '查看可选课程、容量和截止时间。', group: '我的学习' },
        { path: '/my-schedule', label: '我的课表', summary: '查看本周课程安排和上课时间。', group: '我的学习' },
        { path: '/course-evaluate', label: '课程评价', summary: '对已修课程进行评分和文字反馈。', group: '课程评价' },
        { path: '/my-scores', label: '我的成绩', summary: '查看课程成绩和各考核项明细。', group: '我的学习' }
      ],
      rightTitle: '最新成绩',
      rightList: [
        { title: '软件工程', desc: '总评 91 分，项目实践表现较好。', time: '2026-07-16', path: '/my-scores' },
        { title: '数据库原理', desc: '总评 86 分，实验成绩已复核。', time: '2026-07-15', path: '/my-scores' },
        { title: '计算机网络', desc: '总评 89 分，已开放明细查看。', time: '2026-07-13', path: '/my-scores' }
      ],
      leftBottomTitle: '学业进度',
      rightBottomTitle: '通知公告',
      rightBottomList: [
        { title: '系统公告：暑期选课开放通知', desc: '2026 年 7 月 18 日 08:00 起开放暑期选课。', time: '2026-07-17', path: '/course-selection' },
        { title: '课程公告：软件工程项目分组公布', desc: '请在 2026 年 7 月 18 日前完成组队确认。', time: '2026-07-17', path: '/course-announcements-view' },
        { title: '课程公告：数据库原理实验三说明', desc: '实验报告提交截止为 2026 年 7 月 20 日。', time: '2026-07-16', path: '/course-announcements-view' }
      ]
    };
  }

  return {
    description: '面向认证管理、选课调度和成绩审核，聚合展示关键数据、待办事项和系统公告。',
    actions: [
      { label: '进入选课管理', path: '/course-selection-management', type: 'primary' },
      { label: '查看成绩审核', path: '/score-audit' }
    ],
    metrics: [
      { label: '总用户数', value: String(adminUserStats.value.total), trend: 8, sub: '覆盖管理员、老师与学生三类账号。' },
      { label: '进行中方案数', value: '18', trend: 11, sub: '含启用版本与待归档版本。' },
      { label: '待处理预警数', value: '7', trend: -5, sub: '低于阈值的达成度与回收率问题。' },
      { label: '进行中选课任务数', value: '6', trend: 12, sub: '当前开放中的课程选课任务。' },
      { label: '进行中问卷数', value: '4', trend: 15, sub: '处于发布和回收阶段的问卷任务。' }
    ],
    quickTitle: '快捷入口',
    quickEntries: [
      { path: '/users', label: '用户管理', summary: '维护三类用户账号，支持单独新增、批量添加和启停管理。', group: '用户管理' },
      { path: '/program', label: '方案管理', summary: '维护培养方案版本和适用年级。', group: '方案与课程' },
      { path: '/course-selection-management', label: '选课管理', summary: '发布选课任务并查看选课名单。', group: '选课与成绩' },
      { path: '/report', label: '自评报告', summary: '进入报告大纲、章节编辑和导出页面。', group: '报告中心' }
    ],
    rightTitle: '待审核事项',
    rightList: [
      { title: '待审核成绩 2 批次', desc: '软件工程 2301 与软件工程 2302 批次已于 2026 年 7 月 17 日提交。', time: '2026-07-17', path: '/score-audit' },
      { title: '新增教师账号待核验', desc: '计算机学院新增 3 个教师账号，请核验工号、角色和院系信息。', time: '2026-07-17', path: '/users' },
      { title: '培养方案版本待确认', desc: '2025 版软件工程培养方案已提交归档确认。', time: '2026-07-18', path: '/program' }
    ],
    leftBottomTitle: '系统运行状态',
    leftBottomList: [
      { title: '用户活跃度', value: '82%', desc: '近 7 日内活跃用户占比，教师端访问明显提升。' },
      { title: '操作日志摘要', value: '126 条', desc: '2026 年 7 月 17 日新增日志 126 条，其中异常操作 3 条。' },
      { title: '选课并发状态', value: '稳定', desc: '当前选课任务访问正常，无容量冲突告警。' }
    ],
    rightBottomTitle: '通知公告',
    rightBottomList: [
      { title: '2026 年专业认证材料汇总通知', desc: '请各学院于 2026 年 7 月 25 日前完成材料归档。', time: '2026-07-17', path: '/announcements' },
      { title: '成绩审核流程调整说明', desc: '驳回时需填写原因，便于教师修正后重新提交。', time: '2026-07-16', path: '/announcements' },
      { title: '暑期选课系统开放通知', desc: '2026 年 7 月 18 日 08:00 起开放选课。', time: '2026-07-17', path: '/course-selection-management' }
    ]
  };
});
</script>
