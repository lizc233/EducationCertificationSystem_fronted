<template>
  <StandardPage
    title="问卷设计与发布"
    :breadcrumbs="['首页', '问卷与改进', '问卷设计与发布']"
    description="管理员可在当前页面完成问卷类型配置、题型编排、题目数量控制、发布设置与预览检查。"
  >
    <template #actions>
      <el-button @click="restoreSeeds">刷新数据</el-button>
      <el-button @click="duplicateCurrent" :disabled="!editor.id">另存副本</el-button>
      <el-button @click="openPreview">预览</el-button>
      <el-button type="primary" @click="saveCurrent">保存问卷</el-button>
    </template>

    <div class="survey-dashboard">
      <article class="survey-dashboard__card">
        <span>问卷总数</span>
        <strong>{{ summary.total }}</strong>
        <small>覆盖课程评价、教学反馈与毕业跟踪</small>
      </article>
      <article class="survey-dashboard__card">
        <span>已发布</span>
        <strong>{{ summary.published }}</strong>
        <small>当前对师生可见的在线问卷批次</small>
      </article>
      <article class="survey-dashboard__card">
        <span>草稿中</span>
        <strong>{{ summary.draft }}</strong>
        <small>待补题目或待安排发布时间</small>
      </article>
      <article class="survey-dashboard__card">
        <span>累计答卷</span>
        <strong>{{ summary.responses }}</strong>
        <small>系统中已回收的答卷数量</small>
      </article>
    </div>

    <div class="survey-workbench">
      <SectionCard title="问卷库">
        <template #extra>
          <el-button type="primary" link @click="createSurvey">新建问卷</el-button>
        </template>

        <div class="status-filter">
          <button
            v-for="item in statusFilters"
            :key="item.value"
            type="button"
            class="status-filter__chip"
            :class="{ 'is-active': activeStatus === item.value }"
            @click="activeStatus = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="survey-library soft-scrollbar">
          <button
            v-for="item in filteredSurveys"
            :key="item.id"
            type="button"
            class="survey-library__item"
            :class="{ 'is-active': item.id === editor.id }"
            @click="selectSurvey(item.id)"
          >
            <div class="survey-library__top">
              <div>
                <div class="survey-library__title">{{ item.title }}</div>
                <div class="survey-library__code">{{ item.code }}</div>
              </div>
              <el-tag :type="statusTagType(item.status)">{{ statusLabel(item.status) }}</el-tag>
            </div>
            <div class="survey-library__meta">
              <span>{{ typeLabel(item.surveyType) }}</span>
              <span>{{ audienceLabel(item.audienceRole) }}</span>
              <span>{{ item.questions.length }} 题</span>
            </div>
            <div class="survey-library__desc">
              {{ item.scene }} · {{ formatDateTime(item.updatedAt) }}
            </div>
          </button>
          <el-empty v-if="!filteredSurveys.length" description="当前筛选条件下暂无问卷" />
        </div>
      </SectionCard>

      <SectionCard title="设计画布" class="canvas-card">
        <template #extra>
          <div class="canvas-headline">
            <span>{{ questionSummaryText }}</span>
            <el-button type="danger" link @click="removeCurrent" :disabled="!editor.id">删除</el-button>
          </div>
        </template>

        <div class="survey-meta-grid">
          <el-form-item label="问卷标题">
            <el-input v-model="editor.title" placeholder="例如：2026 春季课程教学反馈" />
          </el-form-item>
          <el-form-item label="问卷编码">
            <el-input v-model="editor.code" placeholder="自动生成后也可手工调整" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model="editor.subtitle" placeholder="用于说明本次问卷目的与使用场景" />
          </el-form-item>
          <el-form-item label="问卷类型">
            <el-select v-model="editor.surveyType">
              <el-option
                v-for="item in surveyTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="面向对象">
            <el-select v-model="editor.audienceRole">
              <el-option
                v-for="item in audienceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="场景标签">
            <el-input v-model="editor.scene" placeholder="例如：课程结课反馈" />
          </el-form-item>
        </div>

        <el-form-item label="问卷说明">
          <el-input
            v-model="editor.description"
            type="textarea"
            :rows="3"
            placeholder="说明填写对象、用途、匿名策略与发布时间要求"
          />
        </el-form-item>

        <div class="tag-editor">
          <div class="tag-editor__list">
            <el-tag v-for="tag in editor.tags" :key="tag" closable @close="removeTag(tag)">
              {{ tag }}
            </el-tag>
          </div>
          <div class="tag-editor__input">
            <el-input v-model="tagInput" placeholder="添加标签，例如：教师、匿名、课程反馈" @keyup.enter="appendTag" />
            <el-button @click="appendTag">添加标签</el-button>
          </div>
        </div>

        <div class="question-plan">
          <div class="question-plan__head">
            <div>
              <strong>题目数量设置</strong>
              <p>管理员可直接指定当前问卷题数，系统会自动补齐或截断，单份问卷上限 50 题。</p>
            </div>
            <el-tag type="info">当前 {{ editor.questions.length }} / {{ maxQuestionCount }}</el-tag>
          </div>
          <div class="question-plan__controls">
            <el-input-number
              v-model="editor.questionTargetCount"
              :min="1"
              :max="maxQuestionCount"
              :step="1"
              controls-position="right"
            />
            <el-button type="primary" @click="applyQuestionCount">应用题数</el-button>
          </div>
        </div>

        <div class="question-bank">
          <div class="question-bank__title">题型面板</div>
          <div class="question-bank__grid">
            <button
              v-for="item in questionTypeOptions"
              :key="item.value"
              type="button"
              class="question-bank__button"
              @click="appendQuestion(item.value)"
            >
              <strong>{{ item.label }}</strong>
              <span>加入当前问卷</span>
            </button>
          </div>
        </div>

        <div class="question-canvas">
          <article
            v-for="(question, index) in editor.questions"
            :key="question.id"
            class="question-card"
            :class="{ 'is-selected': selectedQuestionId === question.id }"
            @click="selectedQuestionId = question.id"
          >
            <div class="question-card__header">
              <div>
                <span class="question-card__index">第 {{ index + 1 }} 题</span>
                <el-tag size="small">{{ questionTypeLabel(question.type) }}</el-tag>
              </div>
              <div class="question-card__actions">
                <el-button link @click.stop="moveQuestion(index, -1)" :disabled="index === 0">上移</el-button>
                <el-button link @click.stop="moveQuestion(index, 1)" :disabled="index === editor.questions.length - 1">下移</el-button>
                <el-button type="danger" link @click.stop="removeQuestion(index)">删除</el-button>
              </div>
            </div>

            <div class="question-card__body">
              <el-input v-model="question.title" placeholder="请输入题目标题" />
              <el-input v-model="question.description" placeholder="补充描述，可选" />
              <div class="question-card__grid">
                <el-input v-model="question.code" placeholder="题目编码" />
                <el-switch v-model="question.required" active-text="必答" inactive-text="选答" />
              </div>

              <div v-if="['single', 'multiple', 'rating'].includes(question.type)" class="question-subsection">
                <div class="question-subsection__head">
                  <span>选项设置</span>
                  <el-button type="primary" link @click.stop="appendOption(question)">新增选项</el-button>
                </div>
                <div v-for="(option, optionIndex) in question.options" :key="option.id" class="option-row">
                  <el-input v-model="option.label" :placeholder="`选项 ${optionIndex + 1}`" />
                  <el-input v-model="option.value" placeholder="提交值" />
                  <el-input-number v-model="option.score" :min="0" :max="10" />
                  <el-button type="danger" link @click.stop="removeOption(question, optionIndex)">删除</el-button>
                </div>
              </div>

              <div v-if="question.type === 'text'" class="question-subsection">
                <div class="question-subsection__head">
                  <span>填写提示</span>
                </div>
                <el-input v-model="question.placeholder" placeholder="例如：请结合课堂案例填写你的建议" />
              </div>

              <div v-if="question.type === 'matrix'" class="matrix-editor">
                <div class="question-subsection">
                  <div class="question-subsection__head">
                    <span>矩阵行</span>
                    <el-button type="primary" link @click.stop="appendMatrixRow(question)">新增行</el-button>
                  </div>
                  <div v-for="(row, rowIndex) in question.rows" :key="row.id" class="option-row">
                    <el-input v-model="row.label" :placeholder="`行 ${rowIndex + 1}`" />
                    <el-input-number v-model="row.sortNo" :min="1" />
                    <el-button type="danger" link @click.stop="removeMatrixRow(question, rowIndex)">删除</el-button>
                  </div>
                </div>

                <div class="question-subsection">
                  <div class="question-subsection__head">
                    <span>矩阵列</span>
                    <el-button type="primary" link @click.stop="appendMatrixColumn(question)">新增列</el-button>
                  </div>
                  <div v-for="(column, columnIndex) in question.columns" :key="column.id" class="option-row">
                    <el-input v-model="column.label" :placeholder="`列 ${columnIndex + 1}`" />
                    <el-input v-model="column.value" placeholder="值" />
                    <el-button type="danger" link @click.stop="removeMatrixColumn(question, columnIndex)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </SectionCard>

      <div class="right-stack">
        <SectionCard title="发布控制台">
          <div class="publish-panel">
            <div class="publish-panel__hero" :style="{ '--survey-color': editor.coverColor || '#1f4f5c' }">
              <span>{{ statusLabel(editor.status) }}</span>
              <strong>{{ editor.title || '未命名问卷' }}</strong>
              <small>{{ audienceLabel(editor.audienceRole) }} · {{ typeLabel(editor.surveyType) }}</small>
            </div>

            <div class="publish-panel__facts">
              <div class="publish-fact">
                <span>面向对象</span>
                <strong>{{ audienceLabel(editor.audienceRole) }}</strong>
              </div>
              <div class="publish-fact">
                <span>问卷类型</span>
                <strong>{{ typeLabel(editor.surveyType) }}</strong>
              </div>
              <div class="publish-fact">
                <span>题目数量</span>
                <strong>{{ editor.questions.length }}</strong>
              </div>
              <div class="publish-fact">
                <span>提交方式</span>
                <strong>{{ editor.anonymous ? '匿名提交' : '实名提交' }}</strong>
              </div>
            </div>

            <div class="publish-panel__section">
              <div class="publish-panel__section-title">时间安排</div>
              <div class="publish-panel__grid">
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="editor.startTime"
                    type="datetime"
                    value-format="YYYY-MM-DDTHH:mm"
                    placeholder="不填则发布后立即生效"
                    style="width: 100%;"
                  />
                </el-form-item>
                <el-form-item label="截止时间">
                  <el-date-picker
                    v-model="editor.deadline"
                    type="datetime"
                    value-format="YYYY-MM-DDTHH:mm"
                    placeholder="设置回收截止时间"
                    style="width: 100%;"
                  />
                </el-form-item>
              </div>
            </div>

            <div class="publish-panel__section">
              <div class="publish-panel__section-title">发布设置</div>
              <div class="publish-panel__grid publish-panel__grid--meta">
                <el-form-item label="目标回收份数">
                  <el-input-number v-model="editor.expectedCount" :min="1" :step="10" style="width: 100%;" />
                </el-form-item>

                <div class="publish-panel__color-field">
                  <span class="publish-panel__color-label">封面主色</span>
                  <div class="publish-panel__color-control">
                    <el-color-picker v-model="editor.coverColor" show-alpha />
                    <span class="publish-panel__color-value">{{ editor.coverColor || '#1f4f5c' }}</span>
                  </div>
                </div>
              </div>

              <el-form-item label="发布说明">
                <el-input
                  v-model="editor.channel"
                  placeholder="例如：站内通知、班群提醒、线下通知"
                />
              </el-form-item>
            </div>

            <div class="publish-panel__notice">
              发布后问卷会出现在填写页面中；如果没有设置开始时间，则会在发布后立即生效。
            </div>

            <div class="publish-actions">
              <el-button type="primary" @click="openPublishDialog">发布问卷</el-button>
              <el-button type="warning" plain @click="closeCurrentSurvey" :disabled="editor.status !== 'PUBLISHED'">
                结束回收
              </el-button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="设计摘要">
          <div class="summary-list">
            <div class="summary-item">
              <span>题目数量</span>
              <strong>{{ editor.questions.length }}</strong>
            </div>
            <div class="summary-item">
              <span>题型分布</span>
              <strong>{{ questionSummaryText }}</strong>
            </div>
            <div class="summary-item">
              <span>匿名策略</span>
              <strong>{{ editor.anonymous ? '匿名提交' : '实名提交' }}</strong>
            </div>
            <div class="summary-item">
              <span>最近更新时间</span>
              <strong>{{ formatDateTime(editor.updatedAt) }}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="题目属性">
          <div v-if="selectedQuestion" class="inspector-panel">
            <div class="inspector-panel__heading">
              <strong>{{ selectedQuestion.code }}</strong>
              <span>{{ questionTypeLabel(selectedQuestion.type) }}</span>
            </div>
            <el-form-item label="最少选择">
              <el-input-number
                v-model="selectedQuestion.minSelect"
                :min="0"
                :max="selectedQuestion.options?.length || 1"
                style="width: 100%;"
                :disabled="selectedQuestion.type !== 'multiple'"
              />
            </el-form-item>
            <el-form-item label="最多选择">
              <el-input-number
                v-model="selectedQuestion.maxSelect"
                :min="1"
                :max="selectedQuestion.options?.length || 1"
                style="width: 100%;"
                :disabled="selectedQuestion.type !== 'multiple'"
              />
            </el-form-item>
            <el-form-item label="填写提示">
              <el-input
                v-model="selectedQuestion.placeholder"
                placeholder="仅填空题展示"
                :disabled="selectedQuestion.type !== 'text'"
              />
            </el-form-item>
          </div>
          <el-empty v-else description="点击中间题卡后可在这里调整题目属性" />
        </SectionCard>
      </div>
    </div>

    <el-dialog v-model="previewVisible" title="问卷预览" width="860px">
      <div class="preview-shell">
        <div class="preview-shell__header" :style="{ '--survey-color': editor.coverColor || '#1f4f5c' }">
          <span>{{ typeLabel(editor.surveyType) }}</span>
          <h3>{{ editor.title }}</h3>
          <p>{{ editor.subtitle }}</p>
        </div>
        <div class="preview-shell__list">
          <article v-for="question in editor.questions" :key="question.id" class="preview-question">
            <div class="preview-question__title">
              {{ question.sortNo }}. {{ question.title }}
              <span v-if="question.required" class="preview-question__required">*</span>
            </div>
            <p v-if="question.description" class="preview-question__desc">{{ question.description }}</p>
            <ul v-if="question.options?.length" class="preview-option-list">
              <li v-for="option in question.options" :key="option.id">{{ option.label }}</li>
            </ul>
            <div v-if="question.type === 'text'" class="preview-input">
              {{ question.placeholder || '填写回答' }}
            </div>
            <div v-if="question.type === 'matrix'" class="preview-matrix">
              {{ question.rows.length }} 行 × {{ question.columns.length }} 列
            </div>
          </article>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="publishVisible" title="发布确认" width="520px">
      <el-alert
        title="发布后，教师或学生页面将按面向对象显示当前问卷。"
        type="info"
        :closable="false"
        show-icon
      />
      <div class="publish-dialog">
        <div class="publish-dialog__row">
          <span>问卷</span>
          <strong>{{ editor.title }}</strong>
        </div>
        <div class="publish-dialog__row">
          <span>对象</span>
          <strong>{{ audienceLabel(editor.audienceRole) }}</strong>
        </div>
        <div class="publish-dialog__row">
          <span>截止时间</span>
          <strong>{{ formatDateTime(editor.deadline) }}</strong>
        </div>
        <div class="publish-dialog__row">
          <span>目标回收份数</span>
          <strong>{{ editor.expectedCount || '未设置' }}</strong>
        </div>
      </div>
      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" @click="publishCurrent">确认发布</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { useSurveyManagementWorkbenchAdmin } from './SurveyManagementWorkbenchAdmin.logic';

