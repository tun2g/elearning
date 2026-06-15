import type { NotificationList } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export type { Notification, NotificationList } from '@elearning/contracts';

export const useNotifications = createQuery<NotificationList, void, AxiosError>({
  queryKey: queryKeys.notifications,
  fetcher: () => client.get<NotificationList>('/notifications').then(r => r.data),
  refetchInterval: 60_000,
});

export const useMarkNotificationRead = createMutation<NotificationList, string, AxiosError>({
  mutationFn: id => client.patch<NotificationList>(`/notifications/${id}/read`).then(r => r.data),
});

export const useMarkAllNotificationsRead = createMutation<NotificationList, void, AxiosError>({
  mutationFn: () => client.post<NotificationList>('/notifications/read-all').then(r => r.data),
});
