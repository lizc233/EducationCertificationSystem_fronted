import { del, get, post, put } from './http';

export function fetchReportProjects(params) {
  return get('/reports/projects', params);
}

export function fetchReportProjectDetail(id, params) {
  return get(`/reports/projects/${id}`, params);
}

export function createReportProject(data) {
  return post('/reports/projects', data);
}

export function updateReportProject(id, data) {
  return put(`/reports/projects/${id}`, data);
}

export function deleteReportProject(id) {
  return del(`/reports/projects/${id}`);
}

export function saveReportChapters(id, data) {
  return put(`/reports/projects/${id}/chapters`, data);
}

export function saveReportAssignments(id, data) {
  return put(`/reports/projects/${id}/assignments`, data);
}

export function fetchReportDrafts(chapterId) {
  return get(`/reports/projects/chapters/${chapterId}/drafts`);
}

export function saveReportDraft(chapterId, data) {
  return post(`/reports/projects/chapters/${chapterId}/drafts`, data);
}

export function uploadReportDraft(chapterId, formData) {
  return post(`/reports/projects/chapters/${chapterId}/drafts/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function lockReportChapter(chapterId, data) {
  return post(`/reports/projects/chapters/${chapterId}/lock`, data);
}

export function saveReportProgress(projectId, data) {
  return post(`/reports/projects/${projectId}/progress-logs`, data);
}

export function fetchReportProgressBoard(projectId) {
  return get(`/reports/projects/${projectId}/progress-board`);
}

export function generateReportDrafts(projectId, data) {
  return post(`/reports/projects/${projectId}/generate-drafts`, data);
}

export function previewMergedReport(projectId) {
  return get(`/reports/projects/${projectId}/export/preview`);
}

export function buildMergedReportDownloadUrl(projectId) {
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/reports/projects/${projectId}/download/merged`;
}
