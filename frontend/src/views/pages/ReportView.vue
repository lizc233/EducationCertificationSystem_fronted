<template>
  <StandardPage title="自评报告" :breadcrumbs="['首页', '报告中心', '自评报告']" description="通过大纲树、章节编辑区和进度条统一管理自评报告编写。">
    <template #actions>
      <el-button type="primary" :loading="loading.assign" @click="runAction('assign', '分配任务')">分配任务</el-button>
      <el-button :loading="loading.generate" @click="runAction('generate', '生成初稿')">生成初稿</el-button>
      <el-button :loading="loading.export" @click="runAction('export', '导出完整报告')">导出完整报告</el-button>
    </template>

    <SectionCard>
      <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="名称">2026 自评报告</el-descriptions-item>
          <el-descriptions-item label="专业">计算机科学与技术</el-descriptions-item>
          <el-descriptions-item label="状态">编写中</el-descriptions-item>
        </el-descriptions>
        <div style="width: 280px;">
          <div style="margin-bottom: 8px; color: var(--text-secondary);">完成进度</div>
          <el-progress :percentage="68" />
        </div>
      </div>

      <div class="split-grid split-grid--sidebar">
        <SectionCard title="报告大纲树">
          <el-tree :data="outlineTree" node-key="id" default-expand-all />
        </SectionCard>

        <SectionCard title="章节内容编辑区">
          <template #extra>
            <el-button-group>
              <el-button>标题</el-button>
              <el-button>加粗</el-button>
              <el-button>列表</el-button>
            </el-button-group>
          </template>
          <div class="editor-shell" contenteditable="true">
            本章内容由系统数据自动填充初稿后，支持继续编辑、润色和任务分配。
          </div>
        </SectionCard>
      </div>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const loading = reactive({
  assign: false,
  generate: false,
  export: false
});

const outlineTree = [
  { id: 1, label: '1. 学院与专业概况' },
  { id: 2, label: '2. 培养目标与毕业要求' },
  { id: 3, label: '3. 课程体系与教学实施' },
  { id: 4, label: '4. 持续改进机制' }
];

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
