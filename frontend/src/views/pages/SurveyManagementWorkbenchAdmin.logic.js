import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createSurveyQuestionnaire,
  deleteSurveyQuestionnaire,
  endSurveyQuestionnaire,
  fetchSurveyQuestionnaireDetail,
  fetchSurveyQuestionnaires,
  fetchSurveyResponseOverview,
  publishSurveyQuestionnaire,
  updateSurveyQuestionnaire
} from '../../api/survey';
import { useUserStore } from '../../store/user';

const MAX_SURVEY_QUESTION_COUNT = 50;

const surveyTypeOptions = [
  { label: '课程评价', value: 'COURSE_EVALUATION' },
  { label: '教学反馈', value: 'TEACHING_FEEDBACK' },
  { label: '实习评价', value: 'INTERNSHIP_REVIEW' },
  { label: '毕业跟踪', value: 'GRADUATION_TRACKING' },
  { label: '用人单位调查', value: 'EMPLOYER_SURVEY' }
];

const audienceOptions = [
  { label: '学生', value: 'STUDENT' },
  { label: '教师', value: 'TEACHER' },
  { label: '全体', value: 'ALL' }
];

const questionTypeOptions = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '评分题', value: 'rating' },
  { label: '填空题', value: 'text' },
  { label: '矩阵题', value: 'matrix' }
];

const publishStatusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '发布中', value: 'PUBLISHING' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '发布失败', value: 'PUBLISH_FAILED' },
  { label: '已撤回', value: 'REVOKED' },
  { label: '已结束', value: 'ENDED' }
];

const questionTypeLabelMap = questionTypeOptions.reduce((accumulator, item) => {
  accumulator[item.value] = item.label;
  return accumulator;
}, {});

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createOption(label, index) {
  return {
    id: uid('option'),
    label,
    value: String(index),
    score: index
  };
}

function createMatrixRows() {
  return [
    { id: uid('row'), label: '教学准备', sortNo: 1 },
    { id: uid('row'), label: '课堂组织', sortNo: 2 },
    { id: uid('row'), label: '互动反馈', sortNo: 3 }
  ];
}

function createMatrixColumns() {
  return [
    { id: uid('col'), label: '非常满意', value: '5', sortNo: 1 },
    { id: uid('col'), label: '满意', value: '4', sortNo: 2 },
    { id: uid('col'), label: '一般', value: '3', sortNo: 3 },
    { id: uid('col'), label: '需改进', value: '2', sortNo: 4 }
  ];
}

function createQuestion(type = 'single', index = 1) {
  const base = {
    id: uid('question'),
    code: `Q${index}`,
    title: '',
    description: '',
    type,
    required: true,
    sortNo: index,
    options: [],
    rows: [],
    columns: [],
    placeholder: '请输入你的回答',
    minSelect: 1,
    maxSelect: 1
  };

  if (type === 'single') {
    base.title = '你对本次课程整体满意度如何？';
    base.options = ['非常满意', '满意', '一般', '不满意'].map((item, optionIndex) => createOption(item, optionIndex + 1));
  }

  if (type === 'multiple') {
    base.title = '你认为本次课程最有帮助的环节有哪些？';
    base.options = ['案例讲解', '课堂讨论', '作业讲评', '实验实践'].map((item, optionIndex) => createOption(item, optionIndex + 1));
    base.maxSelect = 4;
  }

  if (type === 'rating') {
    base.title = '请为本次教学支持度打分';
    base.options = ['1分', '2分', '3分', '4分', '5分'].map((item, optionIndex) => createOption(item, optionIndex + 1));
  }

  if (type === 'text') {
    base.title = '请填写你最希望改进的一点';
    base.placeholder = '请用一句话描述你的建议';
  }

  if (type === 'matrix') {
    base.title = '请按维度评价本次问卷对象';
    base.rows = createMatrixRows();
    base.columns = createMatrixColumns();
  }

  return base;
}

