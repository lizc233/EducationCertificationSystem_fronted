<template>
  <StandardPage title="AI 助手" :breadcrumbs="['首页', '工作台', 'AI 助手']" description="提供认证分析、报告润色和改进建议等对话式辅助能力。">
    <div class="split-grid split-grid--detail">
      <SectionCard title="历史对话列表">
        <div class="list-panel">
          <article
            v-for="item in histories"
            :key="item.id"
            class="list-item"
            :class="{ 'is-active': activeHistory === item.id }"
            @click="activeHistory = item.id"
            style="cursor: pointer;"
          >
            <div style="font-weight: 600;">{{ item.title }}</div>
            <div style="margin-top: 6px; color: var(--text-light);">{{ item.time }}</div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="当前对话">
        <template #extra>
          <el-select v-model="scenario" style="width: 220px;">
            <el-option label="指标点匹配建议" value="指标点匹配建议" />
            <el-option label="达成度解读" value="达成度解读" />
            <el-option label="报告润色" value="报告润色" />
          </el-select>
          <el-select v-model="target" style="width: 220px;">
            <el-option label="软件工程课程目标 2" value="软件工程课程目标 2" />
            <el-option label="GR2 / 2.1" value="GR2 / 2.1" />
          </el-select>
          <el-button type="primary" :loading="analyzing" @click="runAnalysis">点击分析</el-button>
        </template>

        <div class="chat-window">
          <div class="chat-message chat-message--assistant">
            已为你加载“{{ scenario }}”场景。请选择数据对象后开始分析。
          </div>
          <div class="chat-message chat-message--user">
            请分析 {{ target }} 的达成情况，并给出改进建议。
          </div>
          <div class="chat-message chat-message--assistant">
            该对象当前主要短板集中在课程项目权重对应的指标点支撑不足，建议增加案例驱动实践任务，并在报告章节中补充改进闭环说明。
          </div>
        </div>

        <div style="display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; margin-top: 16px;">
          <el-input v-model="input" placeholder="输入你的问题或补充指令" />
          <el-button type="primary" :loading="adopting" @click="adoptSuggestion">发送</el-button>
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const activeHistory = ref(1);
const scenario = ref('指标点匹配建议');
const target = ref('软件工程课程目标 2');
const input = ref('');
const analyzing = ref(false);
const adopting = ref(false);

const histories = [
  { id: 1, title: '课程目标 2 指标点匹配建议', time: '2026-07-16 10:20' },
  { id: 2, title: 'GR2 达成度异常解读', time: '2026-07-15 15:36' },
  { id: 3, title: '自评报告第 3 章润色', time: '2026-07-14 18:00' }
];

async function runAnalysis() {
  analyzing.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  analyzing.value = false;
  ElMessage.success('分析完成');
}

async function adoptSuggestion() {
  adopting.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  adopting.value = false;
  ElMessage.success('发送成功');
}
</script>
