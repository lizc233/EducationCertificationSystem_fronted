<template>
  <StandardPage
    title="AI 助手"
    :breadcrumbs="['首页', '工作台', 'AI 助手']"
    description="对接真实 DeepSeek + RAG 后端能力，支持报告章节扩写/润色、持续改进建议生成、结果确认回写和历史记录追踪。"
  >
    <template #actions>
      <el-button @click="rebuildKnowledge" :loading="loading.operate">重建知识索引</el-button>
      <el-button :loading="loading.history" @click="loadHistory">刷新历史</el-button>
    </template>

    <div class="ai-shell">
      <SectionCard title="请求历史">
        <div v-loading="loading.history" class="ai-history-list soft-scrollbar">
          <button
            v-for="item in historyRows"
            :key="item.requestId"
            type="button"
            class="ai-history-item"
            :class="{ 'is-active': item.requestId === currentResult?.requestId }"
            @click="openHistoryDetail(item.requestId)"
          >
            <div class="ai-history-item__title">{{ item.requestNo }}</div>
            <div class="ai-history-item__meta">
              {{ item.scenarioType }} · {{ item.requestStatus }} · {{ formatDateTime(item.requestedAt) }}
            </div>
          </button>
          <el-empty v-if="!loading.history && !historyRows.length" description="暂无 AI 历史记录" />
        </div>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="historyPager.pageNum"
            v-model:page-size="historyPager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="historyPager.total"
            @current-change="loadHistory"
            @size-change="loadHistory"
          />
        </div>
      </SectionCard>

      <SectionCard title="AI 场景发起">
        <div class="ai-mode-switch">
          <el-radio-group v-model="mode">
            <el-radio-button label="report">报告章节</el-radio-button>
            <el-radio-button label="improve">改进建议</el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="mode === 'report'" class="ai-form-shell">
          <el-form label-position="top">
            <el-form-item label="报告项目">
              <el-select v-model="reportForm.projectId" filterable style="width: 100%;" @change="handleProjectChange">
                <el-option
                  v-for="item in reportProjects"
                  :key="item.id"
                  :label="`${item.reportCode} - ${item.projectName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报告章节">
              <el-select v-model="reportForm.chapterId" filterable style="width: 100%;">
                <el-option
                  v-for="item in reportChapterOptions"
                  :key="item.id"
                  :label="`${item.chapterCode || ''} ${item.chapterTitle}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <div class="ai-form-grid">
              <el-form-item label="操作类型">
                <el-select v-model="reportForm.operationType" style="width: 100%;">
                  <el-option label="扩写" value="EXPAND" />
                  <el-option label="润色" value="POLISH" />
                </el-select>
              </el-form-item>
              <el-form-item label="模板编码">
                <el-input v-model.trim="reportForm.templateCode" placeholder="可选模板编码" />
              </el-form-item>
              <el-form-item label="使用RAG">
                <el-switch v-model="reportForm.useRagFlag" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="TopK">
                <el-input-number v-model="reportForm.topK" :min="1" :max="10" :step="1" style="width: 100%;" />
              </el-form-item>
            </div>
            <el-form-item label="备注">
              <el-input v-model="reportForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
          <div class="ai-form-actions">
            <el-button type="primary" :loading="loading.operate" @click="runReportAnalysis">开始生成</el-button>
            <el-select v-model="reportConfirmForm.applyMode" style="width: 160px;">
              <el-option label="覆盖回写" value="REPLACE" />
              <el-option label="追加回写" value="APPEND" />
            </el-select>
            <el-button :loading="loading.operate" :disabled="!currentResult?.requestId" @click="confirmReportResult">
              确认写回章节
            </el-button>
          </div>
        </div>

        <div v-else class="ai-form-shell">
          <el-form label-position="top">
            <el-form-item label="改进单">
              <el-select v-model="improveForm.planId" filterable style="width: 100%;" @change="handlePlanChange">
                <el-option
                  v-for="item in improvePlans"
                  :key="item.id"
                  :label="`${item.planCode} - ${item.planName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <div class="ai-form-grid">
              <el-form-item label="来源类型">
                <el-input v-model.trim="improveForm.sourceType" placeholder="如 EVAL_RESULT" />
              </el-form-item>
              <el-form-item label="来源ID">
                <el-input-number v-model="improveForm.sourceId" :min="1" :step="1" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="目标类型">
                <el-input v-model.trim="improveForm.targetType" placeholder="如 COURSE" />
              </el-form-item>
              <el-form-item label="目标ID">
                <el-input-number v-model="improveForm.targetId" :min="1" :step="1" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="优先级">
                <el-input-number v-model="improveForm.priority" :min="1" :max="5" :step="1" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="完成期限(天)">
                <el-input-number v-model="improveForm.dueDays" :min="1" :max="365" :step="1" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="TopK">
                <el-input-number v-model="improveForm.topK" :min="1" :max="10" :step="1" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="模板编码">
                <el-input v-model.trim="improveForm.templateCode" placeholder="可选模板编码" />
              </el-form-item>
            </div>
            <el-form-item label="备注">
              <el-input v-model="improveForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
          <div class="ai-form-actions">
            <el-button type="primary" :loading="loading.operate" @click="runImproveAnalysis">生成改进建议</el-button>
            <el-button :loading="loading.operate" :disabled="!currentResult?.requestId" @click="confirmImproveResult">
              确认生成改进单
            </el-button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="分析结果与引用片段">
        <div v-if="currentResult" class="ai-result-shell">
          <div class="page-kpis">
            <article class="page-kpi">
              <div class="page-kpi__label">请求编号</div>
              <div class="page-kpi__value page-kpi__value--small">{{ currentResult.requestNo }}</div>
              <div class="page-kpi__desc">后端落库后的唯一请求号</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">场景</div>
              <div class="page-kpi__value page-kpi__value--small">{{ currentResult.scenarioType }}</div>
              <div class="page-kpi__desc">当前生成的 AI 业务场景类型</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">状态</div>
              <div class="page-kpi__value page-kpi__value--small">{{ currentResult.requestStatus }}</div>
              <div class="page-kpi__desc">支持失败后重试与确认回写</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">确认写回</div>
              <div class="page-kpi__value page-kpi__value--small">{{ currentResult.humanConfirmedFlag === 1 ? '已确认' : '未确认' }}</div>
              <div class="page-kpi__desc">是否已由人工确认落库/回写</div>
            </article>
          </div>

          <SectionCard title="结果正文" style="margin-top: 18px;">
            <div class="ai-result-text">{{ currentResult.resultText || currentResult.resultJson || '暂无结果内容' }}</div>
          </SectionCard>

          <SectionCard title="RAG 引用片段" style="margin-top: 18px;">
            <div v-if="currentResult.retrievedChunks?.length" class="chunk-list">
              <article v-for="chunk in currentResult.retrievedChunks" :key="chunk.chunkId" class="chunk-card">
                <div class="chunk-card__title">{{ chunk.title || `${chunk.sourceType}:${chunk.sourceId}` }}</div>
                <div class="chunk-card__meta">{{ chunk.sourceType }} · score {{ chunk.score ?? '-' }}</div>
                <div class="chunk-card__snippet">{{ chunk.snippet }}</div>
              </article>
            </div>
            <el-empty v-else description="本次结果未返回引用片段" />
          </SectionCard>

          <div class="ai-result-actions">
            <el-button :loading="loading.operate" @click="retryCurrentRequest">重试本次请求</el-button>
          </div>
        </div>
        <el-empty v-else description="左侧选择历史记录，或在中间发起新的 AI 分析" />
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  confirmAiImproveSuggestion,
  confirmAiReportChapter,
  fetchAiRequestDetail,
  fetchAiRequestHistory,
  generateAiImproveSuggestion,
  generateAiReportChapter,
  rebuildAiKnowledge,
  retryAiRequest
} from '../../api/ai';
import { fetchImprovePlanDetail, fetchImprovePlans } from '../../api/improve';
import { fetchReportProjectDetail, fetchReportProjects } from '../../api/report';
import { useUserStore } from '../../store/user';

