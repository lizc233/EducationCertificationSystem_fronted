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

export function fetchSurveyQuestionnaires(params) {
  return get('/surveys/questionnaires', params);
}

export function fetchSurveyQuestionnaireDetail(id) {
  return get(`/surveys/questionnaires/${id}`);
}

export function previewSurveyQuestionnaire(id) {
  return get(`/surveys/questionnaires/${id}/preview`);
}

export function fetchSurveyPublishTasks(id, params) {
  return get(`/surveys/questionnaires/${id}/publish-tasks`, params);
}

export function createSurveyQuestionnaire(data) {
  return post('/surveys/questionnaires', data);
}

export function updateSurveyQuestionnaire(id, data) {
  return put(`/surveys/questionnaires/${id}`, data);
}

export function deleteSurveyQuestionnaire(id) {
  return del(`/surveys/questionnaires/${id}`);
}

export function publishSurveyQuestionnaire(id, data) {
  return post(`/surveys/questionnaires/${id}/publish`, data);
}

export function retryPublishSurveyQuestionnaire(id, data) {
  return post(`/surveys/questionnaires/${id}/retry-publish`, data);
}

export function revokeSurveyQuestionnaire(id, data) {
  return post(`/surveys/questionnaires/${id}/revoke`, data);
}

export function endSurveyQuestionnaire(id, data) {
  return post(`/surveys/questionnaires/${id}/end`, data);
}

export function remindSurveyQuestionnaire(id, data) {
  return post(`/surveys/questionnaires/${id}/deadline-reminder`, data);
}

export function fetchSurveyFillView(questionnaireId, respondentUserId) {
  return get(`/surveys/questionnaires/${questionnaireId}/fill`, { respondentUserId });
}

export function submitSurveyResponse(questionnaireId, data) {
  return post(`/surveys/questionnaires/${questionnaireId}/responses/submit`, data);
}

export function fetchSurveyResponses(questionnaireId, params) {
  return get(`/surveys/questionnaires/${questionnaireId}/responses`, params);
}

export function fetchSurveyResponseDetail(questionnaireId, responseId) {
  return get(`/surveys/questionnaires/${questionnaireId}/responses/${responseId}`);
}

export function fetchSurveyResponseOverview(questionnaireId) {
  return get(`/surveys/questionnaires/${questionnaireId}/response-stats/overview`);
}

export function fetchSurveyQuestionStats(questionnaireId) {
  return get(`/surveys/questionnaires/${questionnaireId}/response-stats/questions`);
}

export function buildSurveyResponseDownloadUrl(questionnaireId, params) {
  const query = buildQuery(params);
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/surveys/questionnaires/${questionnaireId}/download/responses${query ? `?${query}` : ''}`;
}
