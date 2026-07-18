<template>
  <StandardPage
    :title="pageTitle"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <div class="fill-kpis">
      <article class="fill-kpi">
        <span>当前角色</span>
        <strong>{{ roleLabel }}</strong>
        <small>问卷入口会根据角色自动切换</small>
      </article>
      <article class="fill-kpi">
        <span>可见问卷</span>
        <strong>{{ surveyCards.length }}</strong>
        <small>仅显示已发布且匹配当前角色的问卷</small>
      </article>
      <article class="fill-kpi">
        <span>已提交</span>
        <strong>{{ submittedCount }}</strong>
        <small>本地演示数据中的个人提交份数</small>
      </article>
      <article class="fill-kpi">
        <span>待完成</span>
        <strong>{{ pendingCount }}</strong>
        <small>仍可填写的问卷任务</small>
      </article>
    </div>

    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="问卷填写" name="fill">
          <div class="fill-layout">
            <SectionCard title="待填问卷">
              <div class="survey-list soft-scrollbar">
                <button
                  v-for="item in surveyCards"
                  :key="item.id"
                  type="button"
                  class="survey-list__item"
                  :class="{ 'is-active': item.id === selectedSurveyId }"
                  @click="selectSurvey(item.id)"
                >
                  <div class="survey-list__head">
                    <div>
                      <div class="survey-list__title">{{ item.title }}</div>
                      <div class="survey-list__meta">{{ item.scene }} · {{ formatDateTime(item.deadline) }} 截止</div>
                    </div>
                    <el-tag :type="item.alreadySubmitted ? 'success' : 'warning'">
                      {{ item.alreadySubmitted ? '已提交' : '待填写' }}
                    </el-tag>
                  </div>
                  <p class="survey-list__desc">{{ item.submitMessage }}</p>
                </button>
                <el-empty v-if="!surveyCards.length" description="当前没有可填写的已发布问卷" />
              </div>
            </SectionCard>

            <SectionCard title="答卷区">
              <template #extra>
                <el-button type="primary" :disabled="!selectedSurvey || selectedEntry?.alreadySubmitted" @click="submitSurvey">
                  {{ selectedEntry?.alreadySubmitted ? '已完成提交' : '提交答卷' }}
                </el-button>
              </template>

              <div v-if="selectedSurvey" class="paper-shell">
                <header class="paper-shell__header" :style="{ '--survey-color': selectedSurvey.coverColor || '#1f4f5c' }">
                  <span>{{ typeLabel(selectedSurvey.surveyType) }}</span>
                  <h3>{{ selectedSurvey.title }}</h3>
                  <p>{{ selectedSurvey.subtitle }}</p>
                </header>

                <div class="paper-shell__body">
                  <article
                    v-for="question in selectedSurvey.questions"
                    :key="question.id"
                    class="paper-question"
                  >
                    <div class="paper-question__title">
                      {{ question.sortNo }}. {{ question.title }}
                      <span v-if="question.required" class="paper-question__required">*</span>
                    </div>
                    <p v-if="question.description" class="paper-question__desc">{{ question.description }}</p>

                    <el-radio-group
                      v-if="['single', 'rating'].includes(question.type)"
                      v-model="answerState[question.id].singleValue"
                      :disabled="selectedEntry?.alreadySubmitted"
                    >
                      <el-radio
                        v-for="option in question.options"
                        :key="option.id"
                        :label="option.value"
                      >
                        {{ option.label }}
                      </el-radio>
                    </el-radio-group>

                    <el-checkbox-group
                      v-else-if="question.type === 'multiple'"
                      v-model="answerState[question.id].multiValues"
                      :disabled="selectedEntry?.alreadySubmitted"
                    >
                      <el-checkbox
                        v-for="option in question.options"
                        :key="option.id"
                        :label="option.value"
                      >
                        {{ option.label }}
                      </el-checkbox>
                    </el-checkbox-group>

                    <el-input
                      v-else-if="question.type === 'text'"
                      v-model="answerState[question.id].text"
                      type="textarea"
                      :rows="4"
                      :disabled="selectedEntry?.alreadySubmitted"
                      :placeholder="question.placeholder || '请输入你的回答'"
                    />

                    <div v-else-if="question.type === 'matrix'" class="matrix-answer">
                      <div v-for="row in question.rows" :key="row.id" class="matrix-answer__row">
                        <div class="matrix-answer__label">{{ row.label }}</div>
                        <el-radio-group
                          v-model="answerState[question.id].matrix[row.id]"
                          :disabled="selectedEntry?.alreadySubmitted"
                        >
                          <el-radio
                            v-for="column in question.columns"
                            :key="column.id"
                            :label="column.value"
                          >
                            {{ column.label }}
                          </el-radio>
                        </el-radio-group>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
              <el-empty v-else description="请先选择一份问卷开始填写" />
            </SectionCard>

            <div class="aside-stack">
              <SectionCard title="填写规则">
                <div v-if="selectedSurvey" class="tips-panel">
                  <div class="tips-panel__item">
                    <span>面向对象</span>
                    <strong>{{ audienceLabel(selectedSurvey.audienceRole) }}</strong>
                  </div>
                  <div class="tips-panel__item">
                    <span>题目数量</span>
                    <strong>{{ selectedSurvey.questions.length }} 题</strong>
                  </div>
                  <div class="tips-panel__item">
                    <span>匿名策略</span>
                    <strong>{{ selectedSurvey.anonymous ? '匿名答卷' : '实名答卷' }}</strong>
                  </div>
                  <div class="tips-panel__item">
                    <span>提交截止</span>
                    <strong>{{ formatDateTime(selectedSurvey.deadline) }}</strong>
                  </div>
                </div>
                <el-empty v-else description="选择问卷后显示填写规则" />
              </SectionCard>

              <SectionCard title="完成进度">
                <div v-if="selectedSurvey" class="progress-panel">
                  <el-progress :percentage="completionRate" :stroke-width="16" />
                  <div class="progress-panel__legend">
                    已完成 {{ answeredCount }} / {{ selectedSurvey.questions.length }} 题
                  </div>
                  <el-alert
                    :title="selectedEntry?.alreadySubmitted ? '你已提交当前答卷，可切换其它问卷查看。' : '提交前请确保所有必答题已完成。'"
                    :type="selectedEntry?.alreadySubmitted ? 'success' : 'info'"
                    :closable="false"
                    show-icon
                  />
                </div>
                <el-empty v-else description="暂无进度信息" />
              </SectionCard>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane v-if="isAdmin" label="回收统计" name="stats">
          <div class="stats-layout">
            <SectionCard title="统计对象">
              <el-select v-model="statsSurveyId" placeholder="选择一份已发布问卷" style="width: 100%;" @change="loadStats">
                <el-option
                  v-for="item in publishedSurveys"
                  :key="item.id"
                  :label="`${item.code} · ${item.title}`"
                  :value="item.id"
                />
              </el-select>
            </SectionCard>

            <div class="stats-kpis">
              <article class="stats-kpi">
                <span>目标份数</span>
                <strong>{{ statsOverview.targetCount || 0 }}</strong>
              </article>
              <article class="stats-kpi">
                <span>已提交</span>
                <strong>{{ statsOverview.submittedCount || 0 }}</strong>
              </article>
              <article class="stats-kpi">
                <span>待回收</span>
                <strong>{{ statsOverview.pendingCount || 0 }}</strong>
              </article>
              <article class="stats-kpi">
                <span>回收率</span>
                <strong>{{ statsOverview.recoveryRate || 0 }}%</strong>
              </article>
            </div>

            <div class="stats-grid">
              <SectionCard title="逐题统计">
                <div class="stats-question-list">
                  <article v-for="question in questionStats" :key="question.questionId" class="stats-question-card">
                    <div class="stats-question-card__title">{{ question.questionCode }} {{ question.questionText }}</div>
                    <div class="stats-question-card__meta">
                      {{ questionTypeLabel(question.questionType) }} · {{ question.responseCount }} 份回答
                    </div>
                    <div v-if="question.optionStats.length" class="stats-lines">
                      <div v-for="option in question.optionStats" :key="option.optionId" class="stats-lines__row">
                        <span>{{ option.optionText }}</span>
                        <strong>{{ option.selectCount }}</strong>
                      </div>
                    </div>
                    <div v-else-if="question.textAnswers.length" class="stats-texts">
                      <p v-for="(answer, index) in question.textAnswers.slice(0, 4)" :key="`${question.questionId}_${index}`">{{ answer }}</p>
                    </div>
                    <div v-else-if="question.matrixCellStats.length" class="stats-texts">
                      <p v-for="cell in question.matrixCellStats.slice(0, 6)" :key="`${cell.rowId}_${cell.columnId}`">
                        {{ cell.rowText }} / {{ cell.columnText }}：{{ cell.selectCount }}
                      </p>
                    </div>
                  </article>
                </div>
              </SectionCard>

              <SectionCard title="答卷明细">
                <template #extra>
                  <el-button :disabled="!statsSurveyId" @click="downloadCsv">导出 CSV</el-button>
                </template>
                <el-table :data="responseRows" border stripe>
                  <el-table-column prop="respondentName" label="填报人" min-width="140" />
                  <el-table-column prop="respondentType" label="角色" min-width="100" />
                  <el-table-column prop="submitStatus" label="状态" min-width="100" />
                  <el-table-column prop="answerCount" label="回答数" min-width="90" />
                  <el-table-column prop="submittedAt" label="提交时间" min-width="160">
                    <template #default="{ row }">
                      {{ formatDateTime(row.submittedAt) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" link @click="openResponseDetail(row.id)">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </SectionCard>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-drawer v-model="detailVisible" title="答卷详情" size="44%">
      <div v-if="responseDetail" class="response-detail">
        <div class="response-detail__meta">
          <article class="response-detail__card">
            <span>填报人</span>
            <strong>{{ responseDetail.respondentName }}</strong>
          </article>
          <article class="response-detail__card">
            <span>提交时间</span>
            <strong>{{ formatDateTime(responseDetail.submittedAt) }}</strong>
          </article>
        </div>
        <div class="response-detail__answers">
          <article v-for="answer in responseDetail.answers" :key="answer.questionId" class="response-detail__answer">
            <div class="response-detail__title">{{ answer.questionCode }} {{ answer.questionText }}</div>
            <div class="response-detail__content">{{ formatAnswer(answer) }}</div>
          </article>
        </div>
      </div>
      <el-empty v-else description="暂无答卷详情" />
    </el-drawer>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import {
  AUDIENCE_OPTIONS,
  PUBLISH_STATUS_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  SURVEY_TYPE_OPTIONS,
  buildQuestionStats,
  buildSurveyOverview,
  exportSurveyResponsesCsv,
  formatDateTime,
  getSurveyById,
  getSurveyResponseDetail,
  listAccessibleSurveys,
  listSurveyResponses,
  listSurveys,
  submitSurveyResponse
} from '../../data/surveyWorkbench';
import { ROLE_LABEL_MAP, useUserStore } from '../../store/user';

const userStore = useUserStore();

const activeTab = ref(userStore.userInfo.role === ROLES.SUPER ? 'stats' : 'fill');
const surveyCards = ref([]);
const selectedSurveyId = ref('');
const selectedSurvey = ref(null);
const answerState = reactive({});

const statsSurveyId = ref('');
const statsOverview = reactive({
  targetCount: 0,
  submittedCount: 0,
  pendingCount: 0,
  recoveryRate: 0
});
const questionStats = ref([]);
const responseRows = ref([]);
const detailVisible = ref(false);
const responseDetail = ref(null);

const isAdmin = computed(() => userStore.userInfo.role === ROLES.SUPER);
const publishedSurveys = computed(() => listSurveys().filter((item) => item.status === 'PUBLISHED'));
const selectedEntry = computed(() => surveyCards.value.find((item) => item.id === selectedSurveyId.value) || null);
const roleLabel = computed(() => ROLE_LABEL_MAP[userStore.userInfo.role] || '未分配角色');

const pageTitle = computed(() => (isAdmin.value ? '问卷填报与统计' : '问卷填写'));

const breadcrumbs = computed(() => {
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return ['首页', '问卷与改进', '问卷填写'];
  }
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return ['首页', '问卷填写', '在线答卷'];
  }
  return ['首页', '问卷与改进', '问卷填报与统计'];
});

