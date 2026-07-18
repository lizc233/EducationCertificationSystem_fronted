<template>
  <StandardPage
    title="问卷设计与发布"
    :breadcrumbs="['首页', '问卷与改进', '问卷设计与发布']"
    description="维护问卷模板、发布范围、异步推送任务与题目结构，替换原有示例页，直接对接 F21 后端接口。"
  >
    <template #actions>
      <el-button type="primary" @click="startCreate">新建问卷</el-button>
      <el-button :loading="loading.page" @click="loadPage">刷新列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="发布状态">
          <el-select v-model="filters.publishStatus" clearable placeholder="全部状态" style="width: 180px;">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="发布中" value="PUBLISHING" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="发布失败" value="PUBLISH_FAILED" />
            <el-option label="已撤回" value="REVOKED" />
            <el-option label="已结束" value="ENDED" />
          </el-select>
        </el-form-item>
        <el-form-item label="问卷类型">
          <el-input v-model.trim="filters.questionnaireType" clearable placeholder="如 COURSE_EVAL" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="目标对象">
          <el-select v-model="filters.targetObjectType" clearable placeholder="全部对象" style="width: 180px;">
            <el-option label="在校生" value="IN_SCHOOL_STUDENT" />
            <el-option label="学生" value="STUDENT" />
            <el-option label="毕业生" value="GRADUATE" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="用人单位" value="EMPLOYER" />
            <el-option label="全部" value="ALL" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 标题" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="loadPage">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="survey-shell">
      <SectionCard title="问卷清单">
        <div v-loading="loading.page" class="survey-list soft-scrollbar">
          <button
            v-for="item in questionnaires"
            :key="item.id"
            type="button"
            class="survey-list-item"
            :class="{ 'is-active': item.id === activeId }"
            @click="selectQuestionnaire(item.id)"
          >
            <div class="survey-list-item__head">
              <div>
                <div class="survey-list-item__title">{{ item.title }}</div>
                <div class="survey-list-item__code">{{ item.questionnaireCode }}</div>
              </div>
              <el-tag :type="statusTagType(item.publishStatus)">{{ item.publishStatus || 'DRAFT' }}</el-tag>
            </div>
            <div class="survey-list-item__meta">
              <span class="small-tag">{{ item.targetObjectType || '-' }}</span>
              <span class="small-tag">{{ item.questionnaireType || '-' }}</span>
              <span class="small-tag">{{ item.questionCount || 0 }} 题</span>
            </div>
            <div class="survey-list-item__desc">
              范围 {{ item.scopeCount || 0 }} 个，MQ {{ item.mqStatus || 'NONE' }}，
              最新批次 {{ item.latestPublishBatchNo || '-' }}
            </div>
          </button>
          <el-empty v-if="!loading.page && !questionnaires.length" description="暂无问卷数据" />
        </div>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadPage"
            @size-change="loadPage"
          />
        </div>
      </SectionCard>

      <SectionCard :title="form.id ? '问卷维护' : '新建问卷'" class="survey-editor">
        <template #extra>
          <el-button-group v-if="form.id">
            <el-button @click="handlePreview">预览</el-button>
            <el-button type="primary" @click="saveQuestionnaire" :loading="loading.save">保存</el-button>
          </el-button-group>
        </template>

        <el-form label-position="top">
          <div class="survey-form-grid">
            <el-form-item label="问卷编码">
              <el-input v-model.trim="form.questionnaireCode" placeholder="如 SURVEY-2026-001" />
            </el-form-item>
            <el-form-item label="问卷标题">
              <el-input v-model.trim="form.title" placeholder="请输入问卷标题" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model.trim="form.subtitle" placeholder="可选副标题" />
            </el-form-item>
            <el-form-item label="问卷类型">
              <el-input v-model.trim="form.questionnaireType" placeholder="如 COURSE_EVAL" />
            </el-form-item>
            <el-form-item label="目标对象">
              <el-select v-model="form.targetObjectType" placeholder="请选择对象">
                <el-option label="在校生" value="IN_SCHOOL_STUDENT" />
                <el-option label="学生" value="STUDENT" />
                <el-option label="毕业生" value="GRADUATE" />
                <el-option label="教师" value="TEACHER" />
                <el-option label="用人单位" value="EMPLOYER" />
                <el-option label="全部" value="ALL" />
              </el-select>
            </el-form-item>
            <el-form-item label="目标对象ID">
              <el-input-number v-model="form.targetObjectId" :min="1" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="匿名填写">
              <el-switch v-model="form.anonymousFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                placeholder="请选择开始时间"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                placeholder="请选择结束时间"
                style="width: 100%;"
              />
            </el-form-item>
          </div>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="补充说明" />
          </el-form-item>
        </el-form>

        <div class="editor-block">
          <div class="editor-block__head">
            <h4>发放范围</h4>
            <el-button type="primary" link @click="addScope">新增范围</el-button>
          </div>
          <div class="scope-list">
            <div v-for="(scope, index) in form.scopes" :key="scope.key" class="scope-row">
              <el-select v-model="scope.scopeType" placeholder="范围类型" style="width: 160px;">
                <el-option label="角色" value="ROLE" />
                <el-option label="年级" value="GRADE" />
                <el-option label="班级" value="CLASS" />
                <el-option label="专业" value="MAJOR" />
                <el-option label="用户" value="USER" />
              </el-select>
              <el-select
                v-if="['GRADE', 'CLASS', 'MAJOR'].includes(scope.scopeType)"
                v-model="scope.scopeId"
                filterable
                placeholder="选择范围对象"
                style="width: 240px;"
              >
                <el-option
                  v-for="option in resolveScopeOptions(scope.scopeType)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-input-number
                v-else
                v-model="scope.scopeId"
                :min="1"
                :step="1"
                placeholder="输入 ID"
                style="width: 240px;"
              />
              <el-input v-model.trim="scope.remark" placeholder="范围备注" />
              <el-button type="danger" link @click="removeScope(index)">删除</el-button>
            </div>
            <el-empty v-if="!form.scopes.length" description="未配置发放范围" />
          </div>
        </div>

        <div class="editor-block">
          <div class="editor-block__head">
            <h4>题目结构</h4>
            <el-button type="primary" link @click="addQuestion">新增题目</el-button>
          </div>
          <div v-if="form.questions.length" class="question-list">
            <article v-for="(question, index) in form.questions" :key="question.key" class="question-card">
              <div class="question-card__head">
                <div class="question-card__title">第 {{ index + 1 }} 题</div>
                <div class="question-card__actions">
                  <el-tag>{{ question.questionType }}</el-tag>
                  <el-button type="danger" link @click="removeQuestion(index)">删除</el-button>
                </div>
              </div>
              <div class="question-grid">
                <el-input v-model.trim="question.questionCode" placeholder="题目编码" />
                <el-select v-model="question.questionType" placeholder="题型">
                  <el-option label="单选" value="SINGLE" />
                  <el-option label="多选" value="MULTIPLE" />
                  <el-option label="量表" value="SCALE" />
                  <el-option label="填空" value="TEXT" />
                  <el-option label="矩阵" value="MATRIX" />
                </el-select>
                <el-input-number v-model="question.sortNo" :min="1" :step="1" style="width: 100%;" />
                <el-switch v-model="question.isRequired" :active-value="1" :inactive-value="0" />
              </div>
              <el-input
                v-model.trim="question.questionText"
                type="textarea"
                :rows="2"
                placeholder="请输入题干"
                style="margin-top: 12px;"
              />

              <div v-if="['SINGLE', 'MULTIPLE', 'SCALE'].includes(question.questionType)" class="question-subsection">
                <div class="question-subsection__head">
                  <span>选项</span>
                  <el-button type="primary" link @click="addOption(question)">新增选项</el-button>
                </div>
                <div v-for="(option, optionIndex) in question.options" :key="option.key" class="question-option-row">
                  <el-input v-model.trim="option.optionCode" placeholder="编码" />
                  <el-input v-model.trim="option.optionText" placeholder="选项文本" />
                  <el-input v-model.trim="option.optionValue" placeholder="提交值" />
                  <el-input-number v-model="option.optionScore" :step="1" :precision="2" style="width: 110px;" />
                  <el-button type="danger" link @click="removeOption(question, optionIndex)">删除</el-button>
                </div>
              </div>

              <div v-if="question.questionType === 'MATRIX'" class="matrix-shell">
                <div class="question-subsection">
                  <div class="question-subsection__head">
                    <span>矩阵行</span>
                    <el-button type="primary" link @click="addMatrixRow(question)">新增行</el-button>
                  </div>
                  <div v-for="(row, rowIndex) in question.matrixRows" :key="row.key" class="question-option-row">
                    <el-input v-model.trim="row.rowCode" placeholder="行编码" />
                    <el-input v-model.trim="row.rowText" placeholder="行标题" />
                    <el-input-number v-model="row.sortNo" :min="1" :step="1" style="width: 110px;" />
                    <el-button type="danger" link @click="removeMatrixRow(question, rowIndex)">删除</el-button>
                  </div>
                </div>
                <div class="question-subsection">
                  <div class="question-subsection__head">
                    <span>矩阵列</span>
                    <el-button type="primary" link @click="addMatrixColumn(question)">新增列</el-button>
                  </div>
                  <div v-for="(column, columnIndex) in question.matrixColumns" :key="column.key" class="question-option-row">
                    <el-input v-model.trim="column.colCode" placeholder="列编码" />
                    <el-input v-model.trim="column.colText" placeholder="列标题" />
                    <el-input v-model.trim="column.colValue" placeholder="列值" />
                    <el-button type="danger" link @click="removeMatrixColumn(question, columnIndex)">删除</el-button>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <el-empty v-else description="尚未添加题目" />
        </div>

        <div class="editor-actions">
          <el-button type="primary" :loading="loading.save" @click="saveQuestionnaire">保存问卷</el-button>
          <el-button v-if="form.id" :loading="loading.publish" @click="handlePublish">发布</el-button>
          <el-button v-if="form.id" :loading="loading.publish" @click="handleRetryPublish">重推发布</el-button>
          <el-button v-if="form.id" :loading="loading.publish" @click="handleDeadlineReminder">截止提醒</el-button>
          <el-button v-if="form.id" type="warning" plain :loading="loading.publish" @click="handleRevoke">撤回</el-button>
          <el-button v-if="form.id" type="danger" plain :loading="loading.publish" @click="handleEnd">结束</el-button>
          <el-button v-if="form.id" type="danger" plain :loading="loading.delete" @click="handleDelete">删除</el-button>
        </div>
      </SectionCard>

      <SectionCard title="发布任务与预览">
        <div class="publish-kpis">
          <article class="publish-kpi">
            <div class="publish-kpi__label">当前状态</div>
            <div class="publish-kpi__value">{{ detail?.publishStatus || form.publishStatus || 'DRAFT' }}</div>
          </article>
          <article class="publish-kpi">
            <div class="publish-kpi__label">MQ 状态</div>
            <div class="publish-kpi__value">{{ detail?.mqStatus || 'NONE' }}</div>
          </article>
          <article class="publish-kpi">
            <div class="publish-kpi__label">题目数</div>
            <div class="publish-kpi__value">{{ form.questions.length }}</div>
          </article>
        </div>

        <el-table v-loading="loading.tasks" :data="publishTasks" border stripe style="margin-top: 18px;">
          <el-table-column prop="batchNo" label="批次号" min-width="160" />
          <el-table-column prop="taskAction" label="动作" min-width="100" />
          <el-table-column prop="publishStatus" label="任务状态" min-width="120" />
          <el-table-column prop="mqStatus" label="MQ 状态" min-width="120" />
          <el-table-column prop="targetCount" label="目标人数" min-width="100" />
          <el-table-column prop="successCount" label="成功数" min-width="100" />
          <el-table-column prop="failedCount" label="失败数" min-width="100" />
          <el-table-column prop="createdAt" label="创建时间" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>

    <el-dialog v-model="previewVisible" title="问卷预览" width="860px">
      <div v-if="previewDetail">
        <h3 style="margin: 0 0 6px;">{{ previewDetail.title }}</h3>
        <p style="margin: 0 0 18px; color: var(--text-secondary);">{{ previewDetail.subtitle || '无副标题' }}</p>
        <div class="preview-question" v-for="question in previewDetail.questions || []" :key="question.id || question.questionCode">
          <div class="preview-question__title">
            {{ question.sortNo }}. {{ question.questionText }}
            <span v-if="question.isRequired === 1" class="preview-required">*</span>
          </div>
          <ul v-if="question.options?.length" class="preview-option-list">
            <li v-for="option in question.options" :key="option.id || option.optionCode">{{ option.optionText }}</li>
          </ul>
          <div v-if="question.matrixRows?.length && question.matrixColumns?.length" class="preview-matrix">
            {{ question.matrixRows.length }} 行 × {{ question.matrixColumns.length }} 列
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无预览数据" />
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fetchClasses, fetchGrades, fetchMajors } from '../../api/lookups';
import {
  createSurveyQuestionnaire,
  deleteSurveyQuestionnaire,
  endSurveyQuestionnaire,
  fetchSurveyPublishTasks,
  fetchSurveyQuestionnaireDetail,
  fetchSurveyQuestionnaires,
  previewSurveyQuestionnaire,
  publishSurveyQuestionnaire,
  remindSurveyQuestionnaire,
  retryPublishSurveyQuestionnaire,
  revokeSurveyQuestionnaire,
  updateSurveyQuestionnaire
} from '../../api/survey';

