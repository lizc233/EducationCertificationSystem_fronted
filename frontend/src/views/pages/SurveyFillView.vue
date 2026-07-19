<template>
  <StandardPage
    :title="pageTitle"
    :breadcrumbs="breadcrumbs"
    description="查看已发布问卷，完成填写，并按需查看统计与答卷明细。"
  >
    <template #actions>
      <el-button :loading="loading.page" @click="loadPublishedQuestionnaires">刷新</el-button>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="问卷填报" name="fill">
        <div class="fill-layout">
          <SectionCard title="已发布问卷">
            <div class="survey-list">
              <button
                v-for="item in questionnaires"
                :key="item.id"
                type="button"
                class="survey-item"
                :class="{ 'is-active': item.id === selectedQuestionnaireId }"
                @click="selectQuestionnaire(item.id)"
              >
                <div class="survey-item__head">
                  <strong>{{ item.title || item.questionnaireCode }}</strong>
                  <el-tag :type="item.publishStatus === 'PUBLISHED' ? 'success' : 'info'">
                    {{ item.publishStatus || '-' }}
                  </el-tag>
                </div>
                <div class="survey-item__meta">
                  <span>{{ item.questionnaireType || '-' }}</span>
                  <span>{{ item.targetObjectType || '-' }}</span>
                </div>
                <div class="survey-item__meta">
                  <span>{{ formatDateTime(item.startTime) }}</span>
                  <span>{{ formatDateTime(item.endTime) }}</span>
                </div>
              </button>
              <el-empty v-if="!loading.page && !questionnaires.length" description="暂无已发布问卷" />
            </div>
          </SectionCard>

          <SectionCard title="填写问卷">
            <template #extra>
              <el-button
                type="primary"
                :disabled="!canSubmitCurrent"
                :loading="loading.submit"
                @click="submitCurrentSurvey"
              >
                提交问卷
              </el-button>
            </template>

            <div v-if="fillView" class="paper-shell">
              <header class="paper-header">
                <h3>{{ fillView.title }}</h3>
                <div class="paper-header__meta">
                  <span>开始：{{ formatDateTime(fillView.startTime) }}</span>
                  <span>结束：{{ formatDateTime(fillView.endTime) }}</span>
                  <span>{{ fillView.anonymousFlag === 1 ? '匿名' : '实名' }}</span>
                </div>
                <el-alert
                  :title="fillView.submitMessage || (fillView.canSubmit === 1 ? '可提交' : '当前不可提交')"
                  :type="fillView.canSubmit === 1 ? 'info' : 'warning'"
                  :closable="false"
                  show-icon
                />
              </header>

              <div class="question-list">
                <article
                  v-for="question in fillView.questionnaire?.questions || []"
                  :key="question.id"
                  class="question-card"
                >
                  <div class="question-title">
                    {{ question.sortNo }}. {{ question.questionText }}
                    <span v-if="question.isRequired === 1" class="required-mark">*</span>
                  </div>
                  <div v-if="question.remark" class="question-remark">{{ question.remark }}</div>

                  <el-radio-group
                    v-if="['SINGLE', 'SCALE'].includes(question.questionType)"
                    v-model="answerState[question.id].singleOptionId"
                    :disabled="!canSubmitCurrent"
                  >
                    <el-radio
                      v-for="option in question.options || []"
                      :key="option.id"
                      :label="option.id"
                    >
                      {{ option.optionText }}
                    </el-radio>
                  </el-radio-group>

                  <el-checkbox-group
                    v-else-if="question.questionType === 'MULTIPLE'"
                    v-model="answerState[question.id].optionIds"
                    :disabled="!canSubmitCurrent"
                  >
                    <el-checkbox
                      v-for="option in question.options || []"
                      :key="option.id"
                      :label="option.id"
                    >
                      {{ option.optionText }}
                    </el-checkbox>
                  </el-checkbox-group>

                  <el-input
                    v-else-if="question.questionType === 'TEXT'"
                    v-model="answerState[question.id].answerText"
                    type="textarea"
                    :rows="4"
                    :disabled="!canSubmitCurrent"
                    placeholder="请输入回答内容"
                  />

                  <div v-else-if="question.questionType === 'MATRIX'" class="matrix-answer">
                    <div v-for="row in question.matrixRows || []" :key="row.id" class="matrix-answer__row">
                      <div class="matrix-answer__label">{{ row.rowText }}</div>
                      <el-radio-group
                        v-model="answerState[question.id].matrixSelections[row.id]"
                        :disabled="!canSubmitCurrent"
                      >
                        <el-radio
                          v-for="column in question.matrixColumns || []"
                          :key="column.id"
                          :label="column.id"
                        >
                          {{ column.colText }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <el-empty v-else description="请选择一份问卷开始填写" />
          </SectionCard>
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="isAdmin" label="回收统计" name="stats">
        <div class="stats-layout">
          <SectionCard title="统计对象">
            <el-select v-model="statsQuestionnaireId" placeholder="请选择问卷" style="width: 100%;" @change="loadStats">
              <el-option
                v-for="item in questionnaires"
                :key="item.id"
                :label="`${item.questionnaireCode || item.id} - ${item.title}`"
                :value="item.id"
              />
            </el-select>
          </SectionCard>

          <div class="stats-kpis">
            <article class="stats-kpi">
              <span>目标人数</span>
              <strong>{{ statsOverview.targetCount || 0 }}</strong>
            </article>
            <article class="stats-kpi">
              <span>已提交</span>
              <strong>{{ statsOverview.submittedCount || 0 }}</strong>
            </article>
            <article class="stats-kpi">
              <span>待提交</span>
              <strong>{{ statsOverview.pendingCount || 0 }}</strong>
            </article>
            <article class="stats-kpi">
              <span>回收率</span>
              <strong>{{ formatRate(statsOverview.recoveryRate) }}</strong>
            </article>
          </div>

          <div class="stats-grid">
            <SectionCard title="题目统计">
              <div v-if="questionStats.length" class="question-stats">
                <article v-for="item in questionStats" :key="item.questionId" class="stats-card">
                  <strong>{{ item.questionCode }} {{ item.questionText }}</strong>
                  <div class="stats-card__meta">{{ item.questionType }} / {{ item.responseCount || 0 }} 份回答</div>
                  <div v-if="item.optionStats?.length" class="stats-lines">
                    <div v-for="option in item.optionStats" :key="option.optionId" class="stats-line">
                      <span>{{ option.optionText }}</span>
                      <span>{{ option.selectCount }}</span>
                    </div>
                  </div>
                  <div v-else-if="item.matrixCellStats?.length" class="stats-lines">
                    <div v-for="cell in item.matrixCellStats" :key="`${cell.rowId}_${cell.columnId}`" class="stats-line">
                      <span>{{ cell.rowText }} / {{ cell.columnText }}</span>
                      <span>{{ cell.selectCount }}</span>
                    </div>
                  </div>
                  <div v-else-if="item.textAnswers?.length" class="text-answers">
                    <p v-for="(text, index) in item.textAnswers.slice(0, 5)" :key="`${item.questionId}_${index}`">{{ text }}</p>
                  </div>
                </article>
              </div>
              <el-empty v-else description="暂无统计数据" />
            </SectionCard>

            <SectionCard title="答卷列表">
              <template #extra>
                <el-button :disabled="!statsQuestionnaireId" @click="downloadResponses">导出答卷</el-button>
              </template>
              <el-table v-loading="loading.responses" :data="responseRows" border stripe>
                <el-table-column prop="respondentName" label="填写人" min-width="140" />
                <el-table-column prop="respondentType" label="角色" min-width="120" />
                <el-table-column prop="submitStatus" label="状态" min-width="120" />
                <el-table-column prop="answerCount" label="答题数" width="90" />
                <el-table-column prop="submittedAt" label="提交时间" min-width="170">
                  <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="openResponseDetail(row)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!loading.responses && !responseRows.length" description="暂无答卷数据" />
            </SectionCard>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="responseDetailVisible" title="答卷详情" width="860px">
      <div v-if="responseDetail" class="response-detail">
        <div class="response-summary">
          <span>填写人：{{ responseDetail.respondentName || '-' }}</span>
          <span>角色：{{ responseDetail.respondentType || '-' }}</span>
          <span>提交时间：{{ formatDateTime(responseDetail.submittedAt) }}</span>
        </div>
        <div class="answer-list">
          <article
            v-for="answer in responseDetail.answers || []"
            :key="`${answer.questionId}_${answer.questionCode}`"
            class="answer-card"
          >
            <strong>{{ answer.questionCode }} {{ answer.questionText }}</strong>
            <div class="answer-card__meta">{{ answer.questionType }}</div>
            <div class="answer-card__content">{{ formatAnswer(answer) }}</div>
          </article>
        </div>
      </div>
      <el-empty v-else description="暂无答卷详情" />
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
<<<<<<< HEAD
import { ROLES } from '../../data/navigationV2';
=======
import {
  buildSurveyResponseDownloadUrl,
  fetchSurveyFillView,
  fetchSurveyQuestionStats,
  fetchSurveyQuestionnaireDetail,
  fetchSurveyQuestionnaires,
  fetchSurveyResponseDetail,
  fetchSurveyResponseOverview,
  fetchSurveyResponses,
  submitSurveyResponse
} from '../../api/survey';
import { ROLES } from '../../data/navigation';
>>>>>>> 4a300da7d2fbf6345784db74d6f79b3c7114bbd0
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const loading = reactive({
  page: false,
  fill: false,
  submit: false,
  stats: false,
  responses: false,
  responseDetail: false
});

const activeTab = ref('fill');
const questionnaires = ref([]);
const selectedQuestionnaireId = ref(null);
const fillView = ref(null);
const answerState = reactive({});

const statsQuestionnaireId = ref(null);
const statsOverview = reactive({
  targetCount: 0,
  submittedCount: 0,
  pendingCount: 0,
  recoveryRate: 0
});
const questionStats = ref([]);
const responseRows = ref([]);
const responseDetailVisible = ref(false);
const responseDetail = ref(null);

const isAdmin = computed(() => userStore.userInfo.role === ROLES.SUPER);
const pageTitle = computed(() => (isAdmin.value ? '问卷填报与统计' : '问卷填报'));
const breadcrumbs = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return ['首页', '我的学习', '问卷填报'];
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return ['首页', '问卷与改进', '问卷填报'];
  }
  return ['首页', '问卷与改进', '问卷填报与统计'];
});
const canSubmitCurrent = computed(() => fillView.value?.canSubmit === 1 && fillView.value?.alreadySubmitted !== 1);

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function formatRate(value) {
  const num = Number(value || 0);
  return `${Number.isFinite(num) ? num.toFixed(2) : '0.00'}%`;
}