const pageDescription = computed(() => {
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return '教师只看到面向教师发布的问卷，并可在本地工作台中完成填写与查看提交状态。';
  }
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return '学生端突出待填问卷、填写进度和提交确认，保持与管理员设计端一致的题型展示。';
  }
  return '管理员在这一页模拟填写视角，并查看回收率、逐题统计与答卷明细。';
});

const submittedCount = computed(() => surveyCards.value.filter((item) => item.alreadySubmitted).length);
const pendingCount = computed(() => Math.max(surveyCards.value.length - submittedCount.value, 0));

const answeredCount = computed(() => {
  if (!selectedSurvey.value) {
    return 0;
  }
  return selectedSurvey.value.questions.filter((question) => {
    const current = answerState[question.id];
    if (!current) {
      return false;
    }
    if (question.type === 'text') {
      return Boolean((current.text || '').trim());
    }
    if (question.type === 'matrix') {
      return Object.keys(current.matrix || {}).length > 0;
    }
    if (question.type === 'multiple') {
      return (current.multiValues || []).length > 0;
    }
    return Boolean(current.singleValue);
  }).length;
});

const completionRate = computed(() => {
  if (!selectedSurvey.value?.questions.length) {
    return 0;
  }
  return Number(((answeredCount.value / selectedSurvey.value.questions.length) * 100).toFixed(0));
});