function createEmptySurveyModel() {
  return {
    id: null,
    code: '',
    title: '',
    subtitle: '',
    description: '',
    surveyType: 'COURSE_EVALUATION',
    audienceRole: 'STUDENT',
    scene: '',
    anonymous: true,
    status: 'DRAFT',
    expectedCount: 0,
    deadline: '',
    channel: '',
    coverColor: '#1f4f5c',
    tags: [],
    updatedAt: '',
    startTime: '',
    questionTargetCount: 2,
    questions: [
      createQuestion('single', 1),
      createQuestion('text', 2)
    ]
  };
}

function toUiQuestionType(type) {
  if (type === 'SINGLE') return 'single';
  if (type === 'MULTIPLE') return 'multiple';
  if (type === 'SCALE') return 'rating';
  if (type === 'TEXT') return 'text';
  if (type === 'MATRIX') return 'matrix';
  return 'single';
}

function toApiQuestionType(type) {
  if (type === 'single') return 'SINGLE';
  if (type === 'multiple') return 'MULTIPLE';
  if (type === 'rating') return 'SCALE';
  if (type === 'text') return 'TEXT';
  if (type === 'matrix') return 'MATRIX';
  return 'SINGLE';
}

function toDateTimeInput(value) {
  if (!value) {
    return '';
  }
  return String(value).replace(' ', 'T').slice(0, 16);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 16);
}

function typeLabel(type) {
  return surveyTypeOptions.find((item) => item.value === type)?.label || type;
}

function mapSurveyListItem(record) {
  const questionCount = Number(record?.questionCount || 0);
  return {
    id: record.id,
    title: record.title || '未命名问卷',
    code: record.questionnaireCode || '',
    status: record.publishStatus || 'DRAFT',
    surveyType: record.questionnaireType || 'COURSE_EVALUATION',
    audienceRole: record.targetObjectType || 'ALL',
    scene: record.subtitle || typeLabel(record.questionnaireType || 'COURSE_EVALUATION'),
    updatedAt: record.updatedAt || record.createdAt || '',
    deadline: toDateTimeInput(record.endTime),
    questions: Array.from({ length: questionCount }, (_, index) => ({ id: `${record.id}_${index}` }))
  };
}

function mapDetailToEditor(detail, overviewMap) {
  return {
    id: detail.id,
    code: detail.questionnaireCode || '',
    title: detail.title || '',
    subtitle: detail.subtitle || '',
    description: detail.remark || '',
    surveyType: detail.questionnaireType || 'COURSE_EVALUATION',
    audienceRole: detail.targetObjectType || 'ALL',
    scene: detail.subtitle || '',
    anonymous: Number(detail.anonymousFlag || 0) === 1,
    status: detail.publishStatus || 'DRAFT',
    expectedCount: Number(overviewMap[detail.id]?.targetCount || 0),
    deadline: toDateTimeInput(detail.endTime),
    channel: '',
    coverColor: '#1f4f5c',
    tags: [],
    updatedAt: detail.updatedAt || detail.createdAt || '',
    startTime: toDateTimeInput(detail.startTime),
    questionTargetCount: Number(detail.questionCount || detail.questions?.length || 1),
    questions: (detail.questions || []).map((question, index) => ({
      id: question.id || uid('question'),
      code: question.questionCode || `Q${index + 1}`,
      title: question.questionText || '',
      description: question.remark || '',
      type: toUiQuestionType(question.questionType),
      required: Number(question.isRequired || 0) === 1,
      sortNo: question.sortNo || index + 1,
      options: (question.options || []).map((option, optionIndex) => ({
        id: option.id || uid('option'),
        label: option.optionText || '',
        value: option.optionValue || String(optionIndex + 1),
        score: Number(option.optionScore || optionIndex + 1)
      })),
      rows: (question.matrixRows || []).map((row, rowIndex) => ({
        id: row.id || uid('row'),
        label: row.rowText || '',
        sortNo: row.sortNo || rowIndex + 1
      })),
      columns: (question.matrixColumns || []).map((column, columnIndex) => ({
        id: column.id || uid('col'),
        label: column.colText || '',
        value: column.colValue || String(columnIndex + 1),
        sortNo: column.sortNo || columnIndex + 1
      })),
      placeholder: question.questionType === 'TEXT' ? '请输入你的回答' : '',
      minSelect: question.minSelect ?? 1,
      maxSelect: question.maxSelect ?? 1
    }))
  };
}