const {
  surveyTypeOptions,
  audienceOptions,
  questionTypeOptions,
  maxQuestionCount,
  statusFilters,
  activeStatus,
  selectedQuestionId,
  previewVisible,
  publishVisible,
  tagInput,
  editor,
  filteredSurveys,
  summary,
  selectedQuestion,
  questionSummaryText,
  statusLabel,
  statusTagType,
  questionTypeLabel,
  typeLabel,
  audienceLabel,
  createSurvey,
  selectSurvey,
  saveCurrent,
  duplicateCurrent,
  removeCurrent,
  appendQuestion,
  applyQuestionCount,
  moveQuestion,
  removeQuestion,
  appendOption,
  removeOption,
  appendMatrixRow,
  removeMatrixRow,
  appendMatrixColumn,
  removeMatrixColumn,
  appendTag,
  removeTag,
  openPreview,
  openPublishDialog,
  publishCurrent,
  closeCurrentSurvey,
  restoreSeeds,
  formatDateTime
} = useSurveyManagementWorkbenchAdmin();
</script>

<style scoped>
.survey-dashboard {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.survey-dashboard__card {
  padding: 18px 20px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 252, 0.98));
  box-shadow: 0 14px 34px rgba(34, 58, 76, 0.06);
}

.survey-dashboard__card span,
.survey-dashboard__card small {
  display: block;
  color: var(--text-light);
}

