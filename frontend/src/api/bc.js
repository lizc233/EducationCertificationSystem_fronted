import { buildApiUrl, del, download, get, post, postForm, put } from './http';

export const versionStatusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'RELEASED' },
  { label: '已停用', value: 'DISABLED' },
  { label: '已归档', value: 'ARCHIVED' }
];

export const supportLevelOptions = [
  { label: '高', value: 'H' },
  { label: '中', value: 'M' },
  { label: '低', value: 'L' }
];

export const reviewStatusOptions = [
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已退回', value: 'REJECTED' }
];

export const taskStatusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已撤回', value: 'REVOKED' }
];

export const publishStatusOptions = [
  { label: '未发布', value: 0 },
  { label: '已发布', value: 1 }
];

export const courseStatusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
];

export const calcStatusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '已完成', value: 'DONE' },
  { label: '已锁定', value: 'LOCKED' }
];

export const submitStatusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' }
];

export const lookupApi = {
  colleges: () => get('/lookups/colleges'),
  majors: () => get('/lookups/majors'),
  grades: () => get('/lookups/grades'),
  classes: () => get('/lookups/classes'),
  courses: () => get('/lookups/courses'),
  teachers: () => get('/lookups/teachers'),
  semesters: () => get('/lookups/semesters'),
  students: () => get('/lookups/students'),
  programVersions: () => get('/lookups/program-versions'),
  targets: () => get('/lookups/targets'),
  requirements: () => get('/lookups/graduation-requirements'),
  indicators: () => get('/lookups/indicator-points'),
  courseObjectives: () => get('/lookups/course-objectives'),
  assessmentMethods: () => get('/lookups/assessment-methods')
};

export const programApi = {
  listVersions: (params) => get('/program/versions', params),
  createVersion: (payload) => post('/program/versions', payload),
  updateVersion: (id, payload) => put(`/program/versions/${id}`, payload),
  deleteVersion: (id) => del(`/program/versions/${id}`),
  updateVersionStatus: (id, status) => post(`/program/versions/${id}/status`, null, { params: { status } }),
  copyVersion: (id, payload) => post(`/program/versions/${id}/copy`, payload),
  listVersionGrades: (id) => get(`/program/versions/${id}/grades`),
  replaceVersionGrades: (id, gradeIds) => put(`/program/versions/${id}/grades`, gradeIds),

  listTargets: (params) => get('/program/targets', params),
  createTarget: (payload) => post('/program/targets', payload),
  updateTarget: (id, payload) => put(`/program/targets/${id}`, payload),
  deleteTarget: (id) => del(`/program/targets/${id}`),

  listRequirements: (params) => get('/program/graduation-requirements', params),
  createRequirement: (payload) => post('/program/graduation-requirements', payload),
  updateRequirement: (id, payload) => put(`/program/graduation-requirements/${id}`, payload),
  deleteRequirement: (id) => del(`/program/graduation-requirements/${id}`),

  listIndicators: (params) => get('/program/indicator-points', params),
  createIndicator: (payload) => post('/program/indicator-points', payload),
  updateIndicator: (id, payload) => put(`/program/indicator-points/${id}`, payload),
  deleteIndicator: (id) => del(`/program/indicator-points/${id}`),

  listTargetSupports: (params) => get('/program/target-supports', params),
  createTargetSupport: (payload) => post('/program/target-supports', payload),
  updateTargetSupport: (id, payload) => put(`/program/target-supports/${id}`, payload),
  deleteTargetSupport: (id) => del(`/program/target-supports/${id}`),

  listIndicatorSupports: (params) => get('/program/indicator-supports', params),
  createIndicatorSupport: (payload) => post('/program/indicator-supports', payload),
  updateIndicatorSupport: (id, payload) => put(`/program/indicator-supports/${id}`, payload),
  deleteIndicatorSupport: (id) => del(`/program/indicator-supports/${id}`),

  listProgramCourses: (params) => get('/program/courses', params),
  createProgramCourse: (payload) => post('/program/courses', payload),
  updateProgramCourse: (id, payload) => put(`/program/courses/${id}`, payload),
  deleteProgramCourse: (id) => del(`/program/courses/${id}`),

  listCourseSupports: (params) => get('/program/course-supports', params),
  createCourseSupport: (payload) => post('/program/course-supports', payload),
  updateCourseSupport: (id, payload) => put(`/program/course-supports/${id}`, payload),
  deleteCourseSupport: (id) => del(`/program/course-supports/${id}`)
};