const loading = reactive({
  page: false,
  save: false,
  publish: false,
  delete: false,
  tasks: false
});

const filters = reactive({
  publishStatus: '',
  questionnaireType: '',
  targetObjectType: '',
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
});

const questionnaires = ref([]);
const activeId = ref(null);
const detail = ref(null);
const publishTasks = ref([]);
const previewVisible = ref(false);
const previewDetail = ref(null);
const gradeOptions = ref([]);
const classOptions = ref([]);
const majorOptions = ref([]);

function nextKey(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function createScope() {
  return {
    key: nextKey('scope'),
    scopeType: 'GRADE',
    scopeId: null,
    remark: ''
  };
}

function createOption(index = 1) {
  return {
    key: nextKey('option'),
    optionCode: `OPT_${index}`,
    optionText: '',
    optionValue: String(index),
    optionScore: index,
    isOther: 0,
    sortNo: index,
    remark: ''
  };
}

function createMatrixRow(index = 1) {
  return {
    key: nextKey('row'),
    rowCode: `ROW_${index}`,
    rowText: '',
    sortNo: index,
    remark: ''
  };
}

function createMatrixColumn(index = 1) {
  return {
    key: nextKey('col'),
    colCode: `COL_${index}`,
    colText: '',
    colValue: String(index),
    sortNo: index,
    remark: ''
  };
}

function createQuestion(index = 1) {
  return {
    key: nextKey('question'),
    questionCode: `Q${index}`,
    questionText: '',
    questionType: 'SINGLE',
    isRequired: 1,
    sortNo: index,
    minSelect: 1,
    maxSelect: 1,
    scoreWeight: 1,
    matrixType: '',
    remark: '',
    options: [createOption(1), createOption(2)],
    matrixRows: [createMatrixRow(1)],
    matrixColumns: [createMatrixColumn(1), createMatrixColumn(2)]
  };
}

function createForm() {
  return {
    id: null,
    questionnaireCode: '',
    title: '',
    subtitle: '',
    questionnaireType: '',
    targetObjectType: 'IN_SCHOOL_STUDENT',
    targetObjectId: null,
    anonymousFlag: 0,
    publishStatus: 'DRAFT',
    startTime: '',
    endTime: '',
    remark: '',
    scopes: [],
    questions: [createQuestion(1)]
  };
}

const form = reactive(createForm());

function resetForm() {
  Object.assign(form, createForm());
  detail.value = null;
  publishTasks.value = [];
  activeId.value = null;
}

function fillForm(data) {
  Object.assign(form, {
    id: data.id || null,
    questionnaireCode: data.questionnaireCode || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    questionnaireType: data.questionnaireType || '',
    targetObjectType: data.targetObjectType || 'IN_SCHOOL_STUDENT',
    targetObjectId: data.targetObjectId || null,
    anonymousFlag: data.anonymousFlag ?? 0,
    publishStatus: data.publishStatus || 'DRAFT',
    startTime: data.startTime ? String(data.startTime).slice(0, 19) : '',
    endTime: data.endTime ? String(data.endTime).slice(0, 19) : '',
    remark: data.remark || ''
  });

  form.scopes = (data.scopes || []).map((scope) => ({
    key: nextKey('scope'),
    scopeType: scope.scopeType || 'GRADE',
    scopeId: scope.scopeId || null,
    remark: scope.remark || ''
  }));

  form.questions = (data.questions || []).map((question, index) => ({
    key: nextKey('question'),
    questionCode: question.questionCode || `Q${index + 1}`,
    questionText: question.questionText || '',
    questionType: question.questionType || 'SINGLE',
    isRequired: question.isRequired ?? 1,
    sortNo: question.sortNo ?? index + 1,
    minSelect: question.minSelect ?? 1,
    maxSelect: question.maxSelect ?? 1,
    scoreWeight: question.scoreWeight ?? 1,
    matrixType: question.matrixType || '',
    remark: question.remark || '',
    options: (question.options || []).map((option, optionIndex) => ({
      key: nextKey('option'),
      optionCode: option.optionCode || `OPT_${optionIndex + 1}`,
      optionText: option.optionText || '',
      optionValue: option.optionValue || String(optionIndex + 1),
      optionScore: option.optionScore ?? optionIndex + 1,
      isOther: option.isOther ?? 0,
      sortNo: option.sortNo ?? optionIndex + 1,
      remark: option.remark || ''
    })),
    matrixRows: (question.matrixRows || []).map((row, rowIndex) => ({
      key: nextKey('row'),
      rowCode: row.rowCode || `ROW_${rowIndex + 1}`,
      rowText: row.rowText || '',
      sortNo: row.sortNo ?? rowIndex + 1,
      remark: row.remark || ''
    })),
    matrixColumns: (question.matrixColumns || []).map((column, columnIndex) => ({
      key: nextKey('col'),
      colCode: column.colCode || `COL_${columnIndex + 1}`,
      colText: column.colText || '',
      colValue: column.colValue || String(columnIndex + 1),
      sortNo: column.sortNo ?? columnIndex + 1,
      remark: column.remark || ''
    }))
  }));
}

function statusTagType(status) {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'PUBLISHING') return 'warning';
  if (status === 'PUBLISH_FAILED') return 'danger';
  return 'info';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function resolveScopeOptions(scopeType) {
  if (scopeType === 'GRADE') return gradeOptions.value;
  if (scopeType === 'CLASS') return classOptions.value;
  if (scopeType === 'MAJOR') return majorOptions.value;
  return [];
}

async function loadLookups() {
  const [grades, classes, majors] = await Promise.all([
    fetchGrades(),
    fetchClasses(),
    fetchMajors()
  ]);
  gradeOptions.value = grades || [];
  classOptions.value = classes || [];
  majorOptions.value = majors || [];
}

async function loadPublishTasks(id) {
  if (!id) {
    publishTasks.value = [];
    return;
  }
  loading.tasks = true;
  try {
    const page = await fetchSurveyPublishTasks(id, { pageNum: 1, pageSize: 20 });
    publishTasks.value = page.records || [];
  } finally {
    loading.tasks = false;
  }
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchSurveyQuestionnaires({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      publishStatus: filters.publishStatus,
      questionnaireType: filters.questionnaireType,
      targetObjectType: filters.targetObjectType,
      keyword: filters.keyword
    });
    questionnaires.value = page.records || [];
    pager.total = Number(page.total || 0);

    if (!activeId.value && questionnaires.value.length) {
      await selectQuestionnaire(questionnaires.value[0].id);
    }
  } finally {
    loading.page = false;
  }
}

