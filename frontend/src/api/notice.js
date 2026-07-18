import { del, get, put } from './http';

export function fetchInbox(params) {
  return get('/notice/recipients/inbox', params, { baseURL: '' });
}

export function fetchRecipientList(params, cfg = {}) {
  return get('/notice/recipients/list', params, { baseURL: '', ...cfg });
}

export function fetchNoticeMessage(id, cfg = {}) {
  return get(`/notice/messages/${id}`, undefined, { baseURL: '', ...cfg });
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

export function deleteNoticeRecipient(id) {
  return del(`/notice/recipients/${id}`, { baseURL: '' });
}