const route = useRoute();
const userStore = useUserStore();

const loading = reactive({
  history: false,
  operate: false
});

const mode = ref(route.query.mode === 'improve' ? 'improve' : 'report');
const historyRows = ref([]);
const historyPager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
const currentResult = ref(null);

const reportProjects = ref([]);
const reportProjectDetail = ref(null);
const reportChapterOptions = ref([]);
const reportForm = reactive({
  projectId: route.query.projectId ? Number(route.query.projectId) : null,
  chapterId: route.query.chapterId ? Number(route.query.chapterId) : null,
  operationType: 'POLISH',
  templateCode: '',
  useRagFlag: 1,
  topK: 4,
  remark: ''
});
const reportConfirmForm = reactive({
  applyMode: 'REPLACE',
  remark: ''
});

const improvePlans = ref([]);
const improvePlanDetail = ref(null);
const improveForm = reactive({
  planId: route.query.planId ? Number(route.query.planId) : null,
  sourceType: route.query.sourceType || '',
  sourceId: route.query.sourceId ? Number(route.query.sourceId) : null,
  targetType: route.query.targetType || '',
  targetId: route.query.targetId ? Number(route.query.targetId) : null,
  priority: 3,
  dueDays: 30,
  topK: 4,
  templateCode: '',
  remark: ''
});

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function flattenChapters(nodes = []) {
  return nodes.flatMap((node) => [node, ...flattenChapters(node.children || [])]);
}