function normalizeRespondentType() {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return 'STUDENT';
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return 'TEACHER';
  }
  return 'ADMIN';
}

function ensureAnswerState(detail) {
  Object.keys(answerState).forEach((key) => {
    delete answerState[key];
  });
  for (const question of detail?.questionnaire?.questions || []) {
    answerState[question.id] = {
      singleOptionId: null,
      optionIds: [],
      answerText: '',
      matrixSelections: {}
    };
  }
}

async function loadPublishedQuestionnaires() {
  loading.page = true;
  try {
    const page = await fetchSurveyQuestionnaires({
      pageNum: 1,
      pageSize: 100,
      publishStatus: 'PUBLISHED'
    });
    questionnaires.value = page?.records || [];
    if (!questionnaires.value.length) {
      selectedQuestionnaireId.value = null;
      fillView.value = null;
      statsQuestionnaireId.value = null;
      return;
    }
    const nextId = questionnaires.value.some((item) => item.id === selectedQuestionnaireId.value)
      ? selectedQuestionnaireId.value
      : questionnaires.value[0].id;
    await selectQuestionnaire(nextId);
    if (isAdmin.value && !statsQuestionnaireId.value) {
      statsQuestionnaireId.value = nextId;
      await loadStats();
    }
  } finally {
    loading.page = false;
  }
}

