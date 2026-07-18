<template>
  <StandardPage
    title="问卷填报与回收统计"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="问卷填报" name="fill">
          <div class="survey-fill-shell">
            <SectionCard title="可参与问卷">
              <div v-loading="loading.list" class="survey-fill-list soft-scrollbar">
                <button
                  v-for="item in accessibleSurveys"
                  :key="item.questionnaireId"
                  type="button"
                  class="survey-fill-item"
                  :class="{ 'is-active': item.questionnaireId === activeQuestionnaireId }"
                  @click="openQuestionnaire(item.questionnaireId)"
                >
                  <div class="survey-fill-item__head">
                    <div>
                      <div class="survey-fill-item__title">{{ item.title }}</div>
                      <div class="survey-fill-item__meta">
                        {{ formatDateTime(item.startTime) }} - {{ formatDateTime(item.endTime) }}
                      </div>
                    </div>
                    <el-tag :type="item.alreadySubmitted === 1 ? 'success' : (item.canSubmit === 1 ? 'warning' : 'info')">
                      {{ item.alreadySubmitted === 1 ? '已提交' : (item.canSubmit === 1 ? '待填写' : '不可填写') }}
                    </el-tag>
                  </div>
                  <div class="survey-fill-item__desc">
                    {{ item.submitMessage || '点击查看问卷详情与填写入口' }}
                  </div>
                </button>
                <el-empty v-if="!loading.list && !accessibleSurveys.length" description="暂无可参与问卷" />
              </div>
            </SectionCard>

            <SectionCard title="问卷填写区">
              <template #extra>
                <el-button
                  type="primary"
                  :loading="loading.submit"
                  :disabled="!fillView || fillView.canSubmit !== 1 || fillView.alreadySubmitted === 1"
                  @click="submitCurrentSurvey"
                >
                  提交答卷
                </el-button>
              </template>

              <div v-if="fillView" class="fill-panel">
                <div class="fill-panel__header">
                  <h3>{{ fillView.title }}</h3>
                  <p>{{ fillView.submitMessage || '请按要求完成所有必答题。' }}</p>
                </div>

                <div v-if="fillView.questionnaire?.questions?.length" class="fill-question-list">
                  <article
                    v-for="question in fillView.questionnaire.questions"
                    :key="question.id"
                    class="fill-question-card"
                  >
                    <div class="fill-question-card__title">
                      {{ question.sortNo }}. {{ question.questionText }}
                      <span v-if="question.isRequired === 1" class="required-mark">*</span>
                    </div>

                    <el-radio-group
                      v-if="['SINGLE', 'SCALE'].includes(question.questionType)"
                      v-model="answerMap[question.id].singleOptionId"
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
                      v-model="answerMap[question.id].optionIds"
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
                      v-model="answerMap[question.id].answerText"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入文本回答"
                    />

                    <div v-else-if="question.questionType === 'MATRIX'" class="matrix-question">
                      <div
                        v-for="row in question.matrixRows || []"
                        :key="row.id"
                        class="matrix-question__row"
                      >
                        <div class="matrix-question__row-title">{{ row.rowText }}</div>
                        <el-radio-group v-model="answerMap[question.id].matrixSelections[row.id]">
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
                <el-empty v-else description="当前问卷暂无题目" />
              </div>
              <el-empty v-else description="请选择左侧问卷开始填写" />
            </SectionCard>
          </div>
        </el-tab-pane>

        <el-tab-pane v-if="isAdmin" label="回收统计" name="stats">
          <div class="survey-stats-shell">
            <SectionCard title="统计对象">
              <el-select
                v-model="statsQuestionnaireId"
                filterable
                placeholder="选择问卷查看回收统计"
                style="width: 100%;"
                @change="loadStats"
              >
                <el-option
                  v-for="item in publishedSurveyOptions"
                  :key="item.id"
                  :label="`${item.questionnaireCode} - ${item.title}`"
                  :value="item.id"
                />
              </el-select>
            </SectionCard>

            <div class="page-kpis">
              <article class="page-kpi">
                <div class="page-kpi__label">目标人数</div>
                <div class="page-kpi__value">{{ statsOverview.targetCount || 0 }}</div>
                <div class="page-kpi__desc">问卷当前发放范围内的目标对象数</div>
              </article>
              <article class="page-kpi">
                <div class="page-kpi__label">已提交</div>
                <div class="page-kpi__value">{{ statsOverview.submittedCount || 0 }}</div>
                <div class="page-kpi__desc">已完成答卷提交的人数</div>
              </article>
              <article class="page-kpi">
                <div class="page-kpi__label">待回收</div>
                <div class="page-kpi__value">{{ statsOverview.pendingCount || 0 }}</div>
                <div class="page-kpi__desc">尚未提交的问卷数量</div>
              </article>
              <article class="page-kpi">
                <div class="page-kpi__label">回收率</div>
                <div class="page-kpi__value">{{ formatRate(statsOverview.recoveryRate) }}</div>
                <div class="page-kpi__desc">submittedCount / targetCount</div>
              </article>
            </div>

            <div class="survey-stats-grid">
              <SectionCard title="按题统计">
                <div v-loading="loading.stats" class="stats-question-list">
                  <article v-for="question in questionStats" :key="question.questionId" class="stats-question-card">
                    <div class="stats-question-card__title">{{ question.questionCode }} {{ question.questionText }}</div>
                    <div class="stats-question-card__meta">{{ question.questionType }} · {{ question.responseCount || 0 }} 份回答</div>
                    <div v-if="question.optionStats?.length" class="stats-option-list">
                      <div v-for="option in question.optionStats" :key="option.optionId" class="stats-option-row">
                        <span>{{ option.optionText }}</span>
                        <strong>{{ option.selectCount || 0 }}</strong>
                      </div>
                    </div>
                    <div v-else-if="question.textAnswers?.length" class="stats-text-list">
                      <p v-for="(answer, index) in question.textAnswers.slice(0, 4)" :key="`${question.questionId}_${index}`">
                        {{ answer }}
                      </p>
                    </div>
                    <div v-else-if="question.matrixCellStats?.length" class="stats-text-list">
                      <p v-for="cell in question.matrixCellStats.slice(0, 6)" :key="`${cell.rowId}_${cell.columnId}`">
                        {{ cell.rowText }} / {{ cell.columnText }}：{{ cell.selectCount || 0 }}
                      </p>
                    </div>
                  </article>
                  <el-empty v-if="!loading.stats && !questionStats.length" description="暂无题目统计数据" />
                </div>
              </SectionCard>

              <SectionCard title="回收明细">
                <template #extra>
                  <el-button @click="downloadResponses" :disabled="!statsQuestionnaireId">导出答卷</el-button>
                </template>
                <el-table v-loading="loading.stats" :data="responseRows" border stripe>
                  <el-table-column prop="respondentName" label="填报人" min-width="140" />
                  <el-table-column prop="respondentType" label="对象类型" min-width="120" />
                  <el-table-column prop="submitStatus" label="提交状态" min-width="110" />
                  <el-table-column prop="answerCount" label="答题数" min-width="90" />
                  <el-table-column prop="submittedAt" label="提交时间" min-width="170">
                    <template #default="{ row }">
                      {{ formatDateTime(row.submittedAt) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                      <el-button type="primary" link @click="openResponseDetail(row.id)">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="crud-pagination">
                  <el-pagination
                    v-model:current-page="responsePager.pageNum"
                    v-model:page-size="responsePager.pageSize"
                    background
                    layout="total, prev, pager, next"
                    :total="responsePager.total"
                    @current-change="loadResponses"
                    @size-change="loadResponses"
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-drawer v-model="responseDetailVisible" title="答卷详情" size="44%">
      <div v-if="responseDetail">
        <div class="response-detail-meta">
          <article class="response-detail-card">
            <div class="response-detail-card__label">填报人</div>
            <div class="response-detail-card__value">{{ responseDetail.respondentName || '-' }}</div>
          </article>
          <article class="response-detail-card">
            <div class="response-detail-card__label">提交时间</div>
            <div class="response-detail-card__value">{{ formatDateTime(responseDetail.submittedAt) }}</div>
          </article>
        </div>
        <div class="response-answer-list">
          <article
            v-for="answer in responseDetail.answers || []"
            :key="answer.questionId"
            class="response-answer-card"
          >
            <div class="response-answer-card__title">{{ answer.questionCode }} {{ answer.questionText }}</div>
            <div class="response-answer-card__content">{{ formatAnswer(answer) }}</div>
          </article>
        </div>
      </div>
      <el-empty v-else description="暂无答卷详情" />
    </el-drawer>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import { useUserStore } from '../../store/user';
import {
  buildSurveyResponseDownloadUrl,
  fetchSurveyFillView,
  fetchSurveyQuestionStats,
  fetchSurveyQuestionnaires,
  fetchSurveyResponseDetail,
  fetchSurveyResponseOverview,
  fetchSurveyResponses,
  submitSurveyResponse
} from '../../api/survey';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = reactive({
  list: false,
  detail: false,
  submit: false,
  stats: false
});

const activeTab = ref(userStore.userInfo.role === ROLES.SUPER ? String(route.query.tab || 'fill') : 'fill');
const accessibleSurveys = ref([]);
const publishedSurveyOptions = ref([]);
const activeQuestionnaireId = ref(route.query.id ? Number(route.query.id) : null);
const fillView = ref(null);
const answerMap = reactive({});

const statsQuestionnaireId = ref(null);
const statsOverview = reactive({
  targetCount: 0,
  submittedCount: 0,
  pendingCount: 0,
  recoveryRate: 0
});
const questionStats = ref([]);
const responseRows = ref([]);
const responsePager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
const responseDetailVisible = ref(false);
const responseDetail = ref(null);

const isAdmin = computed(() => userStore.userInfo.role === ROLES.SUPER);

const breadcrumbs = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return ['首页', '学习服务', '问卷填报'];
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return ['首页', '问卷与改进', '问卷填报'];
  }
  return ['首页', '问卷与改进', '问卷填报与回收统计'];
});