async function loadHistory() {
  loading.history = true;
  try {
    const page = await fetchAiRequestHistory({
      pageNum: historyPager.pageNum,
      pageSize: historyPager.pageSize,
      requesterUserId: userStore.userInfo.id
    });
    historyRows.value = page.records || [];
    historyPager.total = Number(page.total || 0);
  } finally {
    loading.history = false;
  }
}

async function loadReportProjects() {
  const page = await fetchReportProjects({
    pageNum: 1,
    pageSize: 100,
    viewerUserId: userStore.userInfo.id
  });
  reportProjects.value = page.records || [];
  if (reportForm.projectId) {
    await handleProjectChange(reportForm.projectId);
  }
}

async function handleProjectChange(projectId) {
  if (!projectId) {
    reportProjectDetail.value = null;
    reportChapterOptions.value = [];
    reportForm.chapterId = null;
    return;
  }
  reportProjectDetail.value = await fetchReportProjectDetail(projectId, {
    viewerUserId: userStore.userInfo.id
  });
  reportChapterOptions.value = flattenChapters(reportProjectDetail.value.chapters || []);
  if (!reportForm.chapterId && reportChapterOptions.value.length) {
    reportForm.chapterId = reportChapterOptions.value[0].id;
  }
}

async function loadImprovePlans() {
  const page = await fetchImprovePlans({
    pageNum: 1,
    pageSize: 100,
    ownerUserId: userStore.userInfo.id
  });
  improvePlans.value = page.records || [];
  if (improveForm.planId) {
    await handlePlanChange(improveForm.planId);
  }
}

async function handlePlanChange(planId) {
  if (!planId) {
    improvePlanDetail.value = null;
    return;
  }
  improvePlanDetail.value = await fetchImprovePlanDetail(planId);
  improveForm.sourceType = improvePlanDetail.value.sourceType || '';
  improveForm.sourceId = improvePlanDetail.value.sourceId || null;
  improveForm.targetType = improvePlanDetail.value.targetType || '';
  improveForm.targetId = improvePlanDetail.value.targetId || null;
}

async function openHistoryDetail(requestId) {
  currentResult.value = await fetchAiRequestDetail(requestId);
}

async function runReportAnalysis() {
  if (!reportForm.chapterId) {
    ElMessage.warning('请先选择报告章节');
    return;
  }
  loading.operate = true;
  try {
    currentResult.value = await generateAiReportChapter(reportForm.chapterId, {
      requesterUserId: userStore.userInfo.id,
      operationType: reportForm.operationType,
      templateCode: reportForm.templateCode,
      useRagFlag: reportForm.useRagFlag,
      topK: reportForm.topK,
      remark: reportForm.remark
    });
    await loadHistory();
    ElMessage.success('AI 报告内容生成完成');
  } finally {
    loading.operate = false;
  }
}