async function selectQuestionnaire(id) {
  if (!id) return;
  loading.fill = true;
  try {
    selectedQuestionnaireId.value = id;
    fillView.value = await fetchSurveyFillView(id, userStore.userInfo.id || undefined);
    ensureAnswerState(fillView.value);
  } finally {
    loading.fill = false;
  }
}

function validateSubmit() {
  for (const question of fillView.value?.questionnaire?.questions || []) {
    const current = answerState[question.id];
    if (question.isRequired !== 1) {
      continue;
    }
    if (['SINGLE', 'SCALE'].includes(question.questionType) && !current.singleOptionId) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (question.questionType === 'MULTIPLE' && !current.optionIds.length) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (question.questionType === 'TEXT' && !current.answerText.trim()) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (question.questionType === 'MATRIX') {
      const selectedCount = Object.keys(current.matrixSelections || {}).filter((key) => current.matrixSelections[key]).length;
      if (!selectedCount) {
        ElMessage.warning(`请完成第 ${question.sortNo} 题`);
        return false;
      }
    }
  }
  return true;
}

function buildSubmitPayload() {
  return {
    respondentUserId: userStore.userInfo.id || null,
    respondentName: userStore.userInfo.realName || userStore.userInfo.accountId || '',
    respondentType: normalizeRespondentType(),
    remark: '',
    answers: (fillView.value?.questionnaire?.questions || []).map((question) => {
      const current = answerState[question.id];
      if (question.questionType === 'TEXT') {
        return {
          questionId: question.id,
          answerText: current.answerText.trim()
        };
      }
      if (question.questionType === 'MATRIX') {
        return {
          questionId: question.id,
          matrixSelections: Object.entries(current.matrixSelections || {})
            .filter(([, columnId]) => columnId)
            .map(([rowId, columnId]) => ({
              rowId: Number(rowId),
              columnId: Number(columnId)
            }))
        };
      }
      if (question.questionType === 'MULTIPLE') {
        return {
          questionId: question.id,
          optionIds: current.optionIds.map((item) => Number(item))
        };
      }
      return {
        questionId: question.id,
        optionIds: current.singleOptionId ? [Number(current.singleOptionId)] : []
      };
    })
  };
}

