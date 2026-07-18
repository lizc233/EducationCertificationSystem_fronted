import { ROLES } from './navigation';

const STORAGE_KEY = 'education_space_frontend_surveys_v1';
export const MAX_SURVEY_QUESTION_COUNT = 50;

export const SURVEY_TYPE_OPTIONS = [
  { label: '课程评价', value: 'COURSE_EVALUATION' },
  { label: '教学反馈', value: 'TEACHING_FEEDBACK' },
  { label: '实习评价', value: 'INTERNSHIP_REVIEW' },
  { label: '毕业跟踪', value: 'GRADUATION_TRACKING' },
  { label: '用人单位调查', value: 'EMPLOYER_SURVEY' }
];

export const AUDIENCE_OPTIONS = [
  { label: '学生', value: ROLES.STUDENT },
  { label: '教师', value: ROLES.TEACHER },
  { label: '全角色', value: 'ALL' }
];

export const QUESTION_TYPE_OPTIONS = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '评分题', value: 'rating' },
  { label: '填空题', value: 'text' },
  { label: '矩阵题', value: 'matrix' }
];

export const PUBLISH_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '发布中', value: 'PUBLISHED' },
  { label: '已结束', value: 'CLOSED' }
];

const QUESTION_TYPE_MAP = QUESTION_TYPE_OPTIONS.reduce((accumulator, item) => {
  accumulator[item.value] = item.label;
  return accumulator;
}, {});

function nowString() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function createOption(label, index) {
  return {
    id: uid('option'),
    label,
    value: `${index}`,
    score: index,
    allowInput: false
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
    { id: uid('column'), label: '非常满意', value: '5', sortNo: 1 },
    { id: uid('column'), label: '满意', value: '4', sortNo: 2 },
    { id: uid('column'), label: '一般', value: '3', sortNo: 3 },
    { id: uid('column'), label: '需改进', value: '2', sortNo: 4 }
  ];
}

