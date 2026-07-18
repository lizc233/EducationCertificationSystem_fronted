import { del, get, post, put } from './http';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }
    query.append(key, value);
  });
  return query.toString();
}

export function fetchEvalModels(params) {
  return get('/eval/models', params);
}

export function fetchEvalModelDetail(id) {
  return get(`/eval/models/${id}`);
}

export function createEvalModel(data) {
  return post('/eval/models', data);
}

export function updateEvalModel(id, data) {
  return put(`/eval/models/${id}`, data);
}

export function deleteEvalModel(id) {
  return del(`/eval/models/${id}`);
}

export function enableEvalModel(id) {
  return post(`/eval/models/${id}/enable`);
}

export function disableEvalModel(id) {
  return post(`/eval/models/${id}/disable`);
}

export function updateEvalModelStatus(id, status) {
  return post(`/eval/models/${id}/status`, null, { params: { status } });
}

export function fetchCourseTargetResults(params) {
  return get('/eval/course-target-results', params);
}

export function fetchCourseTargetResultDetail(id) {
  return get(`/eval/course-target-results/${id}`);
}

export function calculateCourseTargetResults(data) {
  return post('/eval/course-target-results/calculate', data);
}

export function recalculateCourseTargetResult(id, remark) {
  return post(`/eval/course-target-results/${id}/recalculate`, null, {
    params: remark ? { remark } : {}
  });
}

export function confirmCourseTargetResult(id) {
  return post(`/eval/course-target-results/${id}/confirm`);
}

export function fetchGraduationRequirementResults(params) {
  return get('/eval/graduation-requirement-results', params);
}

export function fetchGraduationWarnings(params) {
  return get('/eval/graduation-requirement-results/warnings', params);
}

export function fetchGraduationRequirementResultDetail(id) {
  return get(`/eval/graduation-requirement-results/${id}`);
}

export function calculateGraduationRequirementResults(data) {
  return post('/eval/graduation-requirement-results/calculate', data);
}

export function recalculateGraduationRequirementResult(id, remark) {
  return post(`/eval/graduation-requirement-results/${id}/recalculate`, null, {
    params: remark ? { remark } : {}
  });
}

export function confirmGraduationRequirementResult(id) {
  return post(`/eval/graduation-requirement-results/${id}/confirm`);
}

export function closeGraduationWarning(id, remark) {
  return post(`/eval/graduation-requirement-results/${id}/close-warning`, null, {
    params: remark ? { remark } : {}
  });
}

export function notifyGraduationWarnings(data) {
  return post('/eval/graduation-requirement-results/notify-warnings', data);
}

export function fetchDashboardOverview(params) {
  return get('/eval/dashboard/overview', params);
}

export function fetchDashboardSemesterTrend(params) {
  return get('/eval/dashboard/semester-trend', params);
}

export function fetchDashboardCourseDistribution(params) {
  return get('/eval/dashboard/course-distribution', params);
}

export function fetchDashboardRequirementDistribution(params) {
  return get('/eval/dashboard/requirement-distribution', params);
}

export function fetchDashboardRequirementMatrix(params) {
  return get('/eval/dashboard/requirement-matrix', params);
}

export function fetchDashboardCourseTargetDetails(params) {
  return get('/eval/dashboard/course-target-details', params);
}

export function fetchDashboardGraduationRequirementDetails(params) {
  return get('/eval/dashboard/graduation-requirement-details', params);
}

export function buildDashboardCourseTargetDownloadUrl(params) {
  const query = buildQuery(params);
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/eval/dashboard/download/course-target-details${query ? `?${query}` : ''}`;
}

export function buildDashboardGraduationRequirementDownloadUrl(params) {
  const query = buildQuery(params);
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/eval/dashboard/download/graduation-requirement-details${query ? `?${query}` : ''}`;
}