function questionTypeLabel(type) {
  return QUESTION_TYPE_OPTIONS.find((item) => item.value === type)?.label || type;
}

function typeLabel(type) {
  return SURVEY_TYPE_OPTIONS.find((item) => item.value === type)?.label || type;
}

function audienceLabel(role) {
  return AUDIENCE_OPTIONS.find((item) => item.value === role)?.label || role;
}

function ensureAnswerState(question) {
  if (!answerState[question.id]) {
    answerState[question.id] = {
      singleValue: '',
      multiValues: [],
      text: '',
      matrix: {}
    };
  }
}

function fillExistingResponse(survey) {
  const currentEntry = surveyCards.value.find((item) => item.id === survey.id);
  if (!currentEntry?.responseId) {
    return;
  }
  const detail = getSurveyResponseDetail(survey.id, currentEntry.responseId);
  (detail?.answers || []).forEach((answer) => {
    const target = answerState[answer.questionId];
    const rawAnswer = getSurveyById(survey.id)?.responses?.find((item) => item.id === currentEntry.responseId)?.answers?.find((item) => item.questionId === answer.questionId);
    if (!target || !rawAnswer) {
      return;
    }
    target.singleValue = rawAnswer.values?.[0] || '';
    target.multiValues = rawAnswer.values || [];
    target.text = rawAnswer.text || '';
    target.matrix = rawAnswer.matrix || {};
  });
}