.survey-dashboard__card strong {
  display: block;
  margin: 10px 0 8px;
  font-size: 34px;
  color: #173f4c;
  font-family: var(--font-serif);
}

.survey-workbench {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 340px;
  gap: 20px;
}

.status-filter,
.tag-editor__list,
.publish-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.status-filter {
  margin-bottom: 16px;
}

.status-filter__chip,
.question-bank__button,
.survey-library__item {
  border: 0;
  cursor: pointer;
}

.status-filter__chip {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(29, 79, 92, 0.08);
  color: var(--text-secondary);
}

.status-filter__chip.is-active {
  background: #1f4f5c;
  color: #fff;
}

.survey-library {
  display: grid;
  gap: 12px;
  max-height: 860px;
  overflow: auto;
}

.survey-library__item {
  width: 100%;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff, #fbf8f4);
  border: 1px solid rgba(231, 223, 213, 0.92);
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.survey-library__item:hover,
.survey-library__item.is-active {
  transform: translateY(-2px);
  border-color: rgba(31, 79, 92, 0.28);
  box-shadow: 0 14px 28px rgba(34, 58, 76, 0.08);
}

.survey-library__top,
.question-card__header,
.question-subsection__head,
.canvas-headline,
.publish-dialog__row,
.inspector-panel__heading,
.question-plan__head,
.question-plan__controls {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.survey-library__title,
.question-bank__button strong {
  font-weight: 600;
  color: var(--text-primary);
}

.survey-library__code,
.survey-library__desc,
.publish-panel__hero small,
.question-bank__button span,
.question-plan__head p {
  font-size: 13px;
  color: var(--text-light);
}

.survey-library__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.canvas-card,
.right-stack {
  display: grid;
  gap: 18px;
}

.survey-meta-grid,
.question-card__grid,
.publish-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.tag-editor,
.question-plan,
.question-bank,
.question-canvas,
.publish-panel,
.summary-list,
.inspector-panel,
.preview-shell,
.preview-shell__list,
.matrix-editor,
.question-subsection {
  display: grid;
  gap: 14px;
}

.tag-editor__input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.question-plan {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(31, 79, 92, 0.12);
  background: linear-gradient(180deg, rgba(244, 248, 250, 0.96), rgba(255, 255, 255, 0.98));
}

.question-plan__head p {
  margin: 6px 0 0;
}

.question-bank {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(24, 83, 96, 0.08), rgba(24, 83, 96, 0.03));
}

.question-bank__title {
  font-weight: 600;
}

.question-bank__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.question-bank__button {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  text-align: left;
}

.question-card {
  padding: 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff, #f8fbfc);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.question-card.is-selected {
  border-color: rgba(31, 79, 92, 0.32);
  box-shadow: 0 16px 30px rgba(34, 58, 76, 0.08);
}

.question-card__index {
  margin-right: 10px;
  font-weight: 600;
}

.question-card__actions {
  display: flex;
  gap: 6px;
}

.question-card__body,
.preview-question {
  display: grid;
  gap: 12px;
}

.option-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px 100px auto;
  gap: 10px;
  align-items: center;
}