const pageDescription = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return '学生只看到自己可填写的问卷与提交入口。';
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return '教师可以完成问卷填报，并查看自己参与对象的填写状态。';
  }
  return '管理员统一查看问卷填报入口、回收率和逐题统计结果。';
});

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function formatRate(value) {
  const num = Number(value || 0);
  return `${Number.isNaN(num) ? 0 : num.toFixed(2)}%`;
}

function roleToRespondentType() {
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return 'TEACHER';
  }
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return 'STUDENT';
  }
  return 'ALL';
}

function ensureAnswerState(questions = []) {
  questions.forEach((question) => {
    answerMap[question.id] = answerMap[question.id] || {
      optionIds: [],
      singleOptionId: null,
      answerText: '',
      matrixSelections: {}
    };
  });
}

function buildSubmitAnswers() {
  return (fillView.value?.questionnaire?.questions || []).map((question) => {
    const current = answerMap[question.id] || {};
    if (question.questionType === 'TEXT') {
      return {
        questionId: question.id,
        answerText: current.answerText || ''
      };
    }
    if (question.questionType === 'MATRIX') {
      const matrixSelections = Object.entries(current.matrixSelections || {})
        .filter(([, columnId]) => Boolean(columnId))
        .map(([rowId, columnId]) => ({
          rowId: Number(rowId),
          columnId: Number(columnId)
        }));
      return {
        questionId: question.id,
        matrixSelections
      };
    }
    if (['SINGLE', 'SCALE'].includes(question.questionType)) {
      return {
        questionId: question.id,
        optionIds: current.singleOptionId ? [current.singleOptionId] : []
      };
    }
    return {
      questionId: question.id,
      optionIds: current.optionIds || []
    };
  });
}

