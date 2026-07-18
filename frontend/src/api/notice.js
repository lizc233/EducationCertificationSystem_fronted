import { del, get, put } from './http';

export function fetchInbox(params) {
  return get('/notice/recipients/inbox', params, { baseURL: '' });
}

export function fetchUnreadCount(recipientUserId) {
  return get('/notice/recipients/unread-count', { recipientUserId }, { baseURL: '' });
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