function loadSurveyCards() {
  surveyCards.value = listAccessibleSurveys(userStore.userInfo.role, userStore.userInfo);
  if (!surveyCards.value.length) {
    selectedSurveyId.value = '';
    selectedSurvey.value = null;
    return;
  }
  const preferred = selectedSurveyId.value || surveyCards.value.find((item) => !item.alreadySubmitted)?.id || surveyCards.value[0].id;
  selectSurvey(preferred);
}

function selectSurvey(id) {
  selectedSurveyId.value = id;
  const survey = getSurveyById(id);
  selectedSurvey.value = survey;
  (survey?.questions || []).forEach((question) => {
    answerState[question.id] = {
      singleValue: '',
      multiValues: [],
      text: '',
      matrix: {}
    };
    ensureAnswerState(question);
  });
  fillExistingResponse(survey);
}

function buildAnswerPayload() {
  return (selectedSurvey.value?.questions || []).map((question) => {
    const current = answerState[question.id];
    if (question.type === 'text') {
      return { questionId: question.id, text: current.text || '' };
    }
    if (question.type === 'matrix') {
      return { questionId: question.id, matrix: { ...(current.matrix || {}) } };
    }
    if (question.type === 'multiple') {
      return { questionId: question.id, values: [...(current.multiValues || [])] };
    }
    return { questionId: question.id, values: current.singleValue ? [current.singleValue] : [] };
  });
}

function validateBeforeSubmit() {
  for (const question of selectedSurvey.value?.questions || []) {
    if (!question.required) {
      continue;
    }
    const current = answerState[question.id];
    if (question.type === 'text' && !(current.text || '').trim()) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (question.type === 'matrix' && Object.keys(current.matrix || {}).length === 0) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (question.type === 'multiple' && !(current.multiValues || []).length) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
    if (['single', 'rating'].includes(question.type) && !current.singleValue) {
      ElMessage.warning(`请完成第 ${question.sortNo} 题`);
      return false;
    }
  }
  return true;
}

function submitSurvey() {
  if (!selectedSurvey.value || selectedEntry.value?.alreadySubmitted) {
    return;
  }
  if (!validateBeforeSubmit()) {
    return;
  }
  submitSurveyResponse(selectedSurvey.value.id, userStore.userInfo, buildAnswerPayload());
  ElMessage.success('答卷已提交，页面统计已同步更新');
  loadSurveyCards();
  if (statsSurveyId.value === selectedSurvey.value.id) {
    loadStats();
  }
}

