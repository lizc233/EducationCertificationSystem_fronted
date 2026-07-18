import { get, post } from './http';

export function generateAiReportChapter(chapterId, data) {
  return post(`/ai/reports/chapters/${chapterId}/generate`, data);
}

export function confirmAiReportChapter(chapterId, data) {
  return post(`/ai/reports/chapters/${chapterId}/confirm`, data);
}

export function generateAiImproveSuggestion(data) {
  return post('/ai/improve-suggestions/generate', data);
}

export function confirmAiImproveSuggestion(data) {
  return post('/ai/improve-suggestions/confirm', data);
}

export function retryAiRequest(requestId, data) {
  return post(`/ai/requests/${requestId}/retry`, data);
}

export function fetchAiRequestHistory(params) {
  return get('/ai/requests', params);
}

export function fetchAiRequestDetail(requestId) {
  return get(`/ai/requests/${requestId}`);
}

export function rebuildAiKnowledge(data) {
  return post('/ai/knowledge/rebuild', data);
}
