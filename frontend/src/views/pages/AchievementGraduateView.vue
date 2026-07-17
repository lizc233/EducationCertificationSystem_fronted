<template>
  <StandardPage title="毕业要求达成度评价与预警" :breadcrumbs="['首页', '评价与达成', '毕业要求达成度评价与预警']" description="按专业、年级和学期分析毕业要求达成度，并输出预警清单。">
    <template #actions>
      <el-button type="primary" :loading="loading.calc" @click="runAction('calc', '触发计算')">触发计算</el-button>
      <el-button :loading="loading.notice" @click="runAction('notice', '发送预警通知')">发送预警通知</el-button>
      <el-button :loading="loading.export" @click="runAction('export', '导出数据')">导出</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="专业">
          <el-select v-model="filters.major" style="width: 220px;">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.grade" style="width: 120px;">
            <el-option label="2025" value="2025" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filters.term" style="width: 160px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.35fr) minmax(320px, 1fr);">
      <SectionCard title="达成度矩阵">
        <el-table :data="matrixRows" border stripe>
          <el-table-column prop="requirement" label="毕业要求 / 指标点" min-width="180" fixed="left" />
          <el-table-column prop="course1" label="程序设计基础" min-width="120" />
          <el-table-column prop="course2" label="软件工程" min-width="120" />
          <el-table-column prop="course3" label="数据库原理" min-width="120" />
          <el-table-column prop="total" label="汇总达成度" min-width="120" />
        </el-table>
      </SectionCard>

      <SectionCard title="预警列表">
        <el-table :data="warnings" border stripe>
          <el-table-column prop="item" label="预警项" min-width="180" />
          <el-table-column prop="threshold" label="阈值" min-width="90" />
          <el-table-column prop="current" label="当前值" min-width="90" />
          <el-table-column prop="owner" label="责任人" min-width="100" />
          <el-table-column label="状态" min-width="100">
            <template #default>
              <el-tag type="danger">低于阈值</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const loading = reactive({
  calc: false,
  notice: false,
  export: false
});

const filters = reactive({
  major: '计算机科学与技术',
  grade: '2025',
  term: '2025-2026-2'
});

const matrixRows = [
  { requirement: 'GR1 / 1.1', course1: '0.82', course2: '0.76', course3: '0.73', total: '0.77' },
  { requirement: 'GR2 / 2.1', course1: '0.71', course2: '0.69', course3: '0.68', total: '0.69' },
  { requirement: 'GR3 / 3.2', course1: '0.80', course2: '0.78', course3: '0.75', total: '0.78' },
  { requirement: 'GR4 / 4.1', course1: '0.74', course2: '0.76', course3: '0.72', total: '0.74' }
];

const warnings = [
  { item: 'GR2 / 2.1', threshold: '0.75', current: '0.69', owner: '课程组 A' },
  { item: 'GR2 / 2.2', threshold: '0.75', current: '0.72', owner: '课程组 B' },
  { item: 'GR4 / 4.1', threshold: '0.76', current: '0.74', owner: '课程组 C' }
];

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