export function createQuestion(type = 'single', index = 1) {
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

export function createEmptySurvey() {
  const createdAt = nowString();
  return {
    id: uid('survey'),
    code: `SUR-${Date.now().toString().slice(-6)}`,
    title: '未命名问卷',
    subtitle: '请补充问卷说明与引导语',
    description: '支持管理员像问卷平台一样维护题型、逻辑结构和发布批次。',
    surveyType: 'COURSE_EVALUATION',
    audienceRole: ROLES.STUDENT,
    scene: '课程过程反馈',
    anonymous: true,
    status: 'DRAFT',
    expectedCount: 120,
    collectedCount: 0,
    publishAt: '',
    deadline: '',
    channel: '站内消息 + 首页待办',
    coverColor: '#1f4f5c',
    tags: ['教学反馈'],
    questionTargetCount: 2,
    questions: [
      createQuestion('single', 1),
      createQuestion('text', 2)
    ],
    responses: [],
    updatedAt: createdAt,
    createdAt
  };
}

function createSeedSurvey(overrides = {}) {
  const survey = {
    ...createEmptySurvey(),
    ...overrides
  };
  survey.questions = overrides.questions ? clone(overrides.questions) : survey.questions;
  survey.responses = overrides.responses ? clone(overrides.responses) : [];
  survey.collectedCount = survey.responses.length;
  return survey;
}

function seedSurveys() {
  const studentSurvey = createSeedSurvey({
    code: 'SUR-260701',
    title: '2026 春季课程教学反馈',
    subtitle: '面向 2025 级学生，聚焦课堂组织、目标达成与学习体验。',
    description: '由管理员统一发布，学生匿名提交，结果用于课程改进和教学诊断。',
    surveyType: 'COURSE_EVALUATION',
    audienceRole: ROLES.STUDENT,
    scene: '课程结课反馈',
    status: 'PUBLISHED',
    expectedCount: 180,
    publishAt: '2026-07-10T09:00:00',
    deadline: '2026-07-25T23:00:00',
    channel: '站内消息 + 辅导员提醒',
    tags: ['学生', '课程反馈'],
    questions: [
      createQuestion('single', 1),
      createQuestion('multiple', 2),
      createQuestion('rating', 3),
      createQuestion('text', 4)
    ],
    responses: [
      {
        id: uid('response'),
        respondentUserId: 3001,
        respondentName: '学生王',
        respondentRole: ROLES.STUDENT,
        submittedAt: '2026-07-12T14:30:00',
        answers: [
          { questionId: 'seed_q_1', type: 'single', value: '非常满意', labels: ['非常满意'] }
        ]
      },
      {
        id: uid('response'),
        respondentUserId: 3002,
        respondentName: '学生赵',
        respondentRole: ROLES.STUDENT,
        submittedAt: '2026-07-13T10:12:00',
        answers: []
      }
    ]
  });
  studentSurvey.questions[0].id = 'seed_q_1';

  const teacherSurvey = createSeedSurvey({
    code: 'SUR-260702',
    title: '教师课程支持条件调研',
    subtitle: '采集任课教师对教学资源、排课与平台支撑的反馈。',
    description: '问卷结果用于管理员协调资源、优化教学服务流程。',
    surveyType: 'TEACHING_FEEDBACK',
    audienceRole: ROLES.TEACHER,
    scene: '学期中支持调研',
    status: 'PUBLISHED',
    expectedCount: 42,
    publishAt: '2026-07-11T08:30:00',
    deadline: '2026-07-28T18:00:00',
    channel: '站内消息 + 教研室通知',
    coverColor: '#5a2f6b',
    tags: ['教师', '资源保障'],
    questions: [
      createQuestion('rating', 1),
      createQuestion('matrix', 2),
      createQuestion('text', 3)
    ],
    responses: [
      {
        id: uid('response'),
        respondentUserId: 2001,
        respondentName: '李老师',
        respondentRole: ROLES.TEACHER,
        submittedAt: '2026-07-14T16:10:00',
        answers: []
      }
    ]
  });

  const draftSurvey = createSeedSurvey({
    code: 'SUR-260703',
    title: '毕业要求达成度跟踪问卷',
    subtitle: '用于毕业生和用人单位双视角的长期追踪。',
    description: '当前为草稿状态，等待管理员配置投放范围与题量结构。',
    surveyType: 'GRADUATION_TRACKING',
    audienceRole: 'ALL',
    scene: '毕业后半年回访',
    status: 'DRAFT',
    expectedCount: 90,
    publishAt: '',
    deadline: '',
    channel: '短信链接 + 邮件',
    coverColor: '#1d6a47',
    tags: ['毕业跟踪', '外部评价'],
    questions: [
      createQuestion('single', 1),
      createQuestion('multiple', 2),
      createQuestion('text', 3)
    ],
    responses: []
  });

  return [studentSurvey, teacherSurvey, draftSurvey];
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeds = seedSurveys();
      writeStore(seeds);
      return seeds;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedSurveys();
  } catch {
    const seeds = seedSurveys();
    writeStore(seeds);
    return seeds;
  }
}

function writeStore(surveys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
}

function normalizeSurvey(survey) {
  const normalized = clone(survey);
  normalized.questions = (normalized.questions || []).slice(0, MAX_SURVEY_QUESTION_COUNT).map((question, index) => ({
    ...question,
    sortNo: index + 1,
    options: question.options || [],
    rows: question.rows || [],
    columns: question.columns || []
  }));
  normalized.questionTargetCount = Math.min(
    MAX_SURVEY_QUESTION_COUNT,
    Math.max(1, Number(normalized.questionTargetCount || normalized.questions.length || 1))
  );
  normalized.collectedCount = (normalized.responses || []).length;
  normalized.updatedAt = nowString();
  return normalized;
}