async function selectQuestionnaire(id) {
  if (!id) return;
  activeId.value = id;
  const response = await fetchSurveyQuestionnaireDetail(id);
  detail.value = response;
  fillForm(response);
  await loadPublishTasks(id);
}

function addScope() {
  form.scopes.push(createScope());
}

function removeScope(index) {
  form.scopes.splice(index, 1);
}

function addQuestion() {
  form.questions.push(createQuestion(form.questions.length + 1));
}

function removeQuestion(index) {
  form.questions.splice(index, 1);
  if (!form.questions.length) {
    form.questions.push(createQuestion(1));
  }
}

function addOption(question) {
  question.options.push(createOption(question.options.length + 1));
}

function removeOption(question, index) {
  question.options.splice(index, 1);
}

function addMatrixRow(question) {
  question.matrixRows.push(createMatrixRow(question.matrixRows.length + 1));
}

function removeMatrixRow(question, index) {
  question.matrixRows.splice(index, 1);
}

function addMatrixColumn(question) {
  question.matrixColumns.push(createMatrixColumn(question.matrixColumns.length + 1));
}

function removeMatrixColumn(question, index) {
  question.matrixColumns.splice(index, 1);
}

function normalizeQuestion(question, index) {
  const payload = {
    questionCode: question.questionCode,
    questionText: question.questionText,
    questionType: question.questionType,
    isRequired: question.isRequired,
    sortNo: question.sortNo || index + 1,
    minSelect: question.minSelect,
    maxSelect: question.maxSelect,
    scoreWeight: question.scoreWeight,
    matrixType: question.matrixType,
    remark: question.remark
  };

  if (['SINGLE', 'MULTIPLE', 'SCALE'].includes(question.questionType)) {
    payload.options = (question.options || []).map((option, optionIndex) => ({
      optionCode: option.optionCode || `OPT_${optionIndex + 1}`,
      optionText: option.optionText,
      optionValue: option.optionValue || String(optionIndex + 1),
      optionScore: option.optionScore ?? optionIndex + 1,
      isOther: option.isOther ?? 0,
      sortNo: option.sortNo ?? optionIndex + 1,
      remark: option.remark || ''
    }));
  }

  if (question.questionType === 'MATRIX') {
    payload.matrixRows = (question.matrixRows || []).map((row, rowIndex) => ({
      rowCode: row.rowCode || `ROW_${rowIndex + 1}`,
      rowText: row.rowText,
      sortNo: row.sortNo ?? rowIndex + 1,
      remark: row.remark || ''
    }));
    payload.matrixColumns = (question.matrixColumns || []).map((column, columnIndex) => ({
      colCode: column.colCode || `COL_${columnIndex + 1}`,
      colText: column.colText,
      colValue: column.colValue || String(columnIndex + 1),
      sortNo: column.sortNo ?? columnIndex + 1,
      remark: column.remark || ''
    }));
  }

  return payload;
}

