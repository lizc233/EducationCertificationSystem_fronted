import { del, get, post, put } from './http';

export function fetchInbox(params, cfg = {}) {
  return get('/notice/recipients/inbox', params, { baseURL: '', ...cfg });
}

export function fetchRecipientList(params, cfg = {}) {
  return get('/notice/recipients/list', params, { baseURL: '', ...cfg });
}

export function fetchNoticeMessage(id, cfg = {}) {
  return get(`/notice/messages/${id}`, undefined, { baseURL: '', ...cfg });
}

export function fetchNoticeMessageList(params, cfg = {}) {
  return get('/notice/messages/list', params, { baseURL: '', ...cfg });
}

export function createNoticeMessage(data, cfg = {}) {
  return post('/notice/messages', data, { baseURL: '', ...cfg });
}

export function updateNoticeMessage(id, data, cfg = {}) {
  return put(`/notice/messages/${id}`, data, { baseURL: '', ...cfg });
}

export function publishNoticeMessage(id, data, cfg = {}) {
  return post(`/notice/messages/${id}/publish`, data, { baseURL: '', ...cfg });
}

export function retryPublishNoticeMessage(id, data, cfg = {}) {
  return post(`/notice/messages/${id}/retry-publish`, data, { baseURL: '', ...cfg });
}

export function fetchUnreadCount(recipientUserId, cfg = {}) {
  return get('/notice/recipients/unread-count', { recipientUserId }, { baseURL: '', ...cfg });
}

export function markNoticeRead(id) {
  return put(`/notice/recipients/${id}/read`, undefined, { baseURL: '' });
}

export function markAllNoticeRead(recipientUserId) {
  return put('/notice/recipients/read-all', undefined, {
    baseURL: '',
    params: { recipientUserId }
  });
}

export function deleteNoticeMessage(id, cfg = {}) {
  return del(`/notice/messages/${id}`, { baseURL: '', ...cfg });
}

export function deleteNoticeRecipient(id) {
  return del(`/notice/recipients/${id}`, { baseURL: '' });
}