function loadStats() {
  if (!statsSurveyId.value) {
    return;
  }
  const overview = buildSurveyOverview(statsSurveyId.value);
  Object.assign(statsOverview, overview || {
    targetCount: 0,
    submittedCount: 0,
    pendingCount: 0,
    recoveryRate: 0
  });
  questionStats.value = buildQuestionStats(statsSurveyId.value);
  responseRows.value = listSurveyResponses(statsSurveyId.value);
}

function openResponseDetail(responseId) {
  responseDetail.value = getSurveyResponseDetail(statsSurveyId.value, responseId);
  detailVisible.value = true;
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

function downloadCsv() {
  const blob = exportSurveyResponsesCsv(statsSurveyId.value);
  if (!blob) {
    return;
  }
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `survey-${statsSurveyId.value}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

loadSurveyCards();
statsSurveyId.value = publishedSurveys.value[0]?.id || '';
loadStats();
</script>

<style scoped>
.fill-kpis,
.stats-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.fill-kpi,
.stats-kpi {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 252, 0.98));
}

.fill-kpi span,
.fill-kpi small,
.stats-kpi span {
  display: block;
  color: var(--text-light);
}

.fill-kpi strong,
.stats-kpi strong {
  display: block;
  margin: 10px 0 8px;
  font-size: 32px;
  color: #173f4c;
  font-family: var(--font-serif);
}

.fill-layout {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr) 320px;
  gap: 20px;
}

.survey-list,
.aside-stack,
.paper-shell,
.paper-shell__body,
.stats-layout,
.stats-grid,
.stats-question-list,
.tips-panel,
.response-detail,
.response-detail__answers {
  display: grid;
  gap: 16px;
}

.survey-list {
  max-height: 840px;
  overflow: auto;
}

.survey-list__item,
.paper-question,
.fill-kpi,
.tips-panel__item,
.stats-question-card,
.response-detail__card,
.response-detail__answer {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff, #f8fbfc);
}

.survey-list__item {
  border: 1px solid rgba(231, 223, 213, 0.92);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.survey-list__item.is-active,
.survey-list__item:hover {
  transform: translateY(-2px);
  border-color: rgba(31, 79, 92, 0.28);
  box-shadow: 0 14px 28px rgba(34, 58, 76, 0.08);
}

.survey-list__head,
.stats-lines__row,
.response-detail__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.survey-list__title,
.paper-question__title,
.stats-question-card__title,
.response-detail__title {
  font-weight: 600;
  color: var(--text-primary);
}

.survey-list__meta,
.survey-list__desc,
.paper-question__desc,
.stats-question-card__meta {
  margin-top: 8px;
  color: var(--text-light);
  font-size: 13px;
}

.paper-shell__header {
  padding: 22px;
  border-radius: 20px;
  color: #fff;
  background:
    linear-gradient(135deg, var(--survey-color) 0%, color-mix(in srgb, var(--survey-color) 78%, white) 100%);
}

.paper-shell__header span {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.82;
}

.paper-shell__header h3 {
  margin: 10px 0 8px;
  font-size: 28px;
}

.paper-shell__header p {
  margin: 0;
  opacity: 0.9;
}

.paper-question {
  display: grid;
  gap: 12px;
}

.paper-question__required {
  color: #c53030;
}

.matrix-answer,
.progress-panel {
  display: grid;
  gap: 14px;
}

.matrix-answer__row {
  display: grid;
  gap: 8px;
}

.matrix-answer__label {
  font-weight: 600;
  color: var(--text-secondary);
}

.tips-panel__item span,
.response-detail__card span {
  display: block;
  font-size: 12px;
  color: var(--text-light);
}

.tips-panel__item strong,
.response-detail__card strong {
  display: block;
  margin-top: 8px;
}

.progress-panel__legend {
  color: var(--text-secondary);
}

.stats-grid {
  grid-template-columns: minmax(0, 1fr) minmax(460px, 1.1fr);
}

.stats-lines,
.stats-texts {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  color: var(--text-secondary);
}

.response-detail__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.response-detail__content {
  margin-top: 10px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  line-height: 1.8;
}

@media (max-width: 1480px) {
  .fill-layout,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1120px) {
  .fill-kpis,
  .stats-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .fill-kpis,
  .stats-kpis,
  .response-detail__meta {
    grid-template-columns: 1fr;
  }
}
</style>