function buildPayload() {
  return {
    questionnaireCode: form.questionnaireCode,
    title: form.title,
    subtitle: form.subtitle,
    questionnaireType: form.questionnaireType,
    targetObjectType: form.targetObjectType,
    targetObjectId: form.targetObjectId,
    anonymousFlag: form.anonymousFlag,
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    remark: form.remark,
    scopes: form.scopes.map((scope) => ({
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      remark: scope.remark
    })),
    questions: form.questions.map(normalizeQuestion)
  };
}

function startCreate() {
  resetForm();
}

function resetFilters() {
  filters.publishStatus = '';
  filters.questionnaireType = '';
  filters.targetObjectType = '';
  filters.keyword = '';
  pager.pageNum = 1;
  loadPage();
}

async function saveQuestionnaire() {
  loading.save = true;
  try {
    const payload = buildPayload();
    const saved = form.id
      ? await updateSurveyQuestionnaire(form.id, payload)
      : await createSurveyQuestionnaire(payload);
    detail.value = saved;
    fillForm(saved);
    activeId.value = saved.id;
    await loadPage();
    await loadPublishTasks(saved.id);
    ElMessage.success(form.id ? '问卷已更新' : '问卷已创建');
  } finally {
    loading.save = false;
  }
}

async function callPublishAction(action) {
  if (!form.id) return;
  loading.publish = true;
  try {
    if (action === 'publish') {
      await publishSurveyQuestionnaire(form.id, { remark: '前端发布' });
      ElMessage.success('发布任务已提交');
    } else if (action === 'retry') {
      await retryPublishSurveyQuestionnaire(form.id, { remark: '前端重推' });
      ElMessage.success('重推任务已提交');
    } else if (action === 'remind') {
      await remindSurveyQuestionnaire(form.id, { remark: '前端截止提醒' });
      ElMessage.success('提醒任务已提交');
    } else if (action === 'revoke') {
      await revokeSurveyQuestionnaire(form.id, { remark: '前端撤回' });
      ElMessage.success('问卷已撤回');
    } else if (action === 'end') {
      await endSurveyQuestionnaire(form.id, { remark: '前端结束' });
      ElMessage.success('问卷已结束');
    }
    await selectQuestionnaire(form.id);
    await loadPage();
  } finally {
    loading.publish = false;
  }
}