export function listSurveys() {
  return clone(readStore()).sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

export function getSurveyById(id) {
  return clone(readStore().find((item) => item.id === id) || null);
}

export function saveSurvey(survey) {
  const surveys = readStore();
  const normalized = normalizeSurvey(survey);
  const index = surveys.findIndex((item) => item.id === normalized.id);
  if (index >= 0) {
    normalized.createdAt = surveys[index].createdAt || normalized.createdAt;
    normalized.responses = surveys[index].responses || normalized.responses || [];
    surveys[index] = normalized;
  } else {
    surveys.unshift(normalized);
  }
  writeStore(surveys);
  return clone(normalized);
}

export function removeSurvey(id) {
  const surveys = readStore().filter((item) => item.id !== id);
  writeStore(surveys);
}

export function duplicateSurvey(id) {
  const survey = getSurveyById(id);
  if (!survey) {
    return null;
  }
  const duplicated = {
    ...survey,
    id: uid('survey'),
    code: `${survey.code}-COPY`,
    title: `${survey.title}（副本）`,
    status: 'DRAFT',
    publishAt: '',
    deadline: '',
    responses: [],
    collectedCount: 0,
    createdAt: nowString(),
    updatedAt: nowString(),
    questions: survey.questions.map((question, questionIndex) => ({
      ...question,
      id: uid('question'),
      code: `Q${questionIndex + 1}`,
      options: (question.options || []).map((option) => ({ ...option, id: uid('option') })),
      rows: (question.rows || []).map((row) => ({ ...row, id: uid('row') })),
      columns: (question.columns || []).map((column) => ({ ...column, id: uid('column') }))
    }))
  };
  saveSurvey(duplicated);
  return duplicated;
}

export function publishSurvey(id, publishConfig = {}) {
  const survey = getSurveyById(id);
  if (!survey) {
    return null;
  }
  survey.status = 'PUBLISHED';
  survey.publishAt = publishConfig.publishAt || nowString().slice(0, 16);
  survey.deadline = publishConfig.deadline || survey.deadline;
  survey.expectedCount = Number(publishConfig.expectedCount || survey.expectedCount || 0);
  survey.channel = publishConfig.channel || survey.channel;
  survey.scene = publishConfig.scene || survey.scene;
  return saveSurvey(survey);
}

export function closeSurvey(id) {
  const survey = getSurveyById(id);
  if (!survey) {
    return null;
  }
  survey.status = 'CLOSED';
  return saveSurvey(survey);
}

function matchAudienceRole(audienceRole, role) {
  return audienceRole === 'ALL' || audienceRole === role;
}

export function listAccessibleSurveys(role, userInfo = {}) {
  const userId = userInfo.id;
  return listSurveys()
    .filter((survey) => survey.status === 'PUBLISHED')
    .filter((survey) => role === ROLES.SUPER || matchAudienceRole(survey.audienceRole, role))
    .map((survey) => {
      const existing = (survey.responses || []).find((item) => item.respondentUserId === userId);
      return {
        id: survey.id,
        title: survey.title,
        subtitle: survey.subtitle,
        scene: survey.scene,
        surveyType: survey.surveyType,
        deadline: survey.deadline,
        publishAt: survey.publishAt,
        audienceRole: survey.audienceRole,
        status: survey.status,
        questionCount: survey.questions.length,
        alreadySubmitted: Boolean(existing),
        responseId: existing?.id || null,
        submitMessage: existing
          ? `你已于 ${formatDateTime(existing.submittedAt)} 提交答卷`
          : `共 ${survey.questions.length} 题，截止至 ${formatDateTime(survey.deadline)}`
      };
    });
}

export function submitSurveyResponse(surveyId, userInfo, answers) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return null;
  }
  const response = {
    id: uid('response'),
    respondentUserId: userInfo.id,
    respondentName: userInfo.realName || userInfo.accountId || '未命名用户',
    respondentRole: userInfo.role,
    submittedAt: nowString(),
    answers: clone(answers || [])
  };
  const existingIndex = (survey.responses || []).findIndex((item) => item.respondentUserId === userInfo.id);
  if (existingIndex >= 0) {
    survey.responses[existingIndex] = response;
  } else {
    survey.responses.push(response);
  }
  saveSurvey(survey);
  return response;
}

export function buildSurveyOverview(surveyId) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return null;
  }
  const targetCount = Number(survey.expectedCount || 0);
  const submittedCount = (survey.responses || []).length;
  const pendingCount = Math.max(targetCount - submittedCount, 0);
  const recoveryRate = targetCount > 0 ? Number(((submittedCount / targetCount) * 100).toFixed(1)) : 0;
  return {
    targetCount,
    submittedCount,
    pendingCount,
    recoveryRate,
    questionCount: survey.questions.length,
    averagePerQuestion: survey.questions.length ? Number((submittedCount / survey.questions.length).toFixed(1)) : 0
  };
}

