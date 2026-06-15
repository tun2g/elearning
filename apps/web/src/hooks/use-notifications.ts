import type { NotificationList } from '@elearning/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { createMutation, createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notifications';

export const useNotifications = createQuery<NotificationList>({
  queryKey: queryKeys.notifications,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getNotifications(token);
  },
  refetchInterval: 60_000,
});

export const useMarkNotificationRead = createMutation({
  mutationFn: (id: string) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return markNotificationRead(token, id);
  },
});

export const useMarkAllNotificationsRead = createMutation({
  mutationFn: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return markAllNotificationsRead(token);
  },
});

/** Writes a fresh NotificationList into the cache after a mutation. */
export function useSyncNotifications() {
  const queryClient = useQueryClient();
  return (list: NotificationList) => queryClient.setQueryData(queryKeys.notifications, list);
}