async function loadPublishedQuestionnaires() {
  const page = await fetchSurveyQuestionnaires({
    pageNum: 1,
    pageSize: 100,
    publishStatus: 'PUBLISHED'
  });
  publishedSurveyOptions.value = page.records || [];
}

async function loadAccessibleSurveys() {
  loading.list = true;
  try {
    await loadPublishedQuestionnaires();
    const userId = userStore.userInfo.id;
    const views = await Promise.all(
      publishedSurveyOptions.value.map(async (item) => {
        try {
          return await fetchSurveyFillView(item.id, userId);
        } catch {
          return null;
        }
      })
    );

    accessibleSurveys.value = views.filter(Boolean);

    const targetId = activeQuestionnaireId.value
      || accessibleSurveys.value.find((item) => item.canSubmit === 1)?.questionnaireId
      || accessibleSurveys.value[0]?.questionnaireId;

    if (targetId) {
      await openQuestionnaire(targetId);
    }

    if (isAdmin.value && !statsQuestionnaireId.value && publishedSurveyOptions.value.length) {
      statsQuestionnaireId.value = publishedSurveyOptions.value[0].id;
      await loadStats();
    }
  } finally {
    loading.list = false;
  }
}

async function openQuestionnaire(questionnaireId) {
  activeQuestionnaireId.value = questionnaireId;
  loading.detail = true;
  try {
    fillView.value = await fetchSurveyFillView(questionnaireId, userStore.userInfo.id);
    ensureAnswerState(fillView.value?.questionnaire?.questions || []);
    await router.replace({
      path: '/survey/fill',
      query: {
        ...route.query,
        tab: activeTab.value,
        id: String(questionnaireId)
      }
    });
  } finally {
    loading.detail = false;
  }
}

