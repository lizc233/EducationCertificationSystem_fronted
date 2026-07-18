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
        <small>当前账号已完成提交的问卷数量</small>
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
                <el-button type="primary" :disabled="!selectedSurvey || selectedSubmitBlocked" @click="submitSurvey">
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
                      :disabled="selectedSubmitBlocked"
                    >
                      <el-radio
                        v-for="option in question.options"
                        :key="option.id"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </el-radio>
                    </el-radio-group>

                    <el-checkbox-group
                      v-else-if="question.type === 'multiple'"
                      v-model="answerState[question.id].multiValues"
                      :disabled="selectedSubmitBlocked"
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
                      :disabled="selectedSubmitBlocked"
                      :placeholder="question.placeholder || '请输入你的回答'"
                    />

                    <div v-else-if="question.type === 'matrix'" class="matrix-answer">
                      <div v-for="row in question.rows" :key="row.id" class="matrix-answer__row">
                        <div class="matrix-answer__label">{{ row.label }}</div>
                        <el-radio-group
                          v-model="answerState[question.id].matrix[row.id]"
                          :disabled="selectedSubmitBlocked"
                        >
                          <el-radio
                            v-for="column in question.columns"
                            :key="column.id"
                            :value="column.value"
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
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { useSurveyFillWorkbench } from './SurveyFillWorkbench.logic';

const {
  activeTab,
  surveyCards,
  selectedSurveyId,
  selectedSurvey,
  answerState,
  statsSurveyId,
  statsOverview,
  questionStats,
  responseRows,
  detailVisible,
  responseDetail,
  isAdmin,
  publishedSurveys,
  selectedEntry,
  selectedSubmitBlocked,
  roleLabel,
  pageTitle,
  breadcrumbs,
  pageDescription,
  submittedCount,
  pendingCount,
  answeredCount,
  completionRate,
  questionTypeLabel,
  typeLabel,
  audienceLabel,
  selectSurvey,
  submitSurvey,
  loadStats,
  openResponseDetail,
  formatAnswer,
  downloadCsv,
  formatDateTime
} = useSurveyFillWorkbench();
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
