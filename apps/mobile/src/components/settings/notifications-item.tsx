import { useQueryClient } from '@tanstack/react-query';

import { Switch, Text, View } from '@/components/ui';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { queryKeys } from '@/lib/api/query-keys';
import { translate } from '@/lib/i18n';

export function NotificationsItem() {
  const queryClient = useQueryClient();
  const { data } = useSettings();
  const { mutate, isPending } = useUpdateSettings();
  const enabled = data?.notificationEnabled ?? false;

  const toggle = (next: boolean) => {
    mutate(
      { notificationEnabled: next },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }) },
    );
  };

  return (
    <View className="flex-1 flex-row items-center justify-between px-4 py-2">
      <Text tx="settings.daily_reminders" />
      <Switch.Root
        checked={enabled}
        onChange={toggle}
        disabled={isPending}
        accessibilityLabel={translate('settings.daily_reminders')}
      >
        <Switch.Icon checked={enabled} />
      </Switch.Root>
    </View>
  );
}