async function submitCurrentSurvey() {
  if (!fillView.value?.questionnaireId) return;
  loading.submit = true;
  try {
    await submitSurveyResponse(fillView.value.questionnaireId, {
      respondentUserId: userStore.userInfo.id,
      respondentName: userStore.userInfo.realName,
      respondentType: roleToRespondentType(),
      remark: '前端提交问卷',
      answers: buildSubmitAnswers()
    });
    ElMessage.success('问卷提交成功');
    await loadAccessibleSurveys();
  } finally {
    loading.submit = false;
  }
}

async function loadResponses() {
  if (!statsQuestionnaireId.value) return;
  const page = await fetchSurveyResponses(statsQuestionnaireId.value, {
    pageNum: responsePager.pageNum,
    pageSize: responsePager.pageSize
  });
  responseRows.value = page.records || [];
  responsePager.total = Number(page.total || 0);
}

async function loadStats() {
  if (!statsQuestionnaireId.value) return;
  loading.stats = true;
  try {
    const [overview, questions] = await Promise.all([
      fetchSurveyResponseOverview(statsQuestionnaireId.value),
      fetchSurveyQuestionStats(statsQuestionnaireId.value),
      loadResponses()
    ]);
    Object.assign(statsOverview, overview || {});
    questionStats.value = questions || [];
  } finally {
    loading.stats = false;
  }
}

async function openResponseDetail(responseId) {
  if (!statsQuestionnaireId.value) return;
  responseDetail.value = await fetchSurveyResponseDetail(statsQuestionnaireId.value, responseId);
  responseDetailVisible.value = true;
}

function formatAnswer(answer) {
  if (answer.answerText) return answer.answerText;
  if (answer.selectedOptionTexts?.length) return answer.selectedOptionTexts.join('、');
  if (answer.matrixAnswers?.length) {
    return answer.matrixAnswers.map((item) => `${item.rowText}: ${item.columnText}`).join('；');
  }
  return '-';
}

function downloadResponses() {
  if (!statsQuestionnaireId.value) return;
  window.open(buildSurveyResponseDownloadUrl(statsQuestionnaireId.value), '_blank');
}

watch(activeTab, async (value) => {
  if (!isAdmin.value) return;
  await router.replace({
    path: '/survey/fill',
    query: {
      ...route.query,
      tab: value,
      id: activeQuestionnaireId.value ? String(activeQuestionnaireId.value) : undefined
    }
  });
});

onMounted(async () => {
  await loadAccessibleSurveys();
});
</script>

<style scoped>
.survey-fill-shell,
.survey-stats-shell {
  display: grid;
  gap: 20px;
}

.survey-fill-shell {
  grid-template-columns: 340px minmax(0, 1fr);
}

.survey-fill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.survey-fill-item,
.fill-question-card,
.stats-question-card,
.response-detail-card,
.response-answer-card {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.survey-fill-item {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.survey-fill-item:hover,
.survey-fill-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.survey-fill-item__head,
.stats-option-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.survey-fill-item__title,
.fill-question-card__title,
.stats-question-card__title,
.response-answer-card__title {
  font-weight: 600;
  color: var(--text-primary);
}

.survey-fill-item__meta,
.survey-fill-item__desc,
.stats-question-card__meta {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.fill-panel,
.fill-question-list,
.survey-stats-grid,
.stats-question-list,
.response-answer-list {
  display: grid;
  gap: 16px;
}

.fill-panel__header h3 {
  margin: 0 0 8px;
}

.fill-panel__header p {
  margin: 0;
  color: var(--text-secondary);
}

.required-mark {
  color: #c53030;
}

.matrix-question {
  display: grid;
  gap: 14px;
}

.matrix-question__row {
  display: grid;
  gap: 8px;
}

.matrix-question__row-title {
  font-weight: 600;
  color: var(--text-secondary);
}

.survey-stats-grid {
  grid-template-columns: minmax(0, 1fr) minmax(520px, 1.1fr);
}

.stats-option-list,
.stats-text-list {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  color: var(--text-secondary);
}

.response-detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.response-detail-card__label {
  font-size: 12px;
  color: var(--text-light);
}

.response-detail-card__value {
  margin-top: 10px;
  font-weight: 600;
}

.response-answer-card__content {
  margin-top: 10px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

@media (max-width: 1280px) {
  .survey-fill-shell,
  .survey-stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .response-detail-meta {
    grid-template-columns: 1fr;
  }
}
</style>