async function submitCurrentSurvey() {
  if (!fillView.value || !canSubmitCurrent.value) {
    return;
  }
  if (!validateSubmit()) {
    return;
  }
  loading.submit = true;
  try {
    await submitSurveyResponse(fillView.value.questionnaireId, buildSubmitPayload());
    ElMessage.success('问卷已提交');
    await selectQuestionnaire(fillView.value.questionnaireId);
    if (isAdmin.value && statsQuestionnaireId.value === fillView.value.questionnaireId) {
      await loadStats();
    }
  } finally {
    loading.submit = false;
  }
}

async function loadStats() {
  if (!statsQuestionnaireId.value) {
    return;
  }
  loading.stats = true;
  loading.responses = true;
  try {
    const [overview, stats, responsePage] = await Promise.all([
      fetchSurveyResponseOverview(statsQuestionnaireId.value),
      fetchSurveyQuestionStats(statsQuestionnaireId.value),
      fetchSurveyResponses(statsQuestionnaireId.value, { pageNum: 1, pageSize: 100 })
    ]);
    Object.assign(statsOverview, overview || {
      targetCount: 0,
      submittedCount: 0,
      pendingCount: 0,
      recoveryRate: 0
    });
    questionStats.value = stats || [];
    responseRows.value = responsePage?.records || [];
  } finally {
    loading.stats = false;
    loading.responses = false;
  }
}

async function openResponseDetail(row) {
  if (!statsQuestionnaireId.value || !row?.id) {
    return;
  }
  loading.responseDetail = true;
  responseDetailVisible.value = true;
  try {
    responseDetail.value = await fetchSurveyResponseDetail(statsQuestionnaireId.value, row.id);
  } finally {
    loading.responseDetail = false;
  }
}

function formatAnswer(answer) {
  if (answer.answerText) {
    return answer.answerText;
  }
  if (answer.selectedOptionTexts?.length) {
    return answer.selectedOptionTexts.join(' / ');
  }
  if (answer.matrixAnswers?.length) {
    return answer.matrixAnswers.map((item) => `${item.rowText}: ${item.columnText}`).join(' / ');
  }
  return '-';
}

function downloadResponses() {
  if (!statsQuestionnaireId.value) {
    return;
  }
  window.open(buildSurveyResponseDownloadUrl(statsQuestionnaireId.value), '_blank');
}

onMounted(() => {
  loadPublishedQuestionnaires();
});
</script>

<style scoped>
.fill-layout,
.stats-layout,
.stats-grid,
.survey-list,
.question-list,
.question-stats,
.answer-list {
  display: grid;
  gap: 18px;
}

.survey-item,
.question-card,
.stats-kpi,
.stats-card,
.answer-card {
  border: 1px solid rgba(220, 227, 233, 0.9);
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.survey-item {
  cursor: pointer;
  text-align: left;
}

.survey-item.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.18);
}

.survey-item__head,
.survey-item__meta,
.stats-line,
.response-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.survey-item__meta,
.question-remark,
.paper-header__meta,
.stats-card__meta,
.answer-card__meta {
  color: #64748b;
  font-size: 13px;
}

.paper-shell,
.matrix-answer {
  display: grid;
  gap: 18px;
}

.required-mark {
  color: #dc2626;
}

.matrix-answer__row {
  display: grid;
  gap: 10px;
}

.matrix-answer__label,
.question-title {
  font-weight: 600;
}

.stats-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stats-kpi span {
  color: #64748b;
  font-size: 13px;
}

.stats-kpi strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.stats-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.text-answers p,
.answer-card__content {
  white-space: pre-wrap;
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .stats-kpis,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
