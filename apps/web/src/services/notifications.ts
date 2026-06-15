import type { NotificationList } from '@elearning/contracts';

import { apiGet, apiPatch, apiPost } from '@/lib/api';

export type { Notification, NotificationList } from '@elearning/contracts';

export function getNotifications(token: string): Promise<NotificationList> {
  return apiGet<NotificationList>('/notifications', token);
}

export function markNotificationRead(token: string, id: string): Promise<NotificationList> {
  return apiPatch<NotificationList>(`/notifications/${id}/read`, {}, token);
}

export function markAllNotificationsRead(token: string): Promise<NotificationList> {
  return apiPost<NotificationList>('/notifications/read-all', {}, token);
}
