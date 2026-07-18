import { del, get, post, put } from './http';

export function fetchImprovePlans(params, cfg) {
  return get('/improve/plans', params, cfg);
}

export function fetchOverdueImprovePlans(params) {
  return get('/improve/plans/overdue', params);
}

export function fetchImprovePlanDetail(id) {
  return get(`/improve/plans/${id}`);
}

export function createImprovePlan(data) {
  return post('/improve/plans', data);
}

export function updateImprovePlan(id, data) {
  return put(`/improve/plans/${id}`, data);
}

export function deleteImprovePlan(id) {
  return del(`/improve/plans/${id}`);
}

export function startImprovePlan(id) {
  return post(`/improve/plans/${id}/start`);
}

export function completeImprovePlan(id) {
  return post(`/improve/plans/${id}/complete`);
}

export function verifyImprovePlan(id, data) {
  return post(`/improve/plans/${id}/verify`, data);
}

export function remindImprovePlan(id, data) {
  return post(`/improve/plans/${id}/remind`, data);
}

export function updateImproveActionProgress(actionId, data) {
  return post(`/improve/plans/actions/${actionId}/progress`, data);
}

export function addImproveRecord(actionId, data) {
  return post(`/improve/plans/actions/${actionId}/records`, data);
}

export function updateImproveRecord(recordId, data) {
  return put(`/improve/plans/records/${recordId}`, data);
}

export function deleteImproveRecord(recordId) {
  return del(`/improve/plans/records/${recordId}`);
}