function handlePublish() {
  return callPublishAction('publish');
}

function handleRetryPublish() {
  return callPublishAction('retry');
}

function handleDeadlineReminder() {
  return callPublishAction('remind');
}

async function handleRevoke() {
  try {
    await ElMessageBox.confirm('撤回后本问卷将停止继续发放，是否继续？', '撤回确认', { type: 'warning' });
  } catch {
    return;
  }
  await callPublishAction('revoke');
}

async function handleEnd() {
  try {
    await ElMessageBox.confirm('结束后将不可继续填报，是否继续？', '结束确认', { type: 'warning' });
  } catch {
    return;
  }
  await callPublishAction('end');
}

async function handleDelete() {
  if (!form.id) return;
  try {
    await ElMessageBox.confirm('删除后问卷与题目结构将一并移除，是否继续？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }
  loading.delete = true;
  try {
    await deleteSurveyQuestionnaire(form.id);
    resetForm();
    await loadPage();
    ElMessage.success('问卷已删除');
  } finally {
    loading.delete = false;
  }
}

async function handlePreview() {
  if (!form.id) return;
  previewDetail.value = await previewSurveyQuestionnaire(form.id);
  previewVisible.value = true;
}

onMounted(async () => {
  await Promise.all([loadLookups(), loadPage()]);
});
</script>

<style scoped>
.survey-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1.2fr) 360px;
  gap: 20px;
}

