import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ROLES } from '../../data/navigation';
import { ROLE_LABEL_MAP, useUserStore } from '../../store/user';
import {
  downloadSurveyResponses,
  fetchSurveyFillView,
  fetchSurveyQuestionnaireDetail,
  fetchSurveyQuestionStats,
  fetchSurveyQuestionnaires,
  fetchSurveyResponseDetail,
  fetchSurveyResponseOverview,
  fetchSurveyResponses,
  submitSurveyResponse
} from '../../api/survey';

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

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 16);
}

function typeLabel(type) {
  return surveyTypeOptions.find((item) => item.value === type)?.label || type;
}

function audienceLabel(role) {
  return audienceOptions.find((item) => item.value === role)?.label || role;
}

function questionTypeLabel(type) {
  const normalized = type === 'SINGLE'
    ? 'single'
    : type === 'MULTIPLE'
      ? 'multiple'
      : type === 'SCALE'
        ? 'rating'
        : type === 'TEXT'
          ? 'text'
          : type === 'MATRIX'
            ? 'matrix'
            : type;
  return questionTypeOptions.find((item) => item.value === normalized)?.label || type;
}

function toUiQuestionType(type) {
  if (type === 'SINGLE') return 'single';
  if (type === 'MULTIPLE') return 'multiple';
  if (type === 'SCALE') return 'rating';
  if (type === 'TEXT') return 'text';
  if (type === 'MATRIX') return 'matrix';
  return 'single';
}

function mapQuestion(question, index) {
  return {
    id: question.id,
    sortNo: question.sortNo || index + 1,
    code: question.questionCode || `Q${index + 1}`,
    title: question.questionText || '',
    description: question.remark || '',
    type: toUiQuestionType(question.questionType),
    required: Number(question.isRequired || 0) === 1,
    minSelect: question.minSelect ?? 1,
    maxSelect: question.maxSelect ?? 1,
    options: (question.options || []).map((option, optionIndex) => ({
      id: option.id,
      label: option.optionText || '',
      value: option.optionValue || String(optionIndex + 1)
    })),
    rows: (question.matrixRows || []).map((row, rowIndex) => ({
      id: row.id,
      label: row.rowText || '',
      sortNo: row.sortNo || rowIndex + 1
    })),
    columns: (question.matrixColumns || []).map((column, columnIndex) => ({
      id: column.id,
      label: column.colText || '',
      value: column.colValue || String(columnIndex + 1),
      sortNo: column.sortNo || columnIndex + 1
    })),
    placeholder: question.questionType === 'TEXT' ? '请输入你的回答' : ''
  };
}

function mapQuestionnaire(detail) {
  return {
    id: detail.id,
    code: detail.questionnaireCode || '',
    title: detail.title || '',
    subtitle: detail.subtitle || '',
    surveyType: detail.questionnaireType || 'COURSE_EVALUATION',
    audienceRole: detail.targetObjectType || 'ALL',
    anonymous: Number(detail.anonymousFlag || 0) === 1,
    deadline: detail.endTime || '',
    coverColor: '#1f4f5c',
    questions: (detail.questions || []).map(mapQuestion)
  };
}

function createAnswerState() {
  return {
    singleValue: '',
    multiValues: [],
    text: '',
    matrix: {}
  };
}

function clearAnswerState(answerState) {
  Object.keys(answerState).forEach((key) => {
    delete answerState[key];
  });
}

function roleToRespondentType(role) {
  if (role === ROLES.TEACHER) return 'TEACHER';
  if (role === ROLES.STUDENT) return 'STUDENT';
  return 'ALL';
}