function buildQuestionCode(index, saveToken) {
  return `Q${index + 1}_${saveToken}`.slice(0, 50);
}

function buildQuestionPayload(question, index, saveToken) {
  const payload = {
    questionCode: buildQuestionCode(index, saveToken),
    questionText: (question.title || '').trim(),
    questionType: toApiQuestionType(question.type),
    isRequired: question.required ? 1 : 0,
    sortNo: index + 1,
    minSelect: question.type === 'multiple' ? Number(question.minSelect || 1) : null,
    maxSelect: question.type === 'multiple' ? Number(question.maxSelect || Math.max(question.options.length, 1)) : null,
    scoreWeight: null,
    matrixType: null,
    remark: question.description?.trim() || null,
    options: null,
    matrixRows: null,
    matrixColumns: null
  };

  if (['single', 'multiple', 'rating'].includes(question.type)) {
    payload.options = (question.options || []).map((option, optionIndex) => ({
      optionCode: `O${optionIndex + 1}`,
      optionText: (option.label || '').trim(),
      optionValue: String(option.value || optionIndex + 1),
      optionScore: Number(option.score ?? optionIndex + 1),
      isOther: 0,
      sortNo: optionIndex + 1,
      remark: null
    }));
  }

  if (question.type === 'matrix') {
    payload.matrixRows = (question.rows || []).map((row, rowIndex) => ({
      rowCode: `R${rowIndex + 1}`,
      rowText: (row.label || '').trim(),
      sortNo: rowIndex + 1,
      remark: null
    }));
    payload.matrixColumns = (question.columns || []).map((column, columnIndex) => ({
      colCode: `C${columnIndex + 1}`,
      colText: (column.label || '').trim(),
      colValue: String(column.value || columnIndex + 1),
      sortNo: columnIndex + 1,
      remark: null
    }));
  }

  return payload;
}