.survey-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.survey-list-item {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfaf7 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.survey-list-item:hover,
.survey-list-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.survey-list-item__head,
.question-card__head,
.editor-block__head,
.question-subsection__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.survey-list-item__title,
.question-card__title {
  font-weight: 600;
  color: var(--text-primary);
}

.survey-list-item__code,
.survey-list-item__desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.survey-list-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.survey-editor {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.survey-form-grid,
.question-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.editor-block {
  display: grid;
  gap: 12px;
}

.scope-list,
.question-list {
  display: grid;
  gap: 14px;
}

.scope-row,
.question-option-row {
  display: grid;
  grid-template-columns: 160px 240px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.question-card,
.publish-kpi {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.question-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-subsection,
.matrix-shell {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.editor-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.publish-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.publish-kpi__label {
  font-size: 12px;
  color: var(--text-light);
}

.publish-kpi__value {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 28px;
  color: #1b4c57;
}

.preview-question + .preview-question {
  margin-top: 18px;
}

.preview-question__title {
  font-weight: 600;
  color: var(--text-primary);
}

.preview-required {
  color: #c53030;
}

.preview-option-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--text-secondary);
}

.preview-matrix {
  margin-top: 10px;
  color: var(--text-secondary);
}

@media (max-width: 1480px) {
  .survey-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .survey-form-grid,
  .question-grid,
  .publish-kpis,
  .scope-row,
  .question-option-row {
    grid-template-columns: 1fr;
  }
}
</style>