async function confirmReportResult() {
  if (!currentResult.value?.requestId || !reportForm.chapterId) return;
  loading.operate = true;
  try {
    currentResult.value = await confirmAiReportChapter(reportForm.chapterId, {
      requestId: currentResult.value.requestId,
      confirmedBy: userStore.userInfo.id,
      applyMode: reportConfirmForm.applyMode,
      remark: reportConfirmForm.remark || '前端确认回写报告章节'
    });
    ElMessage.success('AI 结果已确认写回章节');
  } finally {
    loading.operate = false;
  }
}

async function runImproveAnalysis() {
  loading.operate = true;
  try {
    currentResult.value = await generateAiImproveSuggestion({
      requesterUserId: userStore.userInfo.id,
      ownerUserId: userStore.userInfo.id,
      responsibleUserId: userStore.userInfo.id,
      sourceType: improveForm.sourceType,
      sourceId: improveForm.sourceId,
      targetType: improveForm.targetType,
      targetId: improveForm.targetId,
      templateCode: improveForm.templateCode,
      priority: improveForm.priority,
      dueDays: improveForm.dueDays,
      topK: improveForm.topK,
      remark: improveForm.remark
    });
    await loadHistory();
    ElMessage.success('AI 改进建议已生成');
  } finally {
    loading.operate = false;
  }
}

async function confirmImproveResult() {
  if (!currentResult.value?.requestId) return;
  loading.operate = true;
  try {
    currentResult.value = await confirmAiImproveSuggestion({
      requestId: currentResult.value.requestId,
      confirmedBy: userStore.userInfo.id,
      ownerUserId: userStore.userInfo.id,
      responsibleUserId: userStore.userInfo.id,
      planCode: improvePlanDetail.value?.planCode ? `${improvePlanDetail.value.planCode}-AI` : '',
      planName: improvePlanDetail.value?.planName ? `${improvePlanDetail.value.planName} AI建议` : 'AI生成改进建议',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + improveForm.dueDays * 86400000).toISOString().slice(0, 10),
      remark: '前端确认生成改进单'
    });
    ElMessage.success('AI 建议已确认并回写改进单');
  } finally {
    loading.operate = false;
  }
}

async function retryCurrentRequest() {
  if (!currentResult.value?.requestId) return;
  loading.operate = true;
  try {
    currentResult.value = await retryAiRequest(currentResult.value.requestId, {
      requesterUserId: userStore.userInfo.id
    });
    await loadHistory();
    ElMessage.success('AI 请求已重试');
  } finally {
    loading.operate = false;
  }
}

async function rebuildKnowledge() {
  loading.operate = true;
  try {
    const request = mode.value === 'report'
      ? { rebuildType: 'REPORT_PROJECT', projectId: reportForm.projectId }
      : { rebuildType: 'IMPROVE_PLAN', planId: improveForm.planId };
    await rebuildAiKnowledge(request);
    ElMessage.success('知识索引重建任务已提交');
  } finally {
    loading.operate = false;
  }
}

onMounted(async () => {
  await Promise.all([loadHistory(), loadReportProjects(), loadImprovePlans()]);
});
</script>

<style scoped>
.ai-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 420px;
  gap: 20px;
}

.ai-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.ai-history-item,
.chunk-card {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.ai-history-item {
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-history-item:hover,
.ai-history-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.ai-history-item__title,
.chunk-card__title {
  font-weight: 600;
}

.ai-history-item__meta,
.chunk-card__meta {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.ai-mode-switch,
.ai-form-shell,
.chunk-list {
  display: grid;
  gap: 16px;
}

.ai-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ai-form-actions,
.ai-result-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-result-text,
.chunk-card__snippet {
  line-height: 1.9;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

@media (max-width: 1480px) {
  .ai-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .ai-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