export function useSurveyFillWorkbench() {
  const userStore = useUserStore();
  const activeTab = ref(userStore.userInfo.role === ROLES.SUPER ? 'stats' : 'fill');
  const surveyCards = ref([]);
  const selectedSurveyId = ref('');
  const selectedSurvey = ref(null);
  const answerState = reactive({});
  const publishedSurveys = ref([]);
  const fillViewMap = reactive({});

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
  const selectedEntry = computed(() => surveyCards.value.find((item) => item.id === selectedSurveyId.value) || null);
  const selectedSubmitBlocked = computed(() => {
    if (!selectedEntry.value) {
      return true;
    }
    if (selectedEntry.value.alreadySubmitted) {
      return true;
    }
    return Number(selectedEntry.value.canSubmit ?? 0) !== 1;
  });
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
      return '查看面向教师的问卷并完成填写。';
    }
    if (userStore.userInfo.role === ROLES.STUDENT) {
      return '查看面向学生的问卷并完成填写。';
    }
    return '查看问卷填报入口、回收进度和统计结果。';
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

  function ensureAnswerState(question) {
    if (!answerState[question.id]) {
      answerState[question.id] = createAnswerState();
    }
  }

  async function loadPublishedSurveyCatalog() {
    const page = await fetchSurveyQuestionnaires({
      pageNum: 1,
      pageSize: 200,
      publishStatus: 'PUBLISHED'
    });
    publishedSurveys.value = Array.isArray(page?.records)
      ? page.records.map((item) => ({
        id: item.id,
        code: item.questionnaireCode || '',
        title: item.title || '',
        surveyType: item.questionnaireType || 'COURSE_EVALUATION',
        audienceRole: item.targetObjectType || 'ALL',
        deadline: item.endTime || ''
      }))
      : [];
  }

  async function loadSurveyCards() {
    await loadPublishedSurveyCatalog();

    if (isAdmin.value) {
      surveyCards.value = publishedSurveys.value.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: '',
        scene: typeLabel(item.surveyType),
        surveyType: item.surveyType,
        audienceRole: item.audienceRole,
        deadline: item.deadline,
        alreadySubmitted: true,
        responseId: null,
        canSubmit: 0,
        submitMessage: '统计查看模式'
      }));
    } else {
      const results = await Promise.allSettled(
        publishedSurveys.value.map((item) => fetchSurveyFillView(item.id, userStore.userInfo.id))
      );
      const cards = [];
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return;
        }
        const fillView = result.value;
        fillViewMap[publishedSurveys.value[index].id] = fillView;
        if (String(fillView.submitMessage || '').includes('not within the questionnaire scope')) {
          return;
        }
        const questionnaire = fillView.questionnaire || {};
        cards.push({
          id: fillView.questionnaireId,
          title: fillView.title || questionnaire.title || publishedSurveys.value[index].title,
          subtitle: questionnaire.subtitle || '',
          scene: questionnaire.subtitle || typeLabel(questionnaire.questionnaireType || publishedSurveys.value[index].surveyType),
          surveyType: questionnaire.questionnaireType || publishedSurveys.value[index].surveyType,
          audienceRole: questionnaire.targetObjectType || publishedSurveys.value[index].audienceRole,
          deadline: fillView.endTime || publishedSurveys.value[index].deadline,
          alreadySubmitted: Number(fillView.alreadySubmitted || 0) === 1,
          responseId: fillView.submittedResponseId || null,
          canSubmit: Number(fillView.canSubmit || 0),
          submitMessage: fillView.submitMessage || ''
        });
      });
      surveyCards.value = cards;
    }

    if (!surveyCards.value.length) {
      selectedSurveyId.value = '';
      selectedSurvey.value = null;
      clearAnswerState(answerState);
      return;
    }

    const preferred = selectedSurveyId.value
      || surveyCards.value.find((item) => !item.alreadySubmitted)?.id
      || surveyCards.value[0].id;
    await selectSurvey(preferred);
  }

  async function fillExistingResponse(questionnaireId, responseId) {
    if (!responseId) {
      return;
    }
    const detail = await fetchSurveyResponseDetail(questionnaireId, responseId);
    (detail?.answers || []).forEach((answer) => {
      const current = answerState[answer.questionId];
      if (!current) {
        return;
      }
      current.text = answer.answerText || '';
      current.singleValue = answer.selectedOptionTexts?.length
        ? selectedSurvey.value?.questions
          .find((question) => question.id === answer.questionId)
          ?.options.find((option) => answer.selectedOptionTexts.includes(option.label))?.value || ''
        : '';
      current.multiValues = selectedSurvey.value?.questions
        .find((question) => question.id === answer.questionId)
        ?.options.filter((option) => answer.selectedOptionTexts?.includes(option.label))
        .map((option) => option.value) || [];
      current.matrix = {};
      (answer.matrixAnswers || []).forEach((matrixAnswer) => {
        const question = selectedSurvey.value?.questions.find((item) => item.id === answer.questionId);
        const row = question?.rows.find((item) => item.label === matrixAnswer.rowText);
        const column = question?.columns.find((item) => item.label === matrixAnswer.columnText);
        if (row && column) {
          current.matrix[row.id] = column.value;
        }
      });
    });
  }

  async function selectSurvey(id) {
    selectedSurveyId.value = id;
    clearAnswerState(answerState);

    if (isAdmin.value) {
      const detail = await fetchSurveyQuestionnaireDetail(id);
      selectedSurvey.value = mapQuestionnaire(detail);
    } else {
      const fillView = fillViewMap[id] || await fetchSurveyFillView(id, userStore.userInfo.id);
      fillViewMap[id] = fillView;
      selectedSurvey.value = mapQuestionnaire(fillView.questionnaire || {});
    }

    (selectedSurvey.value?.questions || []).forEach((question) => {
      answerState[question.id] = createAnswerState();
      ensureAnswerState(question);
    });

    if (selectedEntry.value?.alreadySubmitted && selectedEntry.value?.responseId) {
      await fillExistingResponse(id, selectedEntry.value.responseId);
    }
  }

  function buildAnswerPayload() {
    return (selectedSurvey.value?.questions || []).map((question) => {
      const current = answerState[question.id] || createAnswerState();
      if (question.type === 'text') {
        return {
          questionId: question.id,
          answerText: current.text || ''
        };
      }
      if (question.type === 'matrix') {
        const matrixSelections = Object.entries(current.matrix || {})
          .map(([rowId, columnValue]) => {
            const column = question.columns.find((item) => item.value === columnValue);
            return column ? { rowId: Number(rowId), columnId: column.id } : null;
          })
          .filter(Boolean);
        return {
          questionId: question.id,
          matrixSelections
        };
      }
      if (question.type === 'multiple') {
        return {
          questionId: question.id,
          optionIds: question.options
            .filter((option) => (current.multiValues || []).includes(option.value))
            .map((option) => option.id)
        };
      }
      const option = question.options.find((item) => item.value === current.singleValue);
      return {
        questionId: question.id,
        optionIds: option ? [option.id] : []
      };
    });
  }

  function validateBeforeSubmit() {
    for (const question of selectedSurvey.value?.questions || []) {
      const current = answerState[question.id] || createAnswerState();
      if (!question.required) {
        continue;
      }
      if (question.type === 'text' && !(current.text || '').trim()) {
        ElMessage.warning(`请完成第 ${question.sortNo} 题`);
        return false;
      }
      if (question.type === 'matrix' && !Object.keys(current.matrix || {}).length) {
        ElMessage.warning(`请完成第 ${question.sortNo} 题`);
        return false;
      }
      if (question.type === 'multiple') {
        const count = (current.multiValues || []).length;
        if (!count) {
          ElMessage.warning(`请完成第 ${question.sortNo} 题`);
          return false;
        }
        if (question.minSelect && count < question.minSelect) {
          ElMessage.warning(`第 ${question.sortNo} 题至少选择 ${question.minSelect} 项`);
          return false;
        }
        if (question.maxSelect && count > question.maxSelect) {
          ElMessage.warning(`第 ${question.sortNo} 题最多选择 ${question.maxSelect} 项`);
          return false;
        }
      }
      if (['single', 'rating'].includes(question.type) && !current.singleValue) {
        ElMessage.warning(`请完成第 ${question.sortNo} 题`);
        return false;
      }
    }
    return true;
  }

  async function submitSurvey() {
    if (isAdmin.value || !selectedSurvey.value) {
      return;
    }
    if (selectedEntry.value?.alreadySubmitted) {
      return;
    }
    if (Number(selectedEntry.value?.canSubmit ?? 0) !== 1) {
      ElMessage.warning(selectedEntry.value?.submitMessage || '当前问卷暂时不可提交');
      return;
    }
    if (!validateBeforeSubmit()) {
      return;
    }
    try {
    await submitSurveyResponse(selectedSurvey.value.id, {
      respondentUserId: userStore.userInfo.id,
      respondentName: userStore.userInfo.realName || userStore.userInfo.accountId || '',
      respondentType: roleToRespondentType(userStore.userInfo.role),
      answers: buildAnswerPayload()
    });
    ElMessage.success('答卷已提交');
    await loadSurveyCards();
    if (statsSurveyId.value === selectedSurvey.value.id) {
      await loadStats();
    }
    } catch {
      return;
    }
  }

  async function loadStats() {
    if (!statsSurveyId.value) {
      return;
    }
    const [overview, stats, page] = await Promise.all([
      fetchSurveyResponseOverview(statsSurveyId.value),
      fetchSurveyQuestionStats(statsSurveyId.value),
      fetchSurveyResponses(statsSurveyId.value, {
        pageNum: 1,
        pageSize: 200
      })
    ]);

    Object.assign(statsOverview, {
      targetCount: Number(overview?.targetCount || 0),
      submittedCount: Number(overview?.submittedCount || 0),
      pendingCount: Number(overview?.pendingCount || 0),
      recoveryRate: Number(overview?.recoveryRate || 0)
    });

    questionStats.value = (stats || []).map((item) => ({
      questionId: item.questionId,
      questionCode: item.questionCode,
      questionText: item.questionText,
      questionType: item.questionType,
      responseCount: item.responseCount,
      optionStats: (item.optionStats || []).map((option) => ({
        optionId: option.optionId,
        optionText: option.optionText,
        selectCount: option.count
      })),
      matrixCellStats: (item.matrixCellStats || []).map((cell) => ({
        rowId: cell.rowId,
        rowText: cell.rowText,
        columnId: cell.columnId,
        columnText: cell.columnText,
        selectCount: cell.count
      })),
      textAnswers: item.textAnswers || []
    }));

    responseRows.value = Array.isArray(page?.records) ? page.records : [];
  }

  async function openResponseDetail(responseId) {
    responseDetail.value = await fetchSurveyResponseDetail(statsSurveyId.value, responseId);
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

  async function downloadCsv() {
    if (!statsSurveyId.value) {
      return;
    }
    await downloadSurveyResponses(statsSurveyId.value);
  }

  onMounted(async () => {
    await loadSurveyCards();
    statsSurveyId.value = publishedSurveys.value[0]?.id || '';
    if (statsSurveyId.value) {
      await loadStats();
    }
  });

  return {
    ROLES,
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
  };
}