export function useSurveyManagementWorkbenchAdmin() {
  const userStore = useUserStore();
  const statusFilters = [{ label: '全部', value: 'ALL' }, ...publishStatusOptions];
  const surveys = ref([]);
  const activeStatus = ref('ALL');
  const selectedQuestionId = ref('');
  const previewVisible = ref(false);
  const publishVisible = ref(false);
  const tagInput = ref('');
  const responseOverviewMap = reactive({});
  const loading = reactive({
    list: false,
    save: false,
    publish: false
  });
  const editor = reactive(createEmptySurveyModel());

  const filteredSurveys = computed(() => {
    if (activeStatus.value === 'ALL') {
      return surveys.value;
    }
    return surveys.value.filter((item) => item.status === activeStatus.value);
  });

  const summary = computed(() => ({
    total: surveys.value.length,
    published: surveys.value.filter((item) => item.status === 'PUBLISHED').length,
    draft: surveys.value.filter((item) => item.status === 'DRAFT').length,
    responses: Object.values(responseOverviewMap).reduce(
      (total, item) => total + Number(item?.submittedCount || 0),
      0
    )
  }));

  const selectedQuestion = computed(() => (
    editor.questions.find((item) => item.id === selectedQuestionId.value) || null
  ));

  const questionSummaryText = computed(() => {
    const summaryMap = editor.questions.reduce((accumulator, question) => {
      const label = questionTypeLabelMap[question.type] || question.type;
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});
    const text = Object.entries(summaryMap).map(([label, count]) => `${label}${count}题`);
    return text.length ? text.join(' / ') : '尚未添加题目';
  });

  function assignEditor(survey) {
    const next = {
      ...createEmptySurveyModel(),
      ...deepClone(survey || {})
    };
    next.questions = Array.isArray(next.questions) ? next.questions : [];
    next.tags = Array.isArray(next.tags) ? next.tags : [];
    next.questionTargetCount = Math.min(
      MAX_SURVEY_QUESTION_COUNT,
      Math.max(1, Number(next.questionTargetCount || next.questions.length || 1))
    );
    Object.assign(editor, next);
    editor.questions = next.questions;
    editor.tags = next.tags;
    selectedQuestionId.value = editor.questions[0]?.id || '';
  }

  async function loadResponseOverviews(records = []) {
    Object.keys(responseOverviewMap).forEach((key) => {
      delete responseOverviewMap[key];
    });
    const publishedIds = records
      .filter((item) => item.status === 'PUBLISHED')
      .map((item) => item.id);
    if (!publishedIds.length) {
      return;
    }
    const results = await Promise.allSettled(
      publishedIds.map((id) => fetchSurveyResponseOverview(id))
    );
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        responseOverviewMap[publishedIds[index]] = result.value;
      }
    });
  }

  async function loadSurveys(targetId = '') {
    loading.list = true;
    try {
      const page = await fetchSurveyQuestionnaires({
        pageNum: 1,
        pageSize: 200
      });
      const records = Array.isArray(page?.records) ? page.records.map(mapSurveyListItem) : [];
      surveys.value = records;
      await loadResponseOverviews(records);
      const fallbackId = targetId || editor.id || records[0]?.id || null;
      if (!fallbackId) {
        assignEditor(createEmptySurveyModel());
        return;
      }
      await selectSurvey(fallbackId);
    } finally {
      loading.list = false;
    }
  }

  function statusLabel(status) {
    return publishStatusOptions.find((item) => item.value === status)?.label || status || '草稿';
  }

  function statusTagType(status) {
    if (status === 'PUBLISHED') return 'success';
    if (status === 'PUBLISHING') return 'warning';
    if (status === 'PUBLISH_FAILED') return 'danger';
    return 'info';
  }

  function questionTypeLabel(type) {
    return questionTypeOptions.find((item) => item.value === type)?.label || type;
  }

  function audienceLabel(role) {
    return audienceOptions.find((item) => item.value === role)?.label || role;
  }

  function createSurvey() {
    assignEditor(createEmptySurveyModel());
  }

  async function selectSurvey(id) {
    if (!id) {
      return;
    }
    const detail = await fetchSurveyQuestionnaireDetail(id);
    assignEditor(mapDetailToEditor(detail, responseOverviewMap));
  }

  function validateEditor() {
    if (!editor.title.trim()) {
      ElMessage.warning('请先填写问卷标题');
      return false;
    }
    if (!editor.questions.length) {
      ElMessage.warning('请至少保留 1 道题目');
      return false;
    }
    if (editor.questions.some((question) => !question.title.trim())) {
      ElMessage.warning('请先填写完整题目内容');
      return false;
    }
    if (editor.questions.some((question) => (
      ['single', 'multiple', 'rating'].includes(question.type)
      && (!(question.options || []).length || question.options.some((option) => !option.label.trim()))
    ))) {
      ElMessage.warning('选择题和评分题需要完整选项');
      return false;
    }
    if (editor.questions.some((question) => (
      question.type === 'matrix'
      && (
        !(question.rows || []).length
        || !(question.columns || []).length
        || question.rows.some((row) => !row.label.trim())
        || question.columns.some((column) => !column.label.trim())
      )
    ))) {
      ElMessage.warning('矩阵题需要完整的行列配置');
      return false;
    }
    return true;
  }

  function normalizeQuestions() {
    editor.questions = editor.questions.slice(0, MAX_SURVEY_QUESTION_COUNT).map((question, index) => {
      const nextQuestion = {
        ...question,
        code: (question.code || `Q${index + 1}`).trim(),
        title: question.title || '',
        description: question.description || '',
        sortNo: index + 1,
        required: question.required !== false,
        options: Array.isArray(question.options) ? question.options : [],
        rows: Array.isArray(question.rows) ? question.rows : [],
        columns: Array.isArray(question.columns) ? question.columns : []
      };
      nextQuestion.options = nextQuestion.options.map((option, optionIndex) => ({
        ...option,
        label: option.label || '',
        value: String(option.value || optionIndex + 1),
        score: Number(option.score ?? optionIndex + 1)
      }));
      nextQuestion.rows = nextQuestion.rows.map((row, rowIndex) => ({
        ...row,
        label: row.label || '',
        sortNo: rowIndex + 1
      }));
      nextQuestion.columns = nextQuestion.columns.map((column, columnIndex) => ({
        ...column,
        label: column.label || '',
        value: String(column.value || columnIndex + 1),
        sortNo: columnIndex + 1
      }));
      if (nextQuestion.type === 'multiple') {
        nextQuestion.minSelect = Number(nextQuestion.minSelect || 1);
        nextQuestion.maxSelect = Number(nextQuestion.maxSelect || Math.max(nextQuestion.options.length, 1));
      }
      return nextQuestion;
    });
    editor.questionTargetCount = Math.min(
      MAX_SURVEY_QUESTION_COUNT,
      Math.max(editor.questions.length, 1)
    );
  }