.matrix-editor {
  grid-template-columns: 1fr;
}

.publish-panel__hero,
.preview-shell__header {
  padding: 18px;
  border-radius: 18px;
  color: #fff;
  background:
    linear-gradient(135deg, var(--survey-color) 0%, color-mix(in srgb, var(--survey-color) 76%, white) 100%);
}

.publish-panel__hero span,
.preview-shell__header span {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.8;
}

.publish-panel__hero strong,
.preview-shell__header h3 {
  display: block;
  margin: 10px 0 6px;
  font-size: 24px;
}

.publish-panel__section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(31, 79, 92, 0.04);
  border: 1px solid rgba(31, 79, 92, 0.08);
}

.publish-panel__section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.publish-panel .publish-panel__grid {
  grid-template-columns: 1fr;
}

.publish-panel__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.publish-fact {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(31, 79, 92, 0.08);
}

.publish-fact span,
.publish-panel__notice,
.publish-panel__color-label,
.publish-panel__color-value {
  font-size: 13px;
  color: var(--text-light);
}

.publish-fact strong {
  display: block;
  margin-top: 8px;
  color: var(--text-primary);
}

.publish-panel__grid--meta {
  align-items: stretch;
}

.publish-panel__color-field {
  display: grid;
  gap: 10px;
  padding: 4px 0 0;
}

