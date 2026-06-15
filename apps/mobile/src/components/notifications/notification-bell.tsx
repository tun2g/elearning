import { Link } from 'expo-router';

import { Pressable, Text, View } from '@/components/ui';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationBell() {
  const { data } = useNotifications();
  const unread = data?.unreadCount ?? 0;

  return (
    <Link href="/notifications" asChild>
      <Pressable className="relative size-11 items-center justify-center rounded-2xl bg-white dark:bg-neutral-800">
        <Text className="text-xl">🔔</Text>
        {unread > 0 && (
          <View className="absolute top-1 right-1 min-w-4 items-center rounded-full bg-primary-500 px-1">
            <Text className="text-[10px] font-bold text-white">{unread > 9 ? '9+' : String(unread)}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}