export const courseApi = {
  listCourses: (params) => get('/courses', params),
  getCourse: (id) => get(`/courses/${id}`),
  createCourse: (payload) => post('/courses', payload),
  updateCourse: (id, payload) => put(`/courses/${id}`, payload),
  deleteCourse: (id) => del(`/courses/${id}`),
  updateCourseStatus: (id, status) => post(`/courses/${id}/status`, null, { params: { status } }),
  exportCourses: (params) => download('/courses/export', params, 'course-list.csv'),

  listObjectives: (courseId) => get(`/courses/${courseId}/objectives`),
  createObjective: (courseId, payload) => post(`/courses/${courseId}/objectives`, payload),
  updateObjective: (id, payload) => put(`/courses/objectives/${id}`, payload),
  deleteObjective: (id) => del(`/courses/objectives/${id}`),

  listObjectiveSupports: (params) => get('/courses/objective-supports', params),
  createObjectiveSupport: (payload) => post('/courses/objective-supports', payload),
  updateObjectiveSupport: (id, payload) => put(`/courses/objective-supports/${id}`, payload),
  deleteObjectiveSupport: (id) => del(`/courses/objective-supports/${id}`),

  listContents: (courseId) => get(`/courses/${courseId}/contents`),
  createContent: (courseId, payload) => post(`/courses/${courseId}/contents`, payload),
  updateContent: (id, payload) => put(`/courses/contents/${id}`, payload),
  deleteContent: (id) => del(`/courses/contents/${id}`),

  listContentRelations: (params) => get('/courses/content-relations', params),
  createContentRelation: (payload) => post('/courses/content-relations', payload),
  updateContentRelation: (id, payload) => put(`/courses/content-relations/${id}`, payload),
  deleteContentRelation: (id) => del(`/courses/content-relations/${id}`),

  listAssessmentMethods: (courseId) => get(`/courses/${courseId}/assessment-methods`),
  createAssessmentMethod: (courseId, payload) => post(`/courses/${courseId}/assessment-methods`, payload),
  updateAssessmentMethod: (id, payload) => put(`/courses/assessment-methods/${id}`, payload),
  deleteAssessmentMethod: (id) => del(`/courses/assessment-methods/${id}`),

  listAssessmentStandards: (params) => get('/courses/assessment-standards', params),
  createAssessmentStandard: (payload) => post('/courses/assessment-standards', payload),
  updateAssessmentStandard: (id, payload) => put(`/courses/assessment-standards/${id}`, payload),
  deleteAssessmentStandard: (id) => del(`/courses/assessment-standards/${id}`)
};

export const teachingApi = {
  listTasks: (params) => get('/teaching/tasks', params),
  listMyTasks: (params) => get('/teaching/my-tasks', params),
  getTask: (id) => get(`/teaching/tasks/${id}`),
  createTask: (payload) => post('/teaching/tasks', payload),
  updateTask: (id, payload) => put(`/teaching/tasks/${id}`, payload),
  deleteTask: (id) => del(`/teaching/tasks/${id}`),
  updateTaskStatus: (id, status) => post(`/teaching/tasks/${id}/status`, null, { params: { status } })
};

export const resourceApi = {
  listResources: (params) => get('/course-resources', params),
  createResource: (payload) => post('/course-resources', payload),
  updateResource: (id, payload) => put(`/course-resources/${id}`, payload),
  deleteResource: (id) => del(`/course-resources/${id}`),
  publishResource: (id, publishStatus) => post(`/course-resources/${id}/publish`, null, { params: { publishStatus } }),
  exportResources: (params) => download('/course-resources/export', params, 'course-resources.csv'),

  listMaterials: (params) => get('/evidence-materials', params),
  createMaterial: (payload) => post('/evidence-materials', payload),
  createMaterialBatch: (payload) => post('/evidence-materials/batch', payload),
  updateMaterial: (id, payload) => put(`/evidence-materials/${id}`, payload),
  deleteMaterial: (id) => del(`/evidence-materials/${id}`),
  reviewMaterial: (id, status, comment) => post(`/evidence-materials/${id}/review`, null, { params: { status, comment } }),
  exportMaterials: (params) => download('/evidence-materials/export', params, 'evidence-materials.csv')
};

export const scoreApi = {
  listBatches: (params) => get('/scores/batches', params),
  getBatch: (id) => get(`/scores/batches/${id}`),
  createBatch: (payload) => post('/scores/batches', payload),
  updateBatch: (id, payload) => put(`/scores/batches/${id}`, payload),
  deleteBatch: (id) => del(`/scores/batches/${id}`),
  recalculateBatch: (id) => post(`/scores/batches/${id}/recalculate`),
  lockBatch: (id) => post(`/scores/batches/${id}/lock`),

  listDetails: (params) => get('/scores/details', params),
  createDetail: (payload) => post('/scores/details', payload),
  updateDetail: (id, payload) => put(`/scores/details/${id}`, payload),
  deleteDetail: (id) => del(`/scores/details/${id}`),
  submitDetail: (id) => post(`/scores/details/${id}/submit`),
  importDetails: (payload) => post('/scores/details/import', payload),
  exportDetails: (params) => download('/scores/details/export', params, 'course-score-details.csv')
};

export const fileApi = {
  upload: (file, payload) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    return postForm('/files/upload', formData);
  },
  detail: (id) => get(`/files/${id}`),
  delete: (id) => del(`/files/${id}`),
  downloadUrl: (id) => buildApiUrl(`/api/files/${id}/download`),
  previewUrl: (id) => buildApiUrl(`/api/files/${id}/preview`)
};

export function buildOptionMap(options = []) {
  return Object.fromEntries(options.map((item) => [String(item.value), item.label]));
}

export function resolveOptionLabel(options = [], value, fallback = '-') {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const matched = options.find((item) => String(item.value) === String(value));
  return matched?.label || String(value);
}
