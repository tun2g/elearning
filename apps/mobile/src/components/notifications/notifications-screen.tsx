import type { Notification } from '@elearning/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  FocusAwareStatusBar,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { queryKeys } from '@/lib/api/query-keys';

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)
    return 'just now';
  if (mins < 60)
    return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)
    return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function Row({ item, onPress }: { item: Notification; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`border-b border-neutral-100 px-4 py-3 dark:border-neutral-800 ${
        item.readAt ? '' : 'bg-primary-50 dark:bg-primary-900/20'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 font-semibold">{item.title}</Text>
        {!item.readAt && <View className="ml-2 size-2 rounded-full bg-primary-500" />}
      </View>
      <Text className="mt-0.5 text-sm text-neutral-500">{item.body}</Text>
      <Text className="mt-1 text-xs text-neutral-400">{timeAgo(item.createdAt)}</Text>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useNotifications();
  const sync = (list: { unreadCount: number; notifications: Notification[] }) =>
    queryClient.setQueryData(queryKeys.notifications, list);
  const { mutate: markRead } = useMarkNotificationRead({ onSuccess: sync });
  const { mutate: markAll } = useMarkAllNotificationsRead({ onSuccess: sync });

  const items = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="py-1 pr-3">
          <Text className="text-base text-primary-600">‹ Back</Text>
        </Pressable>
        <Text className="text-lg font-bold">Notifications</Text>
        <Pressable onPress={() => markAll()} disabled={unread === 0} className="py-1 pl-3">
          <Text className={`text-sm ${unread === 0 ? 'text-neutral-400' : 'text-primary-600'}`}>Mark all</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {items.length === 0
          ? (
              <Text className="px-4 py-16 text-center text-neutral-500">No notifications yet.</Text>
            )
          : (
              items.map(n => (
                <Row
                  key={n.id}
                  item={n}
                  onPress={() => {
                    if (!n.readAt)
                      markRead(n.id);
                  }}
                />
              ))
            )}
      </ScrollView>
    </SafeAreaView>
  );
}
