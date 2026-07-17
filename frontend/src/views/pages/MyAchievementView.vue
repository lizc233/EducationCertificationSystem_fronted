<template>
  <StandardPage
    title="我的达成度报告"
    :breadcrumbs="['首页', '我的学习', '我的达成度报告']"
    description="学生个人达成度报告页，展示课程目标达成情况、能力画像与改进建议。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-scores')">返回成绩查询</el-button>
      <el-button @click="router.push('/survey/fill')">填写反馈问卷</el-button>
    </template>

    <div class="split-grid" style="grid-template-columns: 320px minmax(0, 1fr);">
      <SectionCard title="能力画像">
        <div class="achievement-summary-card">
          <div class="achievement-summary-card__score">91%</div>
          <div class="achievement-summary-card__text">课程目标总体达成率</div>
          <el-progress :percentage="91" :stroke-width="14" />
        </div>
        <div class="list-panel" style="margin-top: 18px;">
          <article v-for="item in profileItems" :key="item.label" class="list-item">
            <div class="dashboard-action__title">{{ item.label }}</div>
            <div class="dashboard-action__desc">{{ item.desc }}</div>
            <div class="dashboard-action__time">{{ item.value }}</div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="课程目标达成详情">
        <div class="list-panel">
          <article v-for="item in goalItems" :key="item.title" class="goal-achievement-item">
            <div class="goal-achievement-item__head">
              <div>
                <div class="goal-achievement-item__title">{{ item.title }}</div>
                <div class="goal-achievement-item__desc">{{ item.desc }}</div>
              </div>
              <el-tag :type="item.percentage >= 85 ? 'success' : 'warning'">
                {{ item.percentage >= 85 ? '达标' : '需改进' }}
              </el-tag>
            </div>
            <el-progress :percentage="item.percentage" :stroke-width="12" />
            <div class="goal-achievement-item__tips">{{ item.tip }}</div>
          </article>
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();

const profileItems = [
  { label: '优势能力', value: '系统设计', desc: '项目分析与系统设计相关课程目标表现较强。' },
  { label: '待提升能力', value: '质量评估', desc: '质量度量与测试分析相关目标还可继续提升。' },
  { label: '最新生成时间', value: '2026-07-16', desc: '本报告基于最近一次课程成绩计算生成。' }
];

const goalItems = [
  { title: '课程目标 1', percentage: 93, desc: '理解软件工程过程、方法与标准。', tip: '建议继续保持在课程案例分析中的表达与总结能力。' },
  { title: '课程目标 2', percentage: 88, desc: '完成需求分析、设计与测试文档编写。', tip: '文档结构与表达较好，可继续强化测试用例设计能力。' },
  { title: '课程目标 3', percentage: 84, desc: '在团队协作中完成软件开发任务。', tip: '建议加强迭代复盘与任务拆解，提升团队协同效率。' },
  { title: '课程目标 4', percentage: 79, desc: '识别课程项目中的风险并给出改进方案。', tip: '可重点补强质量评估、缺陷跟踪和改进闭环相关能力。' }
];
</script>