.publish-panel__color-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(31, 79, 92, 0.08);
}

.publish-panel__color-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.publish-panel__notice {
  line-height: 1.6;
  padding: 0 4px;
}

.publish-panel :deep(.el-form-item) {
  margin-bottom: 0;
}

.publish-panel :deep(.el-input-number) {
  width: 100%;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(31, 79, 92, 0.06);
}

.summary-item span {
  display: block;
  color: var(--text-light);
  font-size: 12px;
}

.summary-item strong {
  display: block;
  margin-top: 8px;
  color: var(--text-primary);
}

.preview-question {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.9);
  border-radius: 16px;
}

.preview-question__title {
  font-weight: 600;
}

.preview-question__required {
  color: #c53030;
}

.preview-question__desc,
.preview-matrix {
  color: var(--text-secondary);
}

.preview-option-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
}

.preview-input {
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed rgba(31, 79, 92, 0.28);
  color: var(--text-light);
}

.publish-dialog {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

@media (max-width: 1460px) {
  .survey-workbench {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1100px) {
  .survey-dashboard,
  .survey-meta-grid,
  .question-card__grid,
  .publish-panel__grid,
  .publish-panel__facts,
  .question-bank__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .question-plan__head,
  .question-plan__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .tag-editor__input,
  .option-row {
    grid-template-columns: 1fr;
  }
}
</style>