export function buildQuestionStats(surveyId) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return [];
  }

  return survey.questions.map((question) => {
    const relatedAnswers = (survey.responses || [])
      .map((response) => response.answers.find((answer) => answer.questionId === question.id))
      .filter(Boolean);

    const stats = {
      questionId: question.id,
      questionCode: question.code,
      questionText: question.title,
      questionType: question.type,
      responseCount: relatedAnswers.length,
      optionStats: [],
      textAnswers: [],
      matrixCellStats: []
    };

    if (['single', 'multiple', 'rating'].includes(question.type)) {
      stats.optionStats = (question.options || []).map((option) => ({
        optionId: option.id,
        optionText: option.label,
        selectCount: relatedAnswers.filter((answer) => (answer.values || []).includes(option.value)).length
      }));
    }

    if (question.type === 'text') {
      stats.textAnswers = relatedAnswers
        .map((answer) => answer.text)
        .filter(Boolean);
    }

    if (question.type === 'matrix') {
      stats.matrixCellStats = [];
      (question.rows || []).forEach((row) => {
        (question.columns || []).forEach((column) => {
          const selectCount = relatedAnswers.filter((answer) => answer.matrix?.[row.id] === column.value).length;
          stats.matrixCellStats.push({
            rowId: row.id,
            rowText: row.label,
            columnId: column.id,
            columnText: column.label,
            selectCount
          });
        });
      });
    }

    return stats;
  });
}

export function listSurveyResponses(surveyId) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return [];
  }
  return (survey.responses || []).map((response) => ({
    id: response.id,
    respondentName: response.respondentName,
    respondentType: response.respondentRole === ROLES.TEACHER ? '教师' : '学生',
    submitStatus: '已提交',
    answerCount: response.answers.length,
    submittedAt: response.submittedAt
  }));
}

export function getSurveyResponseDetail(surveyId, responseId) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return null;
  }
  const response = (survey.responses || []).find((item) => item.id === responseId);
  if (!response) {
    return null;
  }
  return {
    respondentName: response.respondentName,
    submittedAt: response.submittedAt,
    answers: (response.answers || []).map((answer) => {
      const question = survey.questions.find((item) => item.id === answer.questionId);
      return {
        questionId: answer.questionId,
        questionCode: question?.code || '',
        questionText: question?.title || '',
        questionType: question?.type || '',
        answerText: answer.text || '',
        selectedOptionTexts: (answer.values || []).map((value) => question?.options?.find((item) => item.value === value)?.label || value),
        matrixAnswers: Object.entries(answer.matrix || {}).map(([rowId, value]) => ({
          rowText: question?.rows?.find((item) => item.id === rowId)?.label || rowId,
          columnText: question?.columns?.find((item) => item.value === value)?.label || value
        }))
      };
    })
  };
}

export function exportSurveyResponsesCsv(surveyId) {
  const survey = getSurveyById(surveyId);
  if (!survey) {
    return null;
  }
  const header = ['填报人', '角色', '提交时间', '题目编码', '题目', '答案'];
  const rows = [header.join(',')];

  (survey.responses || []).forEach((response) => {
    (response.answers || []).forEach((answer) => {
      const detail = getSurveyResponseDetail(surveyId, response.id);
      const item = detail?.answers.find((current) => current.questionId === answer.questionId);
      const rendered = item?.answerText
        || item?.selectedOptionTexts?.join(' / ')
        || item?.matrixAnswers?.map((matrixItem) => `${matrixItem.rowText}:${matrixItem.columnText}`).join(' / ')
        || '';
      rows.push([
        response.respondentName,
        response.respondentRole === ROLES.TEACHER ? '教师' : '学生',
        formatDateTime(response.submittedAt),
        item?.questionCode || '',
        item?.questionText || '',
        `"${String(rendered).replaceAll('"', '""')}"`
      ].join(','));
    });
  });

  return new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

export function resetSurveyWorkbench() {
  writeStore(seedSurveys());
}

export function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 16);
}

export function summarizeQuestionTypes(questions = []) {
  return questions.reduce((accumulator, question) => {
    const label = QUESTION_TYPE_MAP[question.type] || question.type;
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});
}