function buildSavePayload() {
  const saveToken = Date.now().toString(36);
  return {
      questionnaireCode: (editor.code || `SUR-${Date.now().toString().slice(-6)}`).trim(),
      title: editor.title.trim(),
      subtitle: editor.subtitle.trim() || null,
      questionnaireType: editor.surveyType,
      targetObjectType: editor.audienceRole,
      targetObjectId: null,
      anonymousFlag: editor.anonymous ? 1 : 0,
      startTime: editor.startTime || null,
      endTime: editor.deadline || null,
      remark: editor.description.trim() || null,
      scopes: [],
      questions: editor.questions.map((question, index) => buildQuestionPayload(question, index, saveToken))
    };
  }

  async function saveCurrentInternal(showMessage = true) {
    normalizeQuestions();
    if (!validateEditor()) {
      return null;
    }
    loading.save = true;
    try {
      const payload = buildSavePayload();
      const saved = editor.id
        ? await updateSurveyQuestionnaire(editor.id, payload)
        : await createSurveyQuestionnaire(payload);
      await loadSurveys(saved.id);
      if (showMessage) {
        ElMessage.success('问卷已保存');
      }
      return saved;
    } finally {
      loading.save = false;
    }
  }

  async function saveCurrent() {
    await saveCurrentInternal(true);
  }

  async function duplicateCurrent() {
    normalizeQuestions();
    if (!validateEditor()) {
      return;
    }
    loading.save = true;
    try {
      const payload = buildSavePayload();
      payload.questionnaireCode = `${payload.questionnaireCode}-COPY`;
      payload.title = `${payload.title}（副本）`;
      payload.startTime = null;
      payload.endTime = null;
      const saved = await createSurveyQuestionnaire(payload);
      await loadSurveys(saved.id);
      ElMessage.success('已创建问卷副本');
    } finally {
      loading.save = false;
    }
  }

  async function removeCurrent() {
    if (!editor.id) {
      return;
    }
    try {
      await ElMessageBox.confirm('删除后当前问卷将被移除，是否继续？', '删除问卷', {
        type: 'warning'
      });
    } catch {
      return;
    }
    await deleteSurveyQuestionnaire(editor.id);
    ElMessage.success('问卷已删除');
    await loadSurveys();
  }

  function appendQuestion(type) {
    if (editor.questions.length >= MAX_SURVEY_QUESTION_COUNT) {
      ElMessage.warning(`单份问卷最多支持 ${MAX_SURVEY_QUESTION_COUNT} 道题目`);
      editor.questionTargetCount = MAX_SURVEY_QUESTION_COUNT;
      return;
    }
    const question = createQuestion(type, editor.questions.length + 1);
    editor.questions.push(question);
    normalizeQuestions();
    selectedQuestionId.value = question.id;
  }

  async function applyQuestionCount() {
    const nextCount = Math.min(
      MAX_SURVEY_QUESTION_COUNT,
      Math.max(1, Number(editor.questionTargetCount || 1))
    );
    const currentCount = editor.questions.length;
    if (nextCount === currentCount) {
      ElMessage.info('当前题目数量已经等于目标数量');
      return;
    }
    if (nextCount > currentCount) {
      for (let index = currentCount; index < nextCount; index += 1) {
        editor.questions.push(createQuestion('single', index + 1));
      }
      normalizeQuestions();
      selectedQuestionId.value = editor.questions[currentCount]?.id || editor.questions[0]?.id || '';
      ElMessage.success(`已补齐到 ${nextCount} 题`);
      return;
    }
    try {
      await ElMessageBox.confirm(
        `当前共有 ${currentCount} 题，调整为 ${nextCount} 题会删除末尾多出的题目，是否继续？`,
        '调整题目数量',
        { type: 'warning' }
      );
    } catch {
      editor.questionTargetCount = Math.max(currentCount, 1);
      return;
    }
    editor.questions = editor.questions.slice(0, nextCount);
    normalizeQuestions();
    selectedQuestionId.value = editor.questions[0]?.id || '';
    ElMessage.success(`已调整为 ${nextCount} 题`);
  }

  function moveQuestion(index, offset) {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= editor.questions.length) {
      return;
    }
    const next = [...editor.questions];
    const [current] = next.splice(index, 1);
    next.splice(targetIndex, 0, current);
    editor.questions = next;
    normalizeQuestions();
  }

  function removeQuestion(index) {
    const removed = editor.questions[index];
    editor.questions.splice(index, 1);
    normalizeQuestions();
    if (selectedQuestionId.value === removed?.id) {
      selectedQuestionId.value = editor.questions[0]?.id || '';
    }
  }

  function appendOption(question) {
    question.options.push({
      id: uid('option'),
      label: `选项 ${question.options.length + 1}`,
      value: `${question.options.length + 1}`,
      score: question.options.length + 1
    });
  }

  function removeOption(question, optionIndex) {
    question.options.splice(optionIndex, 1);
  }

  function appendMatrixRow(question) {
    question.rows.push({
      id: uid('row'),
      label: `维度 ${question.rows.length + 1}`,
      sortNo: question.rows.length + 1
    });
  }

  function removeMatrixRow(question, rowIndex) {
    question.rows.splice(rowIndex, 1);
  }

  function appendMatrixColumn(question) {
    question.columns.push({
      id: uid('col'),
      label: `评价 ${question.columns.length + 1}`,
      value: `${question.columns.length + 1}`,
      sortNo: question.columns.length + 1
    });
  }

  function removeMatrixColumn(question, columnIndex) {
    question.columns.splice(columnIndex, 1);
  }

  function appendTag() {
    const value = tagInput.value.trim();
    if (!value) {
      return;
    }
    if (!editor.tags.includes(value)) {
      editor.tags.push(value);
    }
    tagInput.value = '';
  }

  function removeTag(tag) {
    editor.tags = editor.tags.filter((item) => item !== tag);
  }

  function openPreview() {
    normalizeQuestions();
    previewVisible.value = true;
  }

  function openPublishDialog() {
    normalizeQuestions();
    if (!validateEditor()) {
      return;
    }
    if (!editor.deadline) {
      ElMessage.warning('请先设置问卷截止时间');
      return;
    }
    publishVisible.value = true;
  }

  async function publishCurrent() {
    if (editor.status === 'PUBLISHED') {
      ElMessage.warning('当前问卷已发布');
      publishVisible.value = false;
      return;
    }
    if (!editor.startTime) {
      editor.startTime = toDateTimeInput(new Date().toISOString());
    }
    const saved = await saveCurrentInternal(false);
    if (!saved) {
      return;
    }
    loading.publish = true;
    try {
      await publishSurveyQuestionnaire(saved.id, {
        operatorUserId: userStore.userInfo.id || null,
        remark: editor.description.trim() || null
      });
      publishVisible.value = false;
      await loadSurveys(saved.id);
      ElMessage.success('问卷已发布');
    } finally {
      loading.publish = false;
    }
  }

  async function closeCurrentSurvey() {
    if (!editor.id || editor.status !== 'PUBLISHED') {
      return;
    }
    await endSurveyQuestionnaire(editor.id, {
      operatorUserId: userStore.userInfo.id || null,
      remark: editor.description.trim() || null
    });
    await loadSurveys(editor.id);
    ElMessage.success('当前问卷已结束回收');
  }

  async function restoreSeeds() {
    await loadSurveys(editor.id);
    ElMessage.success('问卷数据已重新加载');
  }

  onMounted(() => {
    loadSurveys();
  });

  return {
    surveyTypeOptions,
    audienceOptions,
    questionTypeOptions,
    maxQuestionCount: MAX_SURVEY_QUESTION_COUNT,
    statusFilters,
    surveys,
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
    normalizeQuestions,
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
  };
}
